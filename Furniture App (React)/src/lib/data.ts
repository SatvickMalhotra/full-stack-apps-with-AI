// src/lib/data.ts
import type { SelectOption, AdminManagedItem, Partner, ItemDefinition, PurchaseData, UploadedFileMeta } from '@/types';
import { db } from './firebase';
import type { QuerySnapshot, Query } from 'firebase/firestore';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, writeBatch, updateDoc, serverTimestamp, orderBy, Timestamp, limit, startAfter } from 'firebase/firestore';

export const OTHER_ITEM_VALUE = "other_specify_item";

// --- Employee ID Management ---
export const getEmployeeIdsFS = async (): Promise<SelectOption[]> => {
  try {
    const employeeIdsCollection = collection(db, 'employee_ids');
    const q = query(employeeIdsCollection, orderBy("employeeId"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ value: doc.data().employeeId as string, label: doc.data().employeeId as string }));
  } catch (error) {
    console.error("Error fetching employee IDs from Firestore:", error);
    return [];
  }
};

export const addEmployeeIdFS = async (employeeIdValue: string): Promise<{success: boolean, message?: string}> => {
  try {
    const cleanedEmployeeId = employeeIdValue.trim().replace(/[^\x20-\x7E]/g, '');
    if (!cleanedEmployeeId) return { success: false, message: 'emptyId' };

    const employeeIdsCollection = collection(db, 'employee_ids');
    const snapshot = await getDocs(query(employeeIdsCollection, where("employeeId", "==", cleanedEmployeeId)));
    if (!snapshot.empty) {
      return { success: false, message: 'idExists' };
    }
    await addDoc(employeeIdsCollection, { employeeId: cleanedEmployeeId, createdAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Error adding employee ID to Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const removeEmployeeIdFS = async (employeeIdValue: string): Promise<{success: boolean, message?: string}> => {
  try {
    const employeeIdsCollection = collection(db, 'employee_ids');
    const q = query(employeeIdsCollection, where("employeeId", "==", employeeIdValue));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, message: 'ID not found' };
    }
    const docId = snapshot.docs[0].id;
    await deleteDoc(doc(db, 'employee_ids', docId));
    return { success: true };
  } catch (error) {
    console.error("Error removing employee ID from Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const bulkAddEmployeeIdsFS = async (ids: string[]): Promise<{success: boolean, count: number, errors: string[]}> => {
  let addedCount = 0;
  const errorIds: string[] = [];
  const employeeIdsCollection = collection(db, 'employee_ids');
  const existingIds = new Set<string>();
  let lastDoc = null;
  while (true) {
    const batchQuery = lastDoc ? query(employeeIdsCollection, orderBy("employeeId"), startAfter(lastDoc), limit(1000)) : query(employeeIdsCollection, orderBy("employeeId"), limit(1000));
    const snapshot: QuerySnapshot = await getDocs(batchQuery as Query);
    if (snapshot.empty) break;
    snapshot.docs.forEach(doc => existingIds.add(doc.data().employeeId as string));
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  const batch = writeBatch(db);
  const uniqueNewIds = new Set<string>();

  for (const id of ids) {
    const trimmedId = id.trim().replace(/[^\x20-\x7E]/g, '');
    if (trimmedId && !existingIds.has(trimmedId) && !uniqueNewIds.has(trimmedId)) {
      uniqueNewIds.add(trimmedId);
      const newDocRef = doc(collection(db, 'employee_ids'));
      batch.set(newDocRef, { employeeId: trimmedId, createdAt: serverTimestamp() });
      addedCount++;
    } else if (trimmedId) {
      errorIds.push(trimmedId);
    }
  }
  try {
    await batch.commit();
    return { success: true, count: addedCount, errors: errorIds };
  } catch (error) {
     console.error("Error bulk adding employee IDs to Firestore:", error);
     return { success: false, count: 0, errors: ids.filter(id => id.trim()) };
  }
};

// --- Printer Name Management ---
export const getPrinterNamesFS = async (): Promise<AdminManagedItem[]> => {
  try {
    const printerNamesCollection = collection(db, 'printer_names');
    const q = query(printerNamesCollection, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, name: docSnapshot.data().name as string }));
  } catch (error) {
    console.error("Error fetching printer names from Firestore:", error);
    return [];
  }
};

export const addPrinterNameFS = async (name: string): Promise<{success: boolean, id?: string, message?: string}> => {
  try {
    const printerNamesCollection = collection(db, 'printer_names');
    const q = query(printerNamesCollection, where("name", "==", name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { success: false, message: 'nameExists' };
    }
    const docRef = await addDoc(printerNamesCollection, { name, createdAt: serverTimestamp() });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding printer name to Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const removePrinterNameFS = async (id: string): Promise<{success: boolean, message?: string}> => {
 try {
    await deleteDoc(doc(db, 'printer_names', id));
    return { success: true };
  } catch (error) {
    console.error("Error removing printer name from Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

// --- Partner Management ---
export const getPartnersFS = async (): Promise<Partner[]> => {
  try {
    const partnersCollection = collection(db, 'partners');
    const q = query(partnersCollection, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, name: docSnapshot.data().name as string }));
  } catch (error) {
    console.error("Error fetching partners from Firestore:", error);
    return [];
  }
};

export const addPartnerFS = async (name: string): Promise<{success: boolean, id?: string, message?: string}> => {
  try {
    const partnersCollection = collection(db, 'partners');
    const q = query(partnersCollection, where("name", "==", name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { success: false, message: 'nameExists' };
    }
    const docRef = await addDoc(partnersCollection, { name, createdAt: serverTimestamp() });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding partner to Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const updatePartnerFS = async (id: string, newName: string): Promise<{success: boolean, message?: string}> => {
  try {
    const partnersCollection = collection(db, 'partners');
    const q = query(partnersCollection, where("name", "==", newName));
    const snapshot = await getDocs(q);
    if (!snapshot.empty && snapshot.docs.some(d => d.id !== id)) {
        return { success: false, message: 'nameExists' };
    }
    const partnerDocRef = doc(db, 'partners', id);
    await updateDoc(partnerDocRef, { name: newName, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Error updating partner in Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const removePartnerFS = async (id: string): Promise<{success: boolean, message?: string}> => {
  try {
    await deleteDoc(doc(db, 'partners', id));
    return { success: true };
  } catch (error) {
    console.error("Error removing partner from Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

// --- Item Definition Management ---
export const getItemDefinitionsFS = async (): Promise<ItemDefinition[]> => {
  try {
    const itemsCollection = collection(db, 'item_definitions');
    const q = query(itemsCollection, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        name: data.name as string,
        value: docSnapshot.id,
        label: data.name as string,
        imageUrl: data.imageUrl as string,
        dataAiHint: data.dataAiHint as string | undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching item definitions from Firestore:", error);
    return [];
  }
};

export const addItemDefinitionFS = async (itemData: Omit<ItemDefinition, 'id' | 'value' | 'label'> & { name: string }): Promise<{success: boolean, id?: string, message?: string}> => {
  try {
    const itemsCollection = collection(db, 'item_definitions');
    const q = query(itemsCollection, where("name", "==", itemData.name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { success: false, message: 'nameExists' };
    }
    const docRef = await addDoc(itemsCollection, { ...itemData, createdAt: serverTimestamp() });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding item definition to Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const updateItemDefinitionFS = async (id: string, itemData: Partial<Omit<ItemDefinition, 'id' | 'value' | 'label'>> & { name?: string }): Promise<{success: boolean, message?: string}> => {
  try {
    if (itemData.name) {
        const itemsCollection = collection(db, 'item_definitions');
        const q = query(itemsCollection, where("name", "==", itemData.name));
        const snapshot = await getDocs(q);
        if (!snapshot.empty && snapshot.docs.some(d => d.id !== id)) {
            return { success: false, message: 'nameExists' };
        }
    }
    const itemDocRef = doc(db, 'item_definitions', id);
    await updateDoc(itemDocRef, { ...itemData, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Error updating item definition in Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

export const removeItemDefinitionFS = async (id: string): Promise<{success: boolean, message?: string}> => {
  try {
    await deleteDoc(doc(db, 'item_definitions', id));
    return { success: true };
  } catch (error) {
    console.error("Error removing item definition from Firestore:", error);
    return { success: false, message: 'errorOccurred' };
  }
};

// --- Public data getters for the form ---
export const getPartnerNames = async (): Promise<Partner[]> => {
  return getPartnersFS();
};

export const getItemNames = async (): Promise<ItemDefinition[]> => {
  const itemsFromDb = await getItemDefinitionsFS();
  return [
    ...itemsFromDb,
    {
      id: OTHER_ITEM_VALUE,
      name: 'Other (Specify)',
      value: OTHER_ITEM_VALUE,
      label: 'Other (Specify)',
      imageUrl: 'https://placehold.co/100x100.png?text=Other',
      dataAiHint: "custom item"
    }
  ];
};

// --- Get Purchases by Date Range ---
export const getPurchasesByDateRangeFS = async (startDate: Date, endDate: Date): Promise<PurchaseData[]> => {
  try {
    const purchasesCollection = collection(db, 'purchases');
    const endOfDayEndDate = new Date(endDate);
    endOfDayEndDate.setHours(23, 59, 59, 999);

    const q = query(
      purchasesCollection,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endOfDayEndDate)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // **FIX: Transform uploadedFiles to match the UploadedFileMeta type**
      const uploadedFiles: UploadedFileMeta[] = (data.uploadedFiles || []).map((file: any) => ({
        name: file.name || 'Unknown File',
        url: file.downloadURL || '', // Map downloadURL to url
        type: file.type || 'application/octet-stream', // Provide a default type
        size: file.size || 0, // Provide a default size
      }));

      return {
        id: docSnapshot.id,
        userId: data.userId,
        partnerName: data.partnerName,
        userName: data.userName,
        items: data.items,
        uploadedFiles: uploadedFiles, // Use the transformed data
        createdAt: data.createdAt,
        totalAmount: data.totalAmount,
      } as PurchaseData;
    });
  } catch (error) {
    console.error("Error fetching purchases by date range from Firestore:", error);
    return [];
  }
};

// --- Get Last N Purchases ---
export const getLastNPurchasesFS = async (limitCount: number): Promise<PurchaseData[]> => {
  try {
    const purchasesCollection = collection(db, 'purchases');
    const q = query(
      purchasesCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // **FIX: Transform uploadedFiles to match the UploadedFileMeta type**
      const uploadedFiles: UploadedFileMeta[] = (data.uploadedFiles || []).map((file: any) => ({
        name: file.name || 'Unknown File',
        url: file.downloadURL || '', // Map downloadURL to url
        type: file.type || 'application/octet-stream', // Provide a default type
        size: file.size || 0, // Provide a default size
      }));

      return {
        id: docSnapshot.id,
        userId: data.userId,
        partnerName: data.partnerName,
        userName: data.userName,
        items: data.items,
        uploadedFiles: uploadedFiles, // Use the transformed data
        createdAt: data.createdAt,
        totalAmount: data.totalAmount,
      } as PurchaseData;
    });
  } catch (error) {
    console.error(`Error fetching last ${limitCount} purchases from Firestore:`, error);
    return [];
  }
};
