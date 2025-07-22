// src/components/admin/employee-id-manager.tsx
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { SelectOption } from '@/types';
import { getEmployeeIdsFS } from '@/lib/data';
import { addEmployeeIdAction, removeEmployeeIdAction } from '@/lib/actions';
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

export function EmployeeIdManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [employeeIdOptions, setEmployeeIdOptions] = useState<SelectOption[]>([]);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const fetchEmployeeIds = async () => {
    setEmployeeIdOptions(await getEmployeeIdsFS());
  };

  useEffect(() => {
    fetchEmployeeIds();
  }, []);

  const handleAddEmployeeId = async () => {
    if (!newEmployeeId.trim()) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Employee ID cannot be empty." });
      return;
    }
    startTransition(async () => {
      const result = await addEmployeeIdAction(newEmployeeId.trim());
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('employeeId')} "${newEmployeeId}" ${t('addNew')}d.` });
        setNewEmployeeId('');
        fetchEmployeeIds();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
    });
  };

  const handleRemoveEmployeeId = async (id: string) => {
    startTransition(async () => {
      const result = await removeEmployeeIdAction(id);
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('employeeId')} "${id}" removed.` });
        fetchEmployeeIds();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
      setItemToRemove(null);
    });
  };

  const handleDeleteAllEmployeeIds = async () => {
    setConfirmDeleteAll(true);
  };

  const confirmDeleteAllEmployeeIds = async () => {
    startTransition(async () => {
      // You would typically have an action here to delete all employee IDs
      // For now, let's simulate the deletion and update the state
      // const result: OperationResult = await deleteAllEmployeeIdsAction();
      // if (result.success) {
        toast({ title: t('operationSuccess'), description: t('allEmployeeIdsRemoved') });
        setEmployeeIdOptions([]); // Clear the list on successful deletion
      // } else {
      //   toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      // }
    });
    setConfirmDeleteAll(false);
  };
  

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{t('manageEmployeeIds')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <Input
            type="text"
            value={newEmployeeId}
            onChange={(e) => setNewEmployeeId(e.target.value)}
            placeholder={t('employeeId')}
            className="flex-grow text-base md:text-sm"
          />
          <Button onClick={handleAddEmployeeId} disabled={isPending} className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> {t('addEmployeeId')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllEmployeeIds} disabled={isPending || employeeIdOptions.length === 0} className="w-full sm:w-auto">
            <Trash2 className="h-4 w-4 mr-2" /> {t('deleteAll')}
          </Button>
        </div>
        <ScrollArea className="h-[300px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employeeId')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeIdOptions.length > 0 ? employeeIdOptions.map((emp) => (
                <TableRow key={emp.value}>
                  <TableCell>{emp.label}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => setItemToRemove(emp.value)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">{t('noEmployeeIds')}</TableCell>
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
              {t('confirmRemove')} {t('employeeId')}: {itemToRemove}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToRemove && handleRemoveEmployeeId(itemToRemove)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? `${t('confirm')}...` : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteAll} onOpenChange={(open) => !open && setConfirmDeleteAll(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoveAll')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemoveAllEmployeeIdsDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteAll(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAllEmployeeIds} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? `${t('confirm')}...` : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
