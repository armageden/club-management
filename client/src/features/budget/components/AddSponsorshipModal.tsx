'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import type { ContributionType, SponsorTier } from '../types';

const addSponsorshipSchema = z.object({
  sponsorName: z.string().min(2, 'Sponsor name must be at least 2 characters').max(255),
  tier: z.string().optional(),
  contributionType: z.enum(['cash', 'in_kind']),
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).nonnegative('Amount must be zero or positive'),
  contactName: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
});

type AddSponsorshipFormData = z.infer<typeof addSponsorshipSchema>;

interface AddSponsorshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSubmit: (data: {
    sponsorName: string;
    tier?: SponsorTier;
    contributionType: ContributionType;
    amount: number;
    contactName?: string;
    description?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AddSponsorshipModal({ open, onOpenChange, onSubmit, isLoading }: AddSponsorshipModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSponsorshipFormData>({
    resolver: zodResolver(addSponsorshipSchema),
    defaultValues: { sponsorName: '', tier: '', contributionType: 'cash', amount: undefined, contactName: '', description: '' },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: AddSponsorshipFormData) => {
    await onSubmit({
      sponsorName: data.sponsorName,
      tier: (data.tier || undefined) as SponsorTier | undefined,
      contributionType: data.contributionType,
      amount: Number(data.amount),
      contactName: data.contactName || undefined,
      description: data.description || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Sponsorship</DialogTitle>
          <DialogDescription>Record a sponsor contribution (cash or in-kind) for this event.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="sponsor-name" className="mb-1 block text-sm text-gray-300">Sponsor Name</label>
            <Input id="sponsor-name" placeholder="e.g. Acme Corp" {...register('sponsorName')} />
            {errors.sponsorName && <p className="mt-1 text-xs text-red-400">{errors.sponsorName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sponsor-tier" className="mb-1 block text-sm text-gray-300">Tier</label>
              <Select
                id="sponsor-tier"
                options={[
                  { value: '', label: 'No tier' },
                  { value: 'title', label: 'Title' },
                  { value: 'platinum', label: 'Platinum' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'bronze', label: 'Bronze' },
                  { value: 'community', label: 'Community' },
                ]}
                {...register('tier')}
              />
            </div>
            <div>
              <label htmlFor="sponsor-type" className="mb-1 block text-sm text-gray-300">Contribution Type</label>
              <Select
                id="sponsor-type"
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'in_kind', label: 'In-kind' },
                ]}
                {...register('contributionType')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sponsor-amount" className="mb-1 block text-sm text-gray-300">Amount (USD)</label>
              <Input id="sponsor-amount" type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
            </div>
            <div>
              <label htmlFor="sponsor-contact" className="mb-1 block text-sm text-gray-300">Contact Name</label>
              <Input id="sponsor-contact" placeholder="Optional" {...register('contactName')} />
            </div>
          </div>

          <div>
            <label htmlFor="sponsor-description" className="mb-1 block text-sm text-gray-300">Description</label>
            <Textarea id="sponsor-description" rows={2} placeholder="e.g. Cash sponsorship for venue, or 50 t-shirts (in-kind)" {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Log Sponsorship'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
