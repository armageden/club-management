'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import type { VolunteerShiftRow, UserOption } from '../types';

const assignSchema = z.object({
  userId: z.string().uuid('Select a volunteer'),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface AssignVolunteerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: VolunteerShiftRow | null;
  users: UserOption[];
  onSubmit: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AssignVolunteerModal({ open, onOpenChange, shift, users, onSubmit, isLoading }: AssignVolunteerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
    defaultValues: { userId: '' },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: AssignFormData) => {
    await onSubmit(data.userId);
    handleClose();
  };

  const remaining = shift ? shift.capacity - Number(shift.filled_slots) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Volunteer</DialogTitle>
          <DialogDescription>
            {shift ? `${shift.title} - ${remaining} slot(s) left` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="assign-user" className="mb-1 block text-sm text-gray-300">Volunteer</label>
            <Select
              id="assign-user"
              placeholder="Select a user..."
              options={users.map((user) => ({
                value: user.id,
                label: `${user.full_name} (${user.email})`,
              }))}
              {...register('userId')}
            />
            {errors.userId && <p className="mt-1 text-xs text-red-400">{errors.userId.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || remaining <= 0}>
              {isLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
