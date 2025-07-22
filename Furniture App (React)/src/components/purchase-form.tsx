// src/components/purchase-form.tsx (Corrected)
"use client";

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, Copy, UploadCloud, Info, XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { SelectOption, Partner, ItemDefinition, PurchaseData } from '@/types';
import { getEmployeeIdsFS, getPartnerNames, getItemNames, OTHER_ITEM_VALUE } from '@/lib/data';
import { submitPurchase } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { BillPreview } from '@/components/bill-preview';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_TOTAL_FILES = 50;
const MAX_FILE_SIZE_PER_FILE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES_PURCHASE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

const PurchaseItemSchema = z.object({
  id: z.string(),
  clinicCode: z.string().min(1, "Clinic code is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0.01"),
  itemName: z.string().min(1, "Item name is required"),
  customItemName: z.string().optional(),
  itemNameDisplay: z.string(),
}).superRefine((data, ctx) => {
  if (data.itemName === OTHER_ITEM_VALUE && (!data.customItemName || data.customItemName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom item name is required when 'Other' is selected.",
      path: ['customItemName'],
    });
  }
});

const FileSchema = z
  .custom<File>()
  .refine((file) => file.size <= MAX_FILE_SIZE_PER_FILE, `Max file size is 10MB per file.`)
  .refine(
    (file) => ALLOWED_FILE_TYPES_PURCHASE.includes(file.type),
    "Only JPG, PNG, GIF, WEBP, PDF files are allowed."
  );

const FormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  partnerName: z.string().min(1, "Partner name is required"),
  userName: z.string().min(1, "User name is required").max(100, "User name too long"),
  items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
  uploadedFiles: z.array(FileSchema)
    .max(MAX_TOTAL_FILES, `You can upload a maximum of ${MAX_TOTAL_FILES} files.`)
    .optional()
    .default([]),
});

export type PurchaseFormValues = z.infer<typeof FormSchema>;

interface FileWithPreview extends File {
  preview: string;
}

export function PurchaseForm() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [employeeIdOptions, setEmployeeIdOptions] = useState<SelectOption[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<Partner[]>([]);
  const [itemDefinitionOptions, setItemDefinitionOptions] = useState<ItemDefinition[]>([]);

  const [filePreviews, setFilePreviews] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemImagePreviews, setItemImagePreviews] = useState<Record<string, string | null>>({});

  const [totalBill, setTotalBill] = useState(0);
  const [showBillPreviewDialog, setShowBillPreviewDialog] = useState(false);
  const [submittedBillData, setSubmittedBillData] = useState<PurchaseData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, control, handleSubmit, reset, formState: { errors }, setValue, watch, getValues } = useForm<PurchaseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userId: '',
      partnerName: '',
      userName: '',
      items: [{ id: crypto.randomUUID(), clinicCode: '', quantity: 1, price: 0.01, itemName: '', customItemName: '', itemNameDisplay: '' }],
      uploadedFiles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  useEffect(() => {
    const currentTotal = watchedItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
    setTotalBill(currentTotal);
  }, [watchedItems]);

  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      try {
        setEmployeeIdOptions(await getEmployeeIdsFS());
        setPartnerOptions(await getPartnerNames());
        setItemDefinitionOptions(await getItemNames());
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({ variant: "destructive", title: t('errorOccurred'), description: "Could not load required data." });
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, [t, toast]);

  useEffect(() => {
    const newPreviews: Record<string, string | null> = {};
    fields.forEach((field, index) => {
      const currentItemValue = watch(`items.${index}.itemName`);
      if (currentItemValue && currentItemValue !== OTHER_ITEM_VALUE) {
        const def = itemDefinitionOptions.find(i => i.id === currentItemValue);
        newPreviews[field.id] = def ? def.imageUrl : null;
      } else {
        newPreviews[field.id] = null;
      }
    });
    setItemImagePreviews(newPreviews);
  }, [fields, itemDefinitionOptions, watch]);

  const onSubmit = (data: PurchaseFormValues) => {
    startTransition(async () => {
      toast({ title: t('submittingPurchase') });
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('userId', data.userId);
      formDataToSubmit.append('partnerName', data.partnerName);
      formDataToSubmit.append('userName', data.userName);

      const itemsWithDisplayNames = data.items.map(item => ({
        ...item,
        itemNameDisplay: item.itemName === OTHER_ITEM_VALUE
          ? item.customItemName || t('other')
          : itemDefinitionOptions.find(def => def.id === item.itemName)?.name || item.itemName,
      }));
      formDataToSubmit.append('items', JSON.stringify(itemsWithDisplayNames));

      data.uploadedFiles?.forEach((file, index) => {
        formDataToSubmit.append(`uploadedFiles[${index}]`, file);
      });

      const result = await submitPurchase(null, formDataToSubmit);

      if (result.success && result.data) {
        toast({ title: t('operationSuccess'), description: t('billGeneratedSuccess') });

        const billForPreview: PurchaseData = {
          ...(result.data as Omit<PurchaseData, 'createdAt'>), // Cast to ensure base properties are there
          createdAt: {
            toDate: () => new Date(),
            seconds: Math.floor(Date.now() / 1000),
            nanoseconds: 0,
          }
        };

        setSubmittedBillData(billForPreview);
        setShowBillPreviewDialog(true);
        reset();
        setFilePreviews([]);
        setItemImagePreviews({});
        setTotalBill(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: result.message || t('errorOccurred') });
        if (result.errors) {
          console.error("Server validation errors:", result.errors);
        }
      }
    });
  };

  const addNewItem = () => {
    const newItemId = crypto.randomUUID();
    append({ id: newItemId, clinicCode: '', quantity: 1, price: 0.01, itemName: '', customItemName: '', itemNameDisplay: '' });
    setItemImagePreviews(prev => ({ ...prev, [newItemId]: null }));
  };

  const duplicateLastItem = () => {
    if (fields.length > 0) {
      const lastItem = fields[fields.length - 1];
      const newItemId = crypto.randomUUID();
      append({ ...lastItem, id: newItemId, itemNameDisplay: lastItem.itemNameDisplay });
      const lastItemDef = itemDefinitionOptions.find(i => i.id === lastItem.itemName && i.id !== OTHER_ITEM_VALUE);
      setItemImagePreviews(prev => ({ ...prev, [newItemId]: lastItemDef ? lastItemDef.imageUrl : null }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentFiles = getValues('uploadedFiles') || [];
    const newFilesArray = Array.from(event.target.files || []);

    if (currentFiles.length + newFilesArray.length > MAX_TOTAL_FILES) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: t('maxFiles') });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validatedNewFiles: File[] = [];
    const newFilePreviews: FileWithPreview[] = [];

    for (const file of newFilesArray) {
      if (file.size > MAX_FILE_SIZE_PER_FILE) {
        toast({ variant: "destructive", title: t('errorOccurred'), description: `${file.name}: Max file size is 10MB.` });
        continue;
      }
      if (!ALLOWED_FILE_TYPES_PURCHASE.includes(file.type)) {
        toast({ variant: "destructive", title: t('errorOccurred'), description: `${file.name}: Invalid file type. Only Images & PDFs allowed.` });
        continue;
      }
      validatedNewFiles.push(file);
      newFilePreviews.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }

    setValue('uploadedFiles', [...currentFiles, ...validatedNewFiles]);
    setFilePreviews(prev => [...prev, ...newFilePreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadedFile = (indexToRemove: number) => {
    const currentFiles = getValues('uploadedFiles') || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    setValue('uploadedFiles', updatedFiles);

    const updatedPreviews = filePreviews.filter((_, index) => index !== indexToRemove);
    setFilePreviews(updatedPreviews);
  };

  const handleItemNameChange = (fieldId: string, selectedItemId: string, index: number) => {
    setValue(`items.${index}.itemName`, selectedItemId);
    if (selectedItemId !== OTHER_ITEM_VALUE) {
      setValue(`items.${index}.customItemName`, '');
      const selectedItemDefinition = itemDefinitionOptions.find(i => i.id === selectedItemId);
      setValue(`items.${index}.itemNameDisplay`, selectedItemDefinition?.name || selectedItemId);
      setItemImagePreviews(prev => ({
        ...prev,
        [fieldId]: selectedItemDefinition ? selectedItemDefinition.imageUrl : null,
      }));
    } else {
      setValue(`items.${index}.itemNameDisplay`, watch(`items.${index}.customItemName`) || t('other'));
      setItemImagePreviews(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleCustomItemNameChange = (index: number, customName: string) => {
    setValue(`items.${index}.customItemName`, customName);
    if (watch(`items.${index}.itemName`) === OTHER_ITEM_VALUE) {
      setValue(`items.${index}.itemNameDisplay`, customName || t('other'));
    }
  };

  const handleDownloadExcel = () => {
    if (!submittedBillData) return;
    toast({ title: t('generatingExcel') });

    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        [t('userId'), submittedBillData.userId],
        [t('partnerName'), submittedBillData.partnerName],
        [t('userName'), submittedBillData.userName],
        // --- FIX START ---
        // Added a check to ensure uploadedFiles exists before accessing its properties.
        [t('uploadedFilesLabel'), submittedBillData.uploadedFiles && submittedBillData.uploadedFiles.length > 0 ? submittedBillData.uploadedFiles.map(f => f.name).join(', ') : t('noFileUploaded')],
        // --- FIX END ---
        [],
        [t('totalBill'), submittedBillData.totalAmount?.toFixed(2) ?? '0.00']
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Bill Summary");

      const itemsHeader = [t('clinicCode'), t('itemName'), t('quantity'), t('pricePerUnit'), t('itemLineTotal')];
      const itemsData = submittedBillData.items.map(item => [
        item.clinicCode,
        item.itemNameDisplay,
        item.quantity,
        Number(item.price).toFixed(2),
        (Number(item.quantity) * Number(item.price)).toFixed(2)
      ]);
      const wsItems = XLSX.utils.aoa_to_sheet([itemsHeader, ...itemsData]);
      XLSX.utils.book_append_sheet(wb, wsItems, "Item Details");

      XLSX.writeFile(wb, `PurchaseBill_${submittedBillData.userId}_${Date.now()}.xlsx`);
      toast({ title: t('excelDownloadSuccess') });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({ variant: "destructive", title: t('excelDownloadFailed') });
    }
  };

  const translatedItemDefinitions = itemDefinitionOptions.map(item => ({
    ...item,
    label: item.value === OTHER_ITEM_VALUE ? t('other') : item.label,
  }));

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto my-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">{t('appName')}</CardTitle>
          <CardDescription className="text-center">{t('appDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userId">{t('userId')}</Label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData || employeeIdOptions.length === 0}>
                      <SelectTrigger id="userId" className="text-base md:text-sm">
                        <SelectValue placeholder={t('selectUserId')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingData ? (
                          <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                        ) : employeeIdOptions.length > 0 ? (
                          employeeIdOptions.map(emp => (
                            <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_ids" disabled>{t('noEmployeeIds')}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {!isLoadingData && employeeIdOptions.length === 0 && (
                  <Alert variant="default" className="mt-2 text-sm p-3">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('noUserIdsAvailableAdminPrompt')}
                    </AlertDescription>
                  </Alert>
                )}
                {errors.userId && <p className="text-sm text-destructive mt-1">{errors.userId.message}</p>}
              </div>
              <div>
                <Label htmlFor="partnerName">{t('partnerName')}</Label>
                <Controller
                  name="partnerName"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData || partnerOptions.length === 0}>
                      <SelectTrigger id="partnerName" className="text-base md:text-sm">
                        <SelectValue placeholder={t('selectPartnerName')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingData ? (
                          <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                        ) : partnerOptions.length > 0 ? (
                          partnerOptions.map(partner => (
                            <SelectItem key={partner.id} value={partner.name}>{partner.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_partners" disabled>{t('noPartners')}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {!isLoadingData && partnerOptions.length === 0 && (
                  <Alert variant="default" className="mt-2 text-sm p-3">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('noPartners')}
                    </AlertDescription>
                  </Alert>
                )}
                {errors.partnerName && <p className="text-sm text-destructive mt-1">{errors.partnerName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="userName">{t('userName')}</Label>
              <Input id="userName" {...register('userName')} placeholder={t('enterUserName')} className="text-base md:text-sm" />
              {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
            </div>

            <Separator />

            <h3 className="text-xl font-semibold text-secondary">{t('itemsPurchased')}</h3>
            {fields.map((item, index) => {
              const currentItemValueForLogic = watch(`items.${index}.itemName`);
              return (
                <Card key={item.id} className="p-4 space-y-4 bg-muted/30">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-lg">{t('itemDetails')} #{index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`items.${index}.clinicCode`}>{t('clinicCode')}</Label>
                        <Input id={`items.${index}.clinicCode`} {...register(`items.${index}.clinicCode`)} className="text-base md:text-sm" />
                        {errors.items?.[index]?.clinicCode && <p className="text-sm text-destructive mt-1">{errors.items?.[index]?.clinicCode?.message}</p>}
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor={`items.${index}.itemName`}>{t('itemName')}</Label>
                        <Controller
                          name={`items.${index}.itemName`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) => handleItemNameChange(item.id, value, index)}
                              value={field.value}
                              disabled={isLoadingData || translatedItemDefinitions.length === 0}
                            >
                              <SelectTrigger id={`items.${index}.itemName`} className="text-base md:text-sm">
                                <SelectValue placeholder={t('selectItemName')} />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingData ? (
                                  <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                                ) : translatedItemDefinitions.length > 0 ? (
                                  translatedItemDefinitions.map(def => (
                                    <SelectItem key={def.id} value={def.id}>
                                      <div className="flex items-center">
                                        {def.id !== OTHER_ITEM_VALUE && def.imageUrl && (
                                          <Image
                                            src={def.imageUrl}
                                            alt={def.name}
                                            width={24}
                                            height={24}
                                            className="mr-2 rounded-sm object-cover"
                                            data-ai-hint={def.dataAiHint || def.name.toLowerCase().replace(/\s+/g, '')}
                                          />
                                        )}
                                        {def.label}
                                      </div>
                                    </SelectItem>
                                  ))) : (
                                  <SelectItem value="no_items" disabled>{t('noItemDefinitions')}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {currentItemValueForLogic !== OTHER_ITEM_VALUE && itemImagePreviews[item.id] && (
                          <div className="mt-2">
                            <Image
                              src={itemImagePreviews[item.id]!}
                              alt="Selected item preview"
                              width={64}
                              height={64}
                              className="rounded-md border object-cover"
                              data-ai-hint="item preview"
                            />
                          </div>
                        )}
                        {errors.items?.[index]?.itemName && <p className="text-sm text-destructive mt-1">{errors.items?.[index]?.itemName?.message}</p>}
                      </div>
                    </div>
                    {currentItemValueForLogic === OTHER_ITEM_VALUE && (
                      <div>
                        <Label htmlFor={`items.${index}.customItemName`}>{t('customItemName')}</Label>
                        <Input
                          id={`items.${index}.customItemName`}
                          {...register(`items.${index}.customItemName`)}
                          placeholder={t('enterCustomItemName')}
                          onChange={(e) => handleCustomItemNameChange(index, e.target.value)}
                          className="text-base md:text-sm"
                        />
                        {errors.items?.[index]?.customItemName && <p className="text-sm text-destructive mt-1">{errors.items?.[index]?.customItemName?.message}</p>}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`items.${index}.quantity`}>{t('quantity')}</Label>
                        <Input id={`items.${index}.quantity`} type="number" {...register(`items.${index}.quantity`)} className="text-base md:text-sm" />
                        {errors.items?.[index]?.quantity && <p className="text-sm text-destructive mt-1">{errors.items?.[index]?.quantity?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`items.${index}.price`}>{t('pricePerUnit')}</Label>
                        <Input id={`items.${index}.price`} type="number" step="0.01" {...register(`items.${index}.price`)} className="text-base md:text-sm" />
                        {errors.items?.[index]?.price && <p className="text-sm text-destructive mt-1">{errors.items?.[index]?.price?.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 pt-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} aria-label={t('removeItem')}>
                      <Trash2 className="h-4 w-4 mr-1" /> {t('removeItem')}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            {errors.items && typeof errors.items === 'object' && !Array.isArray(errors.items) && (
              <p className="text-sm text-destructive mt-1">{errors.items.message || errors.items.root?.message}</p>
            )}
            {!isLoadingData && itemDefinitionOptions.filter(i => i.id !== OTHER_ITEM_VALUE).length === 0 && (
              <Alert variant="default" className="mt-2 text-sm p-3">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('noItemDefinitions')}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button type="button" variant="outline" onClick={addNewItem} className="w-full sm:w-auto text-base md:text-sm">
                <PlusCircle className="h-4 w-4 mr-2" /> {t('addItem')}
              </Button>
              {fields.length > 0 && (
                <Button type="button" variant="outline" onClick={duplicateLastItem} className="w-full sm:w-auto text-base md:text-sm">
                  <Copy className="h-4 w-4 mr-2" /> {t('duplicateItem')}
                </Button>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="uploadedFiles-input">{t('uploadFiles')}</Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label htmlFor="uploadedFiles-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 border-primary/50 hover:border-primary">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                    <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                    <p className="mb-1 text-sm text-foreground/80"><span className="font-semibold">{t('clickToUpload') || 'Click to upload'}</span> {t('orDragAndDrop') || 'or drag and drop'}</p>
                    <p className="text-xs text-foreground/60">{t('maxFiles')}</p>
                  </div>
                  <Input
                    id="uploadedFiles-input"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES_PURCHASE.join(',')}
                    ref={fileInputRef}
                  />
                </label>
              </div>
              {filePreviews.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">{t('selectedFiles')}:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {filePreviews.map((file, index) => (
                      <div key={index} className="relative group border rounded-md p-1">
                        {file.type.startsWith('image/') ? (
                          <Image src={file.preview} alt={file.name} width={80} height={80} className="w-full h-20 object-contain rounded" data-ai-hint="file preview" />
                        ) : (
                          <div className="w-full h-20 flex flex-col items-center justify-center bg-muted/30 rounded p-1 text-center">
                            <FileIcon className="w-8 h-8 text-foreground/70" />
                            <p className="text-xs truncate w-full mt-1">{file.name}</p>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeUploadedFile(index)}
                          aria-label={t('removeFile')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.uploadedFiles && <p className="text-sm text-destructive mt-1">{Array.isArray(errors.uploadedFiles) ? errors.uploadedFiles.map(e => e?.message).join(', ') : errors.uploadedFiles.message}</p>}
            </div>

            <Separator />
            <div className="text-right">
              <h3 className="text-xl font-semibold">{t('totalBill')}: <span className="text-primary">{totalBill.toFixed(2)}</span></h3>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base md:text-sm" disabled={isPending || isLoadingData}>
              {isPending ? `${t('submittingPurchase')}...` : t('submit')}
            </Button>

          </form>
        </CardContent>
      </Card>
      {submittedBillData && (
        <BillPreview
          isOpen={showBillPreviewDialog}
          onClose={() => {
            setShowBillPreviewDialog(false);
          }}
          billData={submittedBillData}
          t={t}
          onDownloadExcel={handleDownloadExcel}
        />
      )}
    </>
  );
}

const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);