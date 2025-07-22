// src/types/index.ts
export interface SelectOption {
  value: string;
  label: string;
}

export interface ItemDefinition {
  id: string; // Firestore document ID
  name: string; // This will be the label
  value: string; // This can be the same as 'name' or a unique code, typically maps to 'id' for SelectOption
  label: string; // Explicit label for SelectOption
  imageUrl: string;
  dataAiHint?: string;
}

export interface PurchaseItem {
  id: string; // Unique ID for the item in the list (e.g., UUID)
  clinicCode: string;
  quantity: number;
  price: number;
  itemName: string; // This will be the 'value' (or 'id') from ItemDefinition
  customItemName?: string; // For "Other" items
  itemNameDisplay: string; // The final display name (either item.label or customItemName)
}

export interface AdminManagedItem {
  id: string; // Firestore document ID
  name: string;
}

export interface Partner {
  id: string; // Firestore document ID
  name: string;
}

export interface UploadedFileMeta {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface PurchaseData {
  id?: string; // Firestore document ID, optional for new data
  userId: string;
  partnerName: string;
  userName: string;
  items: PurchaseItem[];
  uploadedFiles?: UploadedFileMeta[]; // Array of uploaded file metadata
  createdAt: any; // Firestore Timestamp or Date
  totalAmount?: number; // Optional, can be calculated
}
