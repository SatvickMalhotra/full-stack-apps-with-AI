// src/components/admin/partner-manager.tsx
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Trash2, PlusCircle, Edit } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { Partner } from '@/types';
import { getPartnersFS } from '@/lib/data'; 
import { addPartnerAction, updatePartnerAction, removePartnerAction } from '@/lib/actions';
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

const initialFormState = { id: '', name: '' };

export function PartnerManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partner>(initialFormState);
  const [partnerToRemove, setPartnerToRemove] = useState<Partner | null>(null);

  const fetchPartners = async () => {
    setPartners(await getPartnersFS());
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData(partner);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPartner(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: t('errorOccurred'), description: "Partner name cannot be empty."});
      return;
    }

    startTransition(async () => {
      let result;
      if (editingPartner) {
        result = await updatePartnerAction(editingPartner.id, formData.name);
      } else {
        result = await addPartnerAction(formData.name);
      }

      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('partnerName')} ${editingPartner ? t('updated') : t('addNew')}d.` });
        setIsDialogOpen(false);
        fetchPartners();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
    });
  };

  const openDeleteConfirmDialog = (partner: Partner) => {
    setPartnerToRemove(partner);
  };
  
  const handleDelete = async () => {
    if (!partnerToRemove) return;
    startTransition(async () => {
      const result = await removePartnerAction(partnerToRemove.id);
      if (result.success) {
        toast({ title: t('operationSuccess'), description: `${t('partnerName')} "${partnerToRemove.name}" removed.` });
        fetchPartners();
      } else {
        toast({ variant: "destructive", title: t('errorOccurred'), description: t(result.message || 'errorOccurred') });
      }
      setPartnerToRemove(null); // Close dialog
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>{t('managePartners')}</CardTitle>
          <Button onClick={handleAddNew} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> {t('addPartner')}
          </Button>
        </div>
        <CardDescription>{t('noPartners')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('partnerNameLabel')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length > 0 ? partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell className="text-right space-x-1">
                     <Button variant="outline" size="icon" onClick={() => handleEdit(partner)} disabled={isPending} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">{t('edit')}</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => openDeleteConfirmDialog(partner)} disabled={isPending} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">{t('delete')}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">{t('noPartners')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPartner ? t('edit') : t('addNew')} {t('partnerName')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name" className="sr-only">{t('partnerNameLabel')}</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('enterPartnerName')} required />
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

      <AlertDialog open={!!partnerToRemove} onOpenChange={(open) => !open && setPartnerToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemove')} {t('partnerName')}: {partnerToRemove?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartnerToRemove(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? `${t('confirm')}...` : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
