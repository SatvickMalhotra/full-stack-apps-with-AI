// src/components/admin/detailed-bill-view.tsx (Corrected)
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { getLastNPurchasesFS } from '@/lib/data'; // Corrected Import
import type { PurchaseData } from '@/types';     // Corrected Import
import { useToast } from "@/hooks/use-toast";
import { BillPreview } from '@/components/bill-preview';
import * as XLSX from 'xlsx';

export function DetailedBillView() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<PurchaseData | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const data = await getLastNPurchasesFS(50);
        setPurchases(data);
      } catch (error) {
        console.error("Error fetching recent purchases:", error);
        toast({ variant: "destructive", title: t('errorOccurred'), description: "Failed to load recent purchases." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [toast, t]);

  const handleViewDetails = (purchase: PurchaseData) => {
    setSelectedBill(purchase);
  };
  
  const handleCloseDialog = () => {
    setSelectedBill(null);
  };

  const handleDownloadExcel = (billData: PurchaseData | null) => {
    if (!billData) return;
    toast({ title: t('generatingExcel') });

    try {
      const wb = XLSX.utils.book_new();
      
      const summaryData = [
        [t('userId'), billData.userId],
        [t('partnerName'), billData.partnerName],
        [t('userName'), billData.userName],
        [t('uploadedFilesLabel'), billData.uploadedFiles && billData.uploadedFiles.length > 0 ? billData.uploadedFiles.map(f => f.name).join(', ') : t('noFileUploaded')],
        [], 
        [t('totalBill'), billData.totalAmount?.toFixed(2) ?? '0.00']
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Bill Summary");

      const itemsHeader = [t('clinicCode'), t('itemName'), t('quantity'), t('pricePerUnit'), t('itemLineTotal')];
      const itemsData = billData.items.map(item => [
        item.clinicCode,
        item.itemNameDisplay, 
        item.quantity,
        Number(item.price).toFixed(2),
        (Number(item.quantity) * Number(item.price)).toFixed(2)
      ]);
      const wsItems = XLSX.utils.aoa_to_sheet([itemsHeader, ...itemsData]);
      XLSX.utils.book_append_sheet(wb, wsItems, "Item Details");

      XLSX.writeFile(wb, `PurchaseBill_${billData.userId}_${Date.now()}.xlsx`);
      toast({ title: t('excelDownloadSuccess')});
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({ variant: "destructive", title: t('excelDownloadFailed')});
    }
  };


  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('detailedBill')}</CardTitle>
          <CardDescription>Showing the last 50 purchase records.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>{t('purchaseDate')}</TableHead>
                  <TableHead>{t('userId')}</TableHead>
                  <TableHead>{t('partnerName')}</TableHead>
                  <TableHead>{t('userName')}</TableHead>
                  <TableHead className="text-right">{t('totalAmount')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {purchase.createdAt?.toDate ? purchase.createdAt.toDate().toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{purchase.userId}</TableCell>
                      <TableCell>{purchase.partnerName}</TableCell>
                      <TableCell>{purchase.userName}</TableCell>
                      <TableCell className="text-right font-medium">{purchase.totalAmount?.toFixed(2) ?? '0.00'}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(purchase)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">{t('noPurchasesFound')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedBill && (
        <BillPreview
          isOpen={!!selectedBill}
          onClose={handleCloseDialog}
          billData={selectedBill}
          t={t}
          onDownloadExcel={() => handleDownloadExcel(selectedBill)}
        />
      )}
    </>
  );
}