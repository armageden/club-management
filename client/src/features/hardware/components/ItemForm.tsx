'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import type { HardwareItem } from '../types';
import { HARDWARE_CATEGORIES, HARDWARE_CONDITIONS, HARDWARE_STATUSES } from '../types';

const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  quantity_available: z.coerce.number().int().min(0, 'Quantity must be >= 0').default(1),
  condition: z.enum(['new', 'good', 'fair', 'damaged', 'retired']).default('good'),
  status: z.enum(['available', 'checked_out', 'damaged', 'lost', 'retired']).default('available'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof createItemSchema>;

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: HardwareItem | null;
  isLoading?: boolean;
  title?: string;
}

export function ItemForm({ open, onOpenChange, onSubmit, initialData, isLoading, title }: ItemFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: '',
      category: '',
      model: '',
      serial_number: '',
      quantity_available: 1,
      condition: 'good',
      status: 'available',
      location: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          category: initialData.category || '',
          model: initialData.model || '',
          serial_number: initialData.serial_number || '',
          quantity_available: initialData.quantity_available,
          condition: initialData.condition as ItemFormData['condition'],
          status: initialData.status,
          location: initialData.location || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          name: '',
          category: '',
          model: '',
          serial_number: '',
          quantity_available: 1,
          condition: 'good',
          status: 'available',
          location: '',
          notes: '',
        });
      }
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: ItemFormData) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title || (isEditing ? 'Edit Hardware Item' : 'Add Hardware Item')}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the hardware item details below.' : 'Fill in the details to add a new hardware item to the inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name *"
              placeholder="e.g., Arduino Uno R3"
              {...register('name')}
              error={errors.name?.message}
            />
            <Select
              label="Category"
              placeholder="Select category"
              options={[{ value: '', label: 'Select...' }, ...HARDWARE_CATEGORIES.map(c => ({ value: c, label: c }))]}
              {...register('category')}
              error={errors.category?.message}
            />
            <Input
              label="Model"
              placeholder="e.g., A000066"
              {...register('model')}
              error={errors.model?.message}
            />
            <Input
              label="Serial Number"
              placeholder="Optional"
              {...register('serial_number')}
              error={errors.serial_number?.message}
            />
            <Input
              label="Quantity Available"
              type="number"
              min="0"
              placeholder="1"
              {...register('quantity_available', { valueAsNumber: true })}
              error={errors.quantity_available?.message}
            />
            <Select
              label="Condition"
              placeholder="Select condition"
              options={HARDWARE_CONDITIONS.map(c => ({ value: c.value, label: c.label }))}
              {...register('condition')}
              error={errors.condition?.message}
            />
            <Select
              label="Status"
              placeholder="Select status"
              options={HARDWARE_STATUSES.map(s => ({ value: s.value, label: s.label }))}
              {...register('status')}
              error={errors.status?.message}
            />
            <Input
              label="Location"
              placeholder="e.g., Shelf A-3, Lab 2"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-base resize-y min-h-[80px]"
              placeholder="Additional notes about this item..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              {isEditing ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}