// src/app/admin/page.tsx (Corrected)
"use client";

import React, { useState } from 'react';
import { EmployeeIdManager } from '@/components/admin/employee-id-manager';
import { PrinterManager } from '@/components/admin/printer-manager';
import { BulkIdUploader } from '@/components/admin/bulk-id-uploader';
import { ItemManager } from '@/components/admin/item-manager';
import { PartnerManager } from '@/components/admin/partner-manager';
import { PurchaseDataDownloader } from '@/components/admin/purchase-data-downloader';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { DetailedBillView } from '@/components/admin/detailed-bill-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Users, Printer, UploadCloud, ShieldAlert, ListChecks, Building, FileDown, BarChart2, Download, History, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPurchasesByDateRangeFS } from '@/lib/data';
import type { PurchaseData } from '@/types';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

export default function AdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateWiseSummary, setDateWiseSummary] = useState<Record<string, number>>({});
  const [clinicCodeWiseSummary, setClinicCodeWiseSummary] = useState<Record<string, number>>({});
  const [partnerWiseSummary, setPartnerWiseSummary] = useState<Record<string, number>>({});
  const [itemWiseSummary, setItemWiseSummary] = useState<Record<string, number>>({});
  const [userWiseSummary, setUserWiseSummary] = useState<Record<string, number>>({});
  const [overallSummary, setOverallSummary] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: t('operationSuccess'), description: "Logged in successfully." });
    } else {
      toast({ variant: "destructive", title: t('loginFailedMessage') });
    }
  };

  const fetchAndAggregatePurchases = async () => {
    if (!startDate || !endDate) {
      toast({ variant: "destructive", title: t('dateRangeRequiredError') });
      return;
    }
    setIsLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const data: PurchaseData[] = await getPurchasesByDateRangeFS(start, end);

      const dateAgg: Record<string, number> = {};
      const clinicCodeAgg: Record<string, number> = {};
      const partnerAgg: Record<string, number> = {};
      const itemAgg: Record<string, number> = {};
      const userAgg: Record<string, number> = {};
      let overallTotal = 0;

      data.forEach(purchase => {
        const purchaseDate = purchase.createdAt?.toDate ? purchase.createdAt.toDate().toISOString().split('T')[0] : 'Unknown Date';
        const total = purchase.totalAmount || 0;
        
        dateAgg[purchaseDate] = (dateAgg[purchaseDate] || 0) + total;
        if (purchase.userName) userAgg[purchase.userName] = (userAgg[purchase.userName] || 0) + total;
        if (purchase.partnerName) partnerAgg[purchase.partnerName] = (partnerAgg[purchase.partnerName] || 0) + total;
        
        purchase.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            if (item.clinicCode) clinicCodeAgg[item.clinicCode] = (clinicCodeAgg[item.clinicCode] || 0) + itemTotal;
            if(item.itemNameDisplay) itemAgg[item.itemNameDisplay] = (itemAgg[item.itemNameDisplay] || 0) + itemTotal;
        });

        overallTotal += total;
      });

      setDateWiseSummary(dateAgg);
      setClinicCodeWiseSummary(clinicCodeAgg);
      setPartnerWiseSummary(partnerAgg);
      setItemWiseSummary(itemAgg);
      setUserWiseSummary(userAgg);
      setOverallSummary(overallTotal);
      toast({ title: t('operationSuccess'), description: t('fetchDataSuccess') });
    } catch (error) {
      console.error("Error fetching and aggregating purchase data:", error);
      toast({ variant: "destructive", title: t('fetchDataError'), description: "Failed to fetch purchase data." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadAnalytics = () => {
    const headers = ["category", "item", "amount"];
    const rows = [
      ...Object.entries(dateWiseSummary).map(([date, amount]) => ["Date-wise", date, amount.toFixed(2)]),
      ...Object.entries(clinicCodeWiseSummary).map(([code, amount]) => ["Clinic Code-wise", code, amount.toFixed(2)]),
      ...Object.entries(partnerWiseSummary).map(([partner, amount]) => ["Partner-wise", partner, amount.toFixed(2)]),
      ...Object.entries(itemWiseSummary).map(([item, amount]) => ["Item-wise", item, amount.toFixed(2)]),
      ...Object.entries(userWiseSummary).map(([user, amount]) => ["User-wise", user, amount.toFixed(2)])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `analytics_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t('operationSuccess'), description: "Analytics report downloaded."});
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader><CardTitle className="text-2xl text-center text-primary">{t('adminLoginTitle')}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">{t('usernameLabel')}</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="text-base md:text-sm"/>
              </div>
              <div>
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="text-base md:text-sm"/>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-base md:text-sm">{t('loginButton')}</Button>
            </form>
            <CardDescription className="mt-4 text-xs text-muted-foreground text-center flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-destructive" /> {t('adminAuthDisclaimer')}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">{t('adminPage')}</h1>
      
      <Tabs defaultValue="purchase_analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6">
          <TabsTrigger value="employee_ids"><Users className="w-4 h-4 mr-1"/>{t('manageEmployeeIds')}</TabsTrigger>
          <TabsTrigger value="item_definitions"><ListChecks className="w-4 h-4 mr-1"/>{t('manageItemDefinitions')}</TabsTrigger>
          <TabsTrigger value="partners"><Building className="w-4 h-4 mr-1"/>{t('managePartners')}</TabsTrigger>
          <TabsTrigger value="printer_names"><Printer className="w-4 h-4 mr-1"/>{t('managePrinterNames')}</TabsTrigger>
          <TabsTrigger value="bulk_upload"><UploadCloud className="w-4 h-4 mr-1"/>{t('bulkUploadEmployeeIds')}</TabsTrigger>
          <TabsTrigger value="download_reports"><FileDown className="w-4 h-4 mr-1"/>{t('downloadReports')}</TabsTrigger>
          <TabsTrigger value="purchase_analytics"><BarChart2 className="w-4 h-4 mr-1"/>{t('analyticsReport')}</TabsTrigger>
          <TabsTrigger value="detailed_bill"><History className="w-4 h-4 mr-1"/>{t('detailedBill')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee_ids"><EmployeeIdManager /></TabsContent>
        <TabsContent value="item_definitions"><ItemManager /></TabsContent>
        <TabsContent value="partners"><PartnerManager /></TabsContent>
        <TabsContent value="printer_names"><PrinterManager /></TabsContent>
        <TabsContent value="bulk_upload"><BulkIdUploader /></TabsContent>
        <TabsContent value="download_reports"><PurchaseDataDownloader /></TabsContent>
        <TabsContent value="detailed_bill"><DetailedBillView /></TabsContent>
        
        <TabsContent value="purchase_analytics" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('selectDateRangeNote')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">{t('startDate')}</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                </div>
                <div>
                  <Label htmlFor="endDate">{t('endDate')}</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchAndAggregatePurchases} className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? t('loading') : t('fetchData')}
                </Button>
                <Button onClick={downloadAnalytics} variant="outline" disabled={Object.keys(dateWiseSummary).length === 0}>
                  <Download className="w-4 h-4 mr-2" /> {t('downloadReports')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {Object.keys(dateWiseSummary).length > 0 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <CardDescription>{t('overallSummary')}</CardDescription>
                  <CardTitle className="text-4xl font-bold text-primary">{overallSummary.toFixed(2)}</CardTitle>
                </CardHeader>
              </Card>
              
              <AnalyticsCharts 
                  dateWiseSummary={dateWiseSummary}
                  clinicCodeWiseSummary={clinicCodeWiseSummary}
                  partnerWiseSummary={partnerWiseSummary}
                  itemWiseSummary={itemWiseSummary}
                  userWiseSummary={userWiseSummary}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}