'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';

const createShiftSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().optional(),
    location: z.string().max(255).optional(),
    startsAt: z.string().min(1, 'Start time is required'),
    endsAt: z.string().min(1, 'End time is required'),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    requiredSkills: z.string().optional(),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  });

type CreateShiftFormData = z.infer<typeof createShiftSchema>;

interface CreateShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CreateShiftFormData, never> & { startsAtIso: string; endsAtIso: string }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateShiftModal({ open, onOpenChange, onSubmit, isLoading }: CreateShiftModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateShiftFormData>({
    resolver: zodResolver(createShiftSchema),
    defaultValues: { title: '', description: '', location: '', startsAt: '', endsAt: '', capacity: 1, requiredSkills: '' },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: CreateShiftFormData) => {
    await onSubmit({
      ...data,
      capacity: Number(data.capacity),
      startsAtIso: new Date(data.startsAt).toISOString(),
      endsAtIso: new Date(data.endsAt).toISOString(),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Volunteer Shift</DialogTitle>
          <DialogDescription>Define a shift that volunteers can be assigned to.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="shift-title" className="mb-1 block text-sm text-gray-300">Title</label>
            <Input id="shift-title" placeholder="e.g. Registration desk - morning" {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="shift-description" className="mb-1 block text-sm text-gray-300">Description</label>
            <Textarea id="shift-description" rows={2} placeholder="What does this shift involve?" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="shift-starts" className="mb-1 block text-sm text-gray-300">Starts At</label>
              <Input id="shift-starts" type="datetime-local" {...register('startsAt')} />
              {errors.startsAt && <p className="mt-1 text-xs text-red-400">{errors.startsAt.message}</p>}
            </div>
            <div>
              <label htmlFor="shift-ends" className="mb-1 block text-sm text-gray-300">Ends At</label>
              <Input id="shift-ends" type="datetime-local" {...register('endsAt')} />
              {errors.endsAt && <p className="mt-1 text-xs text-red-400">{errors.endsAt.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="shift-capacity" className="mb-1 block text-sm text-gray-300">Capacity</label>
              <Input id="shift-capacity" type="number" min={1} {...register('capacity')} />
              {errors.capacity && <p className="mt-1 text-xs text-red-400">{errors.capacity.message}</p>}
            </div>
            <div>
              <label htmlFor="shift-location" className="mb-1 block text-sm text-gray-300">Location</label>
              <Input id="shift-location" placeholder="e.g. Main Hall" {...register('location')} />
              {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="shift-skills" className="mb-1 block text-sm text-gray-300">Required Skills</label>
            <Input id="shift-skills" placeholder="e.g. First aid, AV setup" {...register('requiredSkills')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Shift'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
