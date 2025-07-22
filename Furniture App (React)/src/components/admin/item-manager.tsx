// src/components/admin/item-manager.tsx
"use client";

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Trash2, PlusCircle, Edit, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import type { ItemDefinition } from '@/types';
import { getItemDefinitionsFS } from '@/lib/data';
import { addItemDefinitionAction, updateItemDefinitionAction, removeItemDefinitionAction, uploadItemImageAction } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialFormState: Partial<ItemDefinition> = { id: '', name: '', imageUrl: '', dataAiHint: '' };

export function ItemManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<ItemDefinition[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDefinition | null>(null);
  const [formData, setFormData] = useState<Partial<ItemDefinition>>(initialFormState);
  const [itemToRemove, setItemToRemove] = useState<ItemDefinition | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    const rawItems = await getItemDefinitionsFS();
    setItems(rawItems.filter(item => item.id !== 'other_specify_item'));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      // If editing, keep the existing image preview if no new file is chosen
      setImagePreviewUrl(editingItem ? editingItem.imageUrl : null); 
    }
  };

  const handleEdit = (item: ItemDefinition) => {
    setEditingItem(item);
    setFormData({ id: item.id, name: item.name, imageUrl: item.imageUrl, dataAiHint: item.dataAiHint || '' });
    setImagePreviewUrl(item.imageUrl || null);
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setImagePreviewUrl(null);
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Item name is required."});
      return;
    }

    let imageUrlToSave = editingItem ? formData.imageUrl || '' : '';

    startTransition(async () => {
      if (imageFile) { // A new file was selected
        const imageUploadFormData = new FormData();
        imageUploadFormData.append('itemImage', imageFile);
        
        const uploadResult = await uploadItemImageAction(imageUploadFormData);
        if (uploadResult.success && uploadResult.url) {
          imageUrlToSave = uploadResult.url;
        } else {
          toast({ variant: "destructive", title: t('errorOccurred'), description: uploadResult.message || "Image upload failed." });
          return;
        }
      } else if (!editingItem && !imageUrlToSave) { // Adding new item and no image was selected or pre-exists
         toast({ variant: "destructive", title: t('errorOccurred'), description: "Item image is required for new items."});
         return;
      }
      
      if (!imageUrlToSave) { // Final check, especially for new items
        toast({ variant: "destructive", title: t('errorOccurred'), description: "Item image is required."});
        return;
      }

      const itemPayload = {
        name: formData.name!.trim(),
        imageUrl: imageUrlToSave,
        dataAiHint: formData.dataAiHint?.trim(),
      };

      let result;
      if (editingItem && editingItem.id) {
        result = await updateItemDefinitionAction(editingItem.id, itemPayload);
      } else {
        result = await addItemDefinitionAction(itemPayload as { name: string; imageUrl: string; dataAiHint?: string; });
      }

      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('itemDefinition')} ${editingItem ? t('updated') : t('addNew')}d.` });
        setIsDialogOpen(false);
        fetchItems();
        setImageFile(null); 
        setImagePreviewUrl(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
    });
  };
  
  const openDeleteConfirmDialog = (item: ItemDefinition) => {
    setItemToRemove(item);
  };

  const handleDelete = async () => {
    if (!itemToRemove || !itemToRemove.id) return;
    startTransition(async () => {
      const result = await removeItemDefinitionAction(itemToRemove.id!);
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('itemDefinition')} "${itemToRemove.name}" removed.` });
        fetchItems();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
      setItemToRemove(null); 
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>{t('manageItemDefinitions')}</CardTitle>
          <Button onClick={handleAddNew} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> {t('addItemDefinition')}
          </Button>
        </div>
        <CardDescription>{t('noItemDefinitions')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>{t('itemNameLabel')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('itemImageUrl')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('itemDataAiHint')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.imageUrl || 'https://placehold.co/60x60.png?text=N/A'} alt={item.name} width={40} height={40} className="rounded object-cover" data-ai-hint={item.dataAiHint || "item image"} />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs truncate max-w-[150px]">{item.imageUrl}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{item.dataAiHint || '-'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(item)} disabled={isPending} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('edit')}</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => openDeleteConfirmDialog(item)} disabled={isPending} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('delete')}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">{t('noItemDefinitions')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) { // Reset states when dialog closes
            setImageFile(null);
            setImagePreviewUrl(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? t('edit') : t('addNew')} {t('itemDefinition')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">{t('itemNameLabel')}</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder={t('enterItemName')} required />
            </div>
            
            <div>
              <Label htmlFor="itemImageFile">{t('itemImageUpload')}</Label>
              <Input 
                id="itemImageFile" 
                name="itemImageFile" 
                type="file" 
                accept="image/*" 
                onChange={handleImageFileChange} 
                ref={fileInputRef}
                className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>

            {imagePreviewUrl && (
                <div className="my-2">
                    <Image src={imagePreviewUrl} alt="Preview" width={80} height={80} className="rounded object-cover border" data-ai-hint="image preview" onError={(e) => {
                        // Attempt to show original formData.imageUrl if preview fails (e.g. object URL revoked)
                        const currentTarget = e.currentTarget as HTMLImageElement;
                        if (formData.imageUrl && currentTarget.src !== formData.imageUrl) {
                            currentTarget.src = formData.imageUrl;
                        } else {
                            currentTarget.src = 'https://placehold.co/80x80.png?text=Invalid';
                        }
                    }} />
                </div>
            )}
            
            <div>
              <Label htmlFor="dataAiHint">{t('itemDataAiHint')}</Label>
              <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint || ''} onChange={handleInputChange} placeholder={t('enterItemAiHint')} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>{t('cancel')}</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? `${t('save')}...` : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemove')} {t('itemDefinition')}: {itemToRemove?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? `${t('confirm')}...` : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
// Add to translations:
// "itemImageUpload": "Upload Item Image"
// "itemImageUpload": "आइटम छवि अपलोड करें" (hi)
