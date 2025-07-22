// src/components/bill-preview.tsx (Corrected)
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PurchaseData } from "@/types";
import { Download, CheckCircle, Printer, FileText as FileIconLucide } from "lucide-react";
import Image from 'next/image';

interface BillPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  billData: PurchaseData | null;
  t: (key: string) => string;
  onDownloadExcel: () => void;
}

export function BillPreview({ isOpen, onClose, billData, t, onDownloadExcel }: BillPreviewProps) {
  if (!billData) return null;

  const getBillDate = () => {
    if (!billData.createdAt) return new Date();
    if (typeof billData.createdAt.toDate === 'function') {
      return billData.createdAt.toDate();
    }
    return new Date(billData.createdAt.seconds ? billData.createdAt.seconds * 1000 : Date.now());
  };
  const billDate = getBillDate();

  const handlePrint = () => {
    const printableContent = document.getElementById('bill-printable-area');
    if (printableContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write('<html><head><title>Print Bill</title>');
      printWindow?.document.write(`
        <style>
          body { font-family: sans-serif; margin: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.875rem; }
          th { background-color: #f2f2f2; font-weight: 600; }
          .total-row td { font-weight: bold; }
          .header-info p { margin: 5px 0; font-size: 0.875rem; }
          .no-print { display: none; }
          .bill-title { text-align: center; font-size: 1.5rem; margin-bottom: 1rem; color: #000; }
          .dialog-description { text-align: center; font-size: 0.8rem; margin-bottom: 1rem; color: #555;}
          .section-title { font-weight: 600; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
          .total-amount { font-size: 1.125rem; font-weight: bold; text-align: right; margin-top: 1rem; }
          .uploaded-files-list { list-style: none; padding: 0; }
          .uploaded-files-list li { margin-bottom: 5px; font-size: 0.8rem; }
          .uploaded-files-list img { max-width: 50px; max-height: 50px; margin-right: 5px; vertical-align: middle; border: 1px solid #eee; }
        </style>
      `);
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(`<h1 class="bill-title">${t('billDetails')}</h1>`);
      printWindow?.document.write(`<p class="dialog-description">${t('appName')} - ${billDate.toLocaleString()}</p>`);
      
      const contentToPrint = printableContent.cloneNode(true) as HTMLElement;
      const buttonsSection = contentToPrint.querySelector('.print-buttons-section');
      if (buttonsSection) buttonsSection.parentNode?.removeChild(buttonsSection);
      
      printWindow?.document.write(contentToPrint.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    }
  };
  
  const itemsWithDisplayNames = billData.items;
  const totalBillAmount = billData.totalAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">{t('billDetails')}</DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {t('appName')} - {billDate.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div id="bill-printable-area" className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          <div className="header-info grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong>{t('userId')}:</strong> {billData.userId}</p>
            <p><strong>{t('partnerName')}:</strong> {billData.partnerName}</p>
            <p><strong>{t('userName')}:</strong> {billData.userName}</p>
          </div>
          
          {billData.uploadedFiles && billData.uploadedFiles.length > 0 && (
            <>
              <h4 className="font-semibold text-md mt-4 mb-2 section-title">{t('uploadedFilesLabel')}:</h4>
              <ul className="uploaded-files-list space-y-1 text-sm">
                {billData.uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center">
                    {file.type?.startsWith('image/') ? (
                       <Image src={file.url} alt={file.name} width={30} height={30} className="mr-2 rounded object-cover border" data-ai-hint="uploaded image" />
                    ) : (
                      <FileIconLucide className="w-5 h-5 mr-2 text-muted-foreground" />
                    )}
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {file.name}
                    </a>
                    {file.size > 0 &&
                        <span className="text-xs text-muted-foreground ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                    }
                  </li>
                ))}
              </ul>
              <Separator className="my-3"/>
            </>
          )}
          
          <h4 className="font-semibold text-md mt-4 mb-2 section-title">{t('itemsPurchased')}:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 border">{t('itemName')}</th>
                  <th className="p-2 border text-right">{t('quantity')}</th>
                  <th className="p-2 border text-right">{t('pricePerUnit')}</th>
                  <th className="p-2 border text-right">{t('itemLineTotal')}</th>
                </tr>
              </thead>
              {/* --- FIX START --- */}
              {/* The tbody contains the corrected mapping logic without any misplaced comments. */}
              <tbody>
                {itemsWithDisplayNames.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="p-2 border">{item.itemNameDisplay}</td>
                    <td className="p-2 border text-right">{item.quantity}</td>
                    <td className="p-2 border text-right">{Number(item.price).toFixed(2)}</td>
                    <td className="p-2 border text-right">{(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              {/* --- FIX END --- */}
            </table>
          </div>
          
          <Separator className="my-4"/>
          <div className="text-right font-bold text-lg total-amount">
            {t('totalBill')}: {Number(totalBillAmount).toFixed(2)}
          </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 print-buttons-section">
          <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            {t('printBill')}
          </Button>
          <Button variant="secondary" onClick={onDownloadExcel} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('downloadExcel')}
          </Button>
          <Button type="button" onClick={onClose} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('finishBill')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}