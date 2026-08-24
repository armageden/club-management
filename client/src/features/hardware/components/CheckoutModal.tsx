'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import type { HardwareItem, User } from '@/types/api';
import { Package } from 'lucide-react';

const checkoutSchema = z.object({
  hardware_item_id: z.string().uuid(),
  borrower_user_id: z.string().uuid(),
  due_at: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HardwareItem | null;
  participants: User[];
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutModal({ open, onOpenChange, item, participants, onSubmit, isLoading }: CheckoutModalProps) {
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      hardware_item_id: item?.id ?? '',
      borrower_user_id: '',
      due_at: null,
      notes: '',
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset({ hardware_item_id: item?.id ?? '', borrower_user_id: '', due_at: null, notes: '' });
    setDueDate(null);
  };

  const handleFormSubmit = async (data: CheckoutFormData) => {
    try {
      const submitData = {
        ...data,
        due_at: dueDate ? dueDate.toISOString() : undefined,
      };
      await onSubmit(submitData);
      handleClose();
    } catch {
      // Error handled by mutation
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Checkout Hardware</DialogTitle>
          <DialogDescription>
            Check out <strong>{item.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Item Info */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.category || 'No category'} • {item.model || 'No model'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={item.status} />
                    <Badge variant="primary">{item.quantity_available} available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrower */}
          <Select
            label="Borrower *"
            placeholder="Select participant"
            options={participants.map(p => ({ value: p.id, label: `${p.full_name} (${p.email})` }))}
            {...register('borrower_user_id')}
            error={errors.borrower_user_id?.message}
          />

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date &amp; Time *</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input-base flex-1"
                value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setDueDate(date);
                }}
              />
              <input
                type="time"
                className="input-base w-32"
                value={dueDate ? dueDate.toTimeString().slice(0, 5) : ''}
                onChange={(e) => {
                  if (dueDate && e.target.value) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(dueDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setDueDate(newDate);
                  }
                }}
              />
            </div>
            {!dueDate && <p className="text-xs text-red-400 mt-1">Due time is required</p>}
          </div>

          {/* Notes */}
          <Input
            label="Notes"
            placeholder="Optional notes about this checkout"
            {...register('notes')}
            error={errors.notes?.message}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading || !dueDate}>
              Checkout Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}