'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import type { IncidentSeverity } from '../types';

const reportIncidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().max(255).optional(),
});

type ReportIncidentFormData = z.infer<typeof reportIncidentSchema>;

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSubmit: (data: { title: string; description?: string; severity: IncidentSeverity; location?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ReportIncidentModal({ open, onOpenChange, onSubmit, isLoading }: ReportIncidentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportIncidentFormData>({
    resolver: zodResolver(reportIncidentSchema),
    defaultValues: { title: '', description: '', severity: 'low', location: '' },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: ReportIncidentFormData) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>Log a new incident for this event.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="incident-title" className="mb-1 block text-sm text-gray-300">Title</label>
            <Input id="incident-title" placeholder="Short summary of the incident" {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="incident-description" className="mb-1 block text-sm text-gray-300">Description</label>
            <Textarea id="incident-description" rows={3} placeholder="What happened?" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="incident-severity" className="mb-1 block text-sm text-gray-300">Severity</label>
              <Select
                id="incident-severity"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                {...register('severity')}
              />
            </div>
            <div>
              <label htmlFor="incident-location" className="mb-1 block text-sm text-gray-300">Location</label>
              <Input id="incident-location" placeholder="e.g. Hall B" {...register('location')} />
              {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Reporting...' : 'Report Incident'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
