// src/components/admin/printer-manager.tsx
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { AdminManagedItem } from '@/types';
import { getPrinterNamesFS } from '@/lib/data';
import { addPrinterNameAction, removePrinterNameAction } from '@/lib/actions';
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

export function PrinterManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [printerNames, setPrinterNames] = useState<AdminManagedItem[]>([]);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [itemNameForDialog, setItemNameForDialog] = useState<string>('');


  const fetchPrinterNames = async () => {
    setPrinterNames(await getPrinterNamesFS());
  };

  useEffect(() => {
    fetchPrinterNames();
  }, []);

  const handleAddPrinterName = async () => {
    if (!newPrinterName.trim()) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Printer name cannot be empty." });
      return;
    }
    startTransition(async () => {
      const result = await addPrinterNameAction(newPrinterName.trim());
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('printerName')} "${newPrinterName}" ${t('addNew')}d.` });
        setNewPrinterName('');
        fetchPrinterNames();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
    });
  };

  const handleRemovePrinterName = async (id: string) => {
    startTransition(async () => {
      const result = await removePrinterNameAction(id);
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('printerName')} removed.` });
        fetchPrinterNames();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
      setItemToRemove(null);
    });
  };
  
  const openConfirmationDialog = (item: AdminManagedItem) => {
    setItemToRemove(item.id);
    setItemNameForDialog(item.name);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{t('managePrinterNames')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <Input
            type="text"
            value={newPrinterName}
            onChange={(e) => setNewPrinterName(e.target.value)}
            placeholder={t('printerName')}
            className="flex-grow text-base md:text-sm"
          />
          <Button onClick={handleAddPrinterName} disabled={isPending} className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> {t('addPrinterName')}
          </Button>
        </div>
        <ScrollArea className="h-[300px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('printerName')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printerNames.length > 0 ? printerNames.map((printer) => (
                <TableRow key={printer.id}>
                  <TableCell>{printer.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => openConfirmationDialog(printer)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">{t('noPrinterNames')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
       <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>
               {t('confirmRemove')} {t('printerName')}: {itemNameForDialog}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToRemove && handleRemovePrinterName(itemToRemove)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? `${t('confirm')}...` : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
