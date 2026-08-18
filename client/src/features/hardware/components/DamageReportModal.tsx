'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import type { HardwareCheckout } from '../types';
import { DAMAGE_SEVERITIES } from '../types';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const damageReportSchema = z.object({
  hardware_item_id: z.string().uuid(),
  checkout_id: z.string().uuid().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
});

type DamageReportFormData = z.infer<typeof damageReportSchema>;

interface DamageReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
  checkoutId?: string;
  onSubmit: (data: DamageReportFormData) => Promise<void>;
  isLoading?: boolean;
}

export function DamageReportModal({ open, onOpenChange, itemId, itemName, checkoutId, onSubmit, isLoading }: DamageReportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DamageReportFormData>({
    resolver: zodResolver(damageReportSchema),
    defaultValues: {
      hardware_item_id: itemId,
      checkout_id: checkoutId,
      description: '',
      severity: 'minor',
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset({ hardware_item_id: itemId, checkout_id: checkoutId, description: '', severity: 'minor' });
  };

  const handleFormSubmit = async (data: DamageReportFormData) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <DialogTitle>Report Damage</DialogTitle>
          </div>
          <DialogDescription>
            Report damage for <strong>{itemName}</strong>. This will mark the item as damaged in inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Item Info */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{itemName}</p>
                  <p className="text-sm text-gray-400">This item will be marked as damaged and unavailable for checkout.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-base resize-y min-h-[100px]"
              placeholder="Describe the damage in detail (what happened, which parts are affected, etc.)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Severity */}
          <Select
            label="Severity *"
            placeholder="Select severity"
            options={DAMAGE_SEVERITIES.map(s => ({ value: s.value, label: s.label }))}
            {...register('severity')}
            error={errors.severity?.message}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading} variant="danger">
              Submit Damage Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}