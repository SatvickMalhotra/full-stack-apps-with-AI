// src/lib/actions.ts (Corrected)
"use server";

import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  OTHER_ITEM_VALUE,
  addEmployeeIdFS as dbAddEmployeeIdFS,
  removeEmployeeIdFS as dbRemoveEmployeeIdFS,
  bulkAddEmployeeIdsFS as dbBulkAddEmployeeIdsFS,
  addPrinterNameFS as dbAddPrinterNameFS,
  removePrinterNameFS as dbRemovePrinterNameFS,
  addPartnerFS as dbAddPartnerFS,
  updatePartnerFS as dbUpdatePartnerFS,
  removePartnerFS as dbRemovePartnerFS,
  addItemDefinitionFS as dbAddItemDefinitionFS,
  updateItemDefinitionFS as dbUpdateItemDefinitionFS,
  removeItemDefinitionFS as dbRemoveItemDefinitionFS,
  getPurchasesByDateRangeFS,
} from '@/lib/data';
import type { PurchaseItem, ItemDefinition, Partner, UploadedFileMeta, PurchaseData } from '@/types';
import * as XLSX from 'xlsx';


const MAX_TOTAL_FILES = 50;
const MAX_FILE_SIZE_PER_FILE = 20 * 1024 * 1024; // 20MB per file
const ALLOWED_FILE_TYPES_PURCHASE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const ALLOWED_IMAGE_TYPES_ITEM_DEF = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];


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
  .refine((file) => file.size <= MAX_FILE_SIZE_PER_FILE, `Max file size is ${MAX_FILE_SIZE_PER_FILE / (1024 * 1024)}MB.`)
  .refine(
    (file) => ALLOWED_FILE_TYPES_PURCHASE.includes(file.type),
    "Only JPG, JPEG, PNG, GIF, WEBP, PDF files are allowed."
  );

const PurchaseFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  partnerName: z.string().min(1, "Partner name is required"), 
  userName: z.string().min(1, "User name is required"),
  items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
  uploadedFiles: z.array(FileSchema).max(MAX_TOTAL_FILES, `You can upload a maximum of ${MAX_TOTAL_FILES} files.`).optional(),
});


export async function submitPurchase(prevState: any, formData: FormData) {
  try {
    const rawItems = formData.get('items') as string;
    const itemsForValidation = JSON.parse(rawItems).map((item: any) => ({
        id: item.id,
        clinicCode: item.clinicCode,
        quantity: item.quantity,
        price: item.price,
        itemName: item.itemName,
        customItemName: item.customItemName,
        itemNameDisplay: item.itemNameDisplay, 
    })) as PurchaseItem[];

    const files: File[] = [];
    for (let i = 0; i < MAX_TOTAL_FILES; i++) {
      const file = formData.get(`uploadedFiles[${i}]`) as File | null;
      if (file) {
        files.push(file);
      } else {
        break; 
      }
    }
    
    const validatedFields = PurchaseFormSchema.safeParse({
      userId: formData.get('userId'),
      partnerName: formData.get('partnerName'),
      userName: formData.get('userName'),
      items: itemsForValidation,
      uploadedFiles: files.length > 0 ? files : undefined,
    });

    if (!validatedFields.success) {
      console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId, partnerName, userName, items, uploadedFiles } = validatedFields.data;
    const uploadedFileUrls: UploadedFileMeta[] = [];

    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          const sRef = storageRef(storage, `purchase_uploads/${userId}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(sRef, file);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          uploadedFileUrls.push({ name: file.name, type: file.type, url: downloadUrl, size: file.size });
        } catch (uploadError) {
          console.error("Error uploading file to Firebase Storage:", uploadError);
          return { success: false, message: "File upload failed.", errors: { uploadedFiles: "File upload failed for " + file.name } };
        }
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const purchaseData: Omit<PurchaseData, 'id'> = { // Use Omit because id is added by Firestore
      userId,
      partnerName, 
      userName,
      items: items.map(item => ({ 
        id: item.id,
        clinicCode: item.clinicCode,
        quantity: item.quantity,
        price: item.price,
        itemName: item.itemName, 
        customItemName: item.customItemName,
        itemNameDisplay: item.itemNameDisplay, 
      })),
      uploadedFiles: uploadedFileUrls,
      createdAt: serverTimestamp(),
      totalAmount: totalAmount,
    };

    const docRef = await addDoc(collection(db, 'purchases'), purchaseData);

    const dataForBillPreview = {
        ...validatedFields.data,
        id: docRef.id,
        uploadedFiles: uploadedFileUrls,
        totalAmount: totalAmount,
    };

    return { success: true, message: "billGeneratedSuccess", data: dataForBillPreview };
  } catch (error) {
    console.error("Error submitting purchase:", error);
    return { success: false, message: "errorOccurred" };
  }
}

// --- Employee ID Management Actions ---
export async function addEmployeeIdAction(id: string) {
  if (!id || id.trim() === "") {
    return { success: false, message: "Employee ID cannot be empty." };
  }
  return dbAddEmployeeIdFS(id.trim());
}

export async function removeEmployeeIdAction(id: string) {
  return dbRemoveEmployeeIdFS(id);
}

export async function bulkUploadEmployeeIdsAction(formData: FormData) {
  const file = formData.get('employeeIdFile') as File | null;

  if (!file) {
    return { success: false, message: 'No file uploaded.' };
  }

  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
     return { success: false, message: 'Invalid file type. Please upload a CSV or Excel file.' };
  }
  
  try {
    const textContent = await file.text();
    const lines = textContent.split(/\r\n|\n|\r/).map(line => line.trim()).filter(line => line);
    
    let idsToUpload: string[] = [];

    if (lines.length > 0) {
      const header = lines[0].toLowerCase().replace(/\s+/g, '');
      if (header.includes('employeeid')) {
         idsToUpload = lines.slice(1).map(id => id.trim()).filter(id => id);
      } else {
        idsToUpload = lines.map(id => id.trim()).filter(id => id);
      }
    }
    
    if (idsToUpload.length === 0) {
      return { success: false, message: 'No valid IDs found in the file or file format incorrect. Ensure header is "employee id" or "employee_id" or no header with one ID per line.' };
    }

    const result = await dbBulkAddEmployeeIdsFS(idsToUpload);
    
    let message = `Successfully added ${result.count} new IDs.`;
    if (result.errors.length > 0) {
      message += ` ${result.errors.length} IDs already existed or were duplicates/invalid: ${result.errors.slice(0,5).join(', ')}${result.errors.length > 5 ? '...' : ''}.`;
    }
    return { success: true, message };

  } catch (error) {
    console.error('Error processing bulk upload:', error);
    return { success: false, message: 'Failed to process file. Ensure it is plain text (CSV/Excel saved as CSV).' };
  }
}


// --- Printer Name Management Actions ---
export async function addPrinterNameAction(name: string) {
  if (!name || name.trim() === "") {
    return { success: false, message: "Printer name cannot be empty." };
  }
  return dbAddPrinterNameFS(name.trim());
}

export async function removePrinterNameAction(id: string) {
  return dbRemovePrinterNameFS(id);
}

// --- Partner Management Actions ---
const PartnerNameSchema = z.string().min(1, "Partner name cannot be empty.").max(100, "Partner name too long.");

export async function addPartnerAction(name: string) {
  const validation = PartnerNameSchema.safeParse(name);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  return dbAddPartnerFS(validation.data);
}

export async function updatePartnerAction(id: string, name: string) {
  const validation = PartnerNameSchema.safeParse(name);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  return dbUpdatePartnerFS(id, validation.data);
}

export async function removePartnerAction(id: string) {
  return dbRemovePartnerFS(id);
}

// --- Item Definition Management Actions ---
const ItemDefinitionSchema = z.object({
  name: z.string().min(1, "Item name is required.").max(100, "Item name too long."),
  imageUrl: z.string().url("Image URL must be a valid URL.").min(1, "Image URL is required."),
  dataAiHint: z.string().max(50, "AI hint too long.").optional(),
});

export async function addItemDefinitionAction(itemData: { name: string; imageUrl: string; dataAiHint?: string }) {
  const validation = ItemDefinitionSchema.safeParse(itemData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const message = fieldErrors.name?.[0] || fieldErrors.imageUrl?.[0] || fieldErrors.dataAiHint?.[0] || "Validation failed.";
    return { success: false, message };
  }
  return dbAddItemDefinitionFS(validation.data);
}

export async function updateItemDefinitionAction(id: string, itemData: { name?: string; imageUrl?: string; dataAiHint?: string }) {
  const partialSchema = ItemDefinitionSchema.partial().refine(data => Object.keys(data).length > 0, {message: "At least one field must be provided for update."});
  const validation = partialSchema.safeParse(itemData);
  if (!validation.success) {
     const fieldErrors = validation.error.flatten().fieldErrors;
     const message = fieldErrors.name?.[0] || fieldErrors.imageUrl?.[0] || fieldErrors.dataAiHint?.[0] || "Validation failed.";
     return { success: false, message };
  }
  if (itemData.name !== undefined && itemData.name.trim() === "") {
    return { success: false, message: "Item name cannot be empty." };
  }
  if (itemData.imageUrl !== undefined) {
    if (itemData.imageUrl.trim() === "") {
      return { success: false, message: "Image URL cannot be empty." };
    }
    const urlValidation = z.string().url().safeParse(itemData.imageUrl);
    if (!urlValidation.success) {
      return { success: false, message: "Invalid Image URL format."};
    }
  }

  const updatePayload: any = {};
  if (itemData.name !== undefined) updatePayload.name = itemData.name.trim();
  if (itemData.imageUrl !== undefined) updatePayload.imageUrl = itemData.imageUrl.trim();
  if (itemData.dataAiHint !== undefined) updatePayload.dataAiHint = itemData.dataAiHint.trim();

  return dbUpdateItemDefinitionFS(id, updatePayload);
}

export async function removeItemDefinitionAction(id: string) {
  return dbRemoveItemDefinitionFS(id);
}

// --- Item Image Upload Action (for Item Definitions) ---
export async function uploadItemImageAction(formData: FormData): Promise<{success: boolean, url?: string, message?: string}> {
  const imageFile = formData.get('itemImage') as File | null;

  if (!imageFile) {
    return { success: false, message: "No image file provided." };
  }

  if (!ALLOWED_IMAGE_TYPES_ITEM_DEF.includes(imageFile.type)) {
    return { success: false, message: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)." };
  }
  if (imageFile.size > MAX_FILE_SIZE_PER_FILE) { 
    return { success: false, message: `File is too large. Max size is ${MAX_FILE_SIZE_PER_FILE / (1024*1024)}MB.`};
  }

  try {
    const sRef = storageRef(storage, `item_definition_images/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(sRef, imageFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadUrl };
  } catch (error) {
    console.error("Error uploading item image to Firebase Storage:", error);
    const errorMessage = error instanceof Error ? error.message : "Firebase Storage upload failed.";
    return { success: false, message: errorMessage };
  }
}

// --- Admin Download Purchase Data by Time Frame ---
const DownloadReportSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Start date cannot be after end date",
  path: ["endDate"],
});

export async function downloadPurchasesByDateRangeAction(prevState: any, formData: FormData) {
  const validatedFields = DownloadReportSchema.safeParse({
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid date range.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { startDate, endDate } = validatedFields.data;

  try {
    const purchases = await getPurchasesByDateRangeFS(new Date(startDate), new Date(endDate));

    if (purchases.length === 0) {
      return { success: false, message: "noDataFoundForDateRange" };
    }

    const worksheetData = purchases.flatMap(purchase => 
      purchase.items.map(item => ({
        'Purchase ID': purchase.id,
        'User ID': purchase.userId,
        'Partner Name': purchase.partnerName,
        'User Name': purchase.userName,
        'Purchase Date': purchase.createdAt instanceof Timestamp ? purchase.createdAt.toDate().toLocaleDateString() : String(purchase.createdAt),
        'Clinic Code': item.clinicCode,
        'Item Name': item.itemNameDisplay,
        'Quantity': item.quantity,
        'Price Per Unit': item.price,
        'Line Total': item.quantity * item.price,
        'Uploaded Files Count': purchase.uploadedFiles?.length || 0,
      }))
    );
    
    // --- FIX START ---
    // The summaryRow object now uses `null` for numeric columns to avoid type conflicts.
    const summaryRow = {
        'Purchase ID': 'TOTAL',
        'User ID': '',
        'Partner Name': '',
        'User Name': '',
        'Purchase Date': '',
        'Clinic Code': '',
        'Item Name': '',
        'Quantity': null,
        'Price Per Unit': null,
        'Line Total': purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
        'Uploaded Files Count': null,
    };
    // --- FIX END ---
    worksheetData.push(summaryRow as any); // Use 'as any' to satisfy the strict typing of the array after the fix.


    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const base64 = Buffer.from(excelBuffer).toString('base64');


    return { 
        success: true, 
        message: "reportGeneratedSuccess",
        excelData: base64,
        fileName: `PurchaseReport_${startDate}_to_${endDate}.xlsx`
    };

  } catch (error) {
    console.error("Error generating purchase report:", error);
    return { success: false, message: "errorGeneratingReport" };
  }
}