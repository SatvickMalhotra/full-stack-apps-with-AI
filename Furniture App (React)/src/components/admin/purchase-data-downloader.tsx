// src/components/admin/purchase-data-downloader.tsx (Corrected)
"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { downloadPurchasesByDateRangeAction } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";
import { FileDown } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PurchaseDataDownloader() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Please select both start and end dates." });
      return;
    }
    if (startDate > endDate) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Start date cannot be after end date." });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('startDate', startDate.toISOString());
      formData.append('endDate', endDate.toISOString());

      const result = await downloadPurchasesByDateRangeAction(null, formData);
      if (result.success && result.excelData && result.fileName) {
        // Trigger download client-side
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.excelData}`;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: t('operationSuccess'), description: t(result.message || 'reportGeneratedSuccess') });
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorGeneratingReport') });
      }
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{t('downloadReports')}</CardTitle>
        <CardDescription>{t('selectDateRangeNote') || 'Select a date range to download purchase data as an Excel file.'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="startDate" className="block mb-1">{t('startDate')}</Label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MMMM d, yyyy"
              className="w-full p-2 border rounded-md text-sm bg-background"
              popperPlacement="bottom-start"
              id="startDate"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="block mb-1">{t('endDate')}</Label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              // --- FIX START ---
              // If startDate is null (falsy), use 'undefined' instead.
              minDate={startDate || undefined}
              // --- FIX END ---
              dateFormat="MMMM d, yyyy"
              className="w-full p-2 border rounded-md text-sm bg-background"
              popperPlacement="bottom-start"
              id="endDate"
            />
          </div>
        </div>
        <Button onClick={handleDownload} disabled={isPending || !startDate || !endDate} className="w-full">
          <FileDown className="h-4 w-4 mr-2" />
          {isPending ? `${t('downloadReportButton')}...` : t('downloadReportButton')}
        </Button>
      </CardContent>
    </Card>
  );
}