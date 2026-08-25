'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import type { ExpenditureCategory } from '../types';

const addExpenditureSchema = z.object({
  category: z.enum(['venue', 'catering', 'swag', 'prizes', 'marketing', 'other']),
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).nonnegative('Amount must be zero or positive'),
  vendor: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
});

type AddExpenditureFormData = z.infer<typeof addExpenditureSchema>;

interface AddExpenditureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSubmit: (data: {
    category: ExpenditureCategory;
    amount: number;
    vendor?: string;
    description?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AddExpenditureModal({ open, onOpenChange, onSubmit, isLoading }: AddExpenditureModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddExpenditureFormData>({
    resolver: zodResolver(addExpenditureSchema),
    defaultValues: { category: 'venue', amount: undefined, vendor: '', description: '' },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: AddExpenditureFormData) => {
    await onSubmit({
      ...data,
      amount: Number(data.amount),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Expenditure</DialogTitle>
          <DialogDescription>Record an operational expense for this event.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-category" className="mb-1 block text-sm text-gray-300">Category</label>
              <Select
                id="expense-category"
                options={[
                  { value: 'venue', label: 'Venue' },
                  { value: 'catering', label: 'Catering' },
                  { value: 'swag', label: 'Swag' },
                  { value: 'prizes', label: 'Prizes' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'other', label: 'Other' },
                ]}
                {...register('category')}
              />
            </div>
            <div>
              <label htmlFor="expense-amount" className="mb-1 block text-sm text-gray-300">Amount (USD)</label>
              <Input id="expense-amount" type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="expense-vendor" className="mb-1 block text-sm text-gray-300">Vendor</label>
            <Input id="expense-vendor" placeholder="e.g. Downtown Conference Center" {...register('vendor')} />
          </div>

          <div>
            <label htmlFor="expense-description" className="mb-1 block text-sm text-gray-300">Description</label>
            <Textarea id="expense-description" rows={2} placeholder="What was this expense for?" {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Log Expenditure'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
