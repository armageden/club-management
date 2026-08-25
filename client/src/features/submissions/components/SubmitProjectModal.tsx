'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';

const submitProjectSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().optional(),
    repoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
    demoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
    status: z.enum(['draft', 'submitted']),
    teamId: z.string().uuid('Select a team').or(z.literal('__new__')),
    newTeamName: z.string().optional(),
  })
  .refine((data) => data.teamId !== '__new__' || (data.newTeamName ?? '').trim().length >= 2, {
    message: 'Enter a team name',
    path: ['newTeamName'],
  });

type SubmitProjectFormData = z.infer<typeof submitProjectSchema>;

interface SubmitProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: { id: string; name: string }[];
  onSubmit: (data: { title: string; description?: string; repoUrl?: string; demoUrl?: string; status: 'draft' | 'submitted'; teamId: string }) => Promise<unknown>;
  onCreateTeam: (name: string) => Promise<{ id: string }>;
  isLoading?: boolean;
}

export function SubmitProjectModal({ open, onOpenChange, teams, onSubmit, onCreateTeam, isLoading }: SubmitProjectModalProps) {
  const [isNewTeam, setIsNewTeam] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubmitProjectFormData>({
    resolver: zodResolver(submitProjectSchema),
    defaultValues: { title: '', description: '', repoUrl: '', demoUrl: '', status: 'submitted', teamId: '', newTeamName: '' },
  });

  const teamId = watch('teamId');

  const handleClose = () => {
    onOpenChange(false);
    setIsNewTeam(false);
    reset();
  };

  const handleFormSubmit = async (data: SubmitProjectFormData) => {
    let resolvedTeamId = data.teamId;
    if (data.teamId === '__new__' && data.newTeamName) {
      const team = await onCreateTeam(data.newTeamName.trim());
      resolvedTeamId = team.id;
    }
    await onSubmit({
      title: data.title,
      description: data.description || undefined,
      repoUrl: data.repoUrl || undefined,
      demoUrl: data.demoUrl || undefined,
      status: data.status,
      teamId: resolvedTeamId,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Project</DialogTitle>
          <DialogDescription>Register your team&apos;s project for judging.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="project-title" className="mb-1 block text-sm text-gray-300">Title</label>
            <Input id="project-title" placeholder="Project name" {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="mb-1 block text-sm text-gray-300">Description</label>
            <Textarea id="project-description" rows={3} placeholder="What does your project do?" {...register('description')} />
          </div>

          <div>
            <label htmlFor="project-team" className="mb-1 block text-sm text-gray-300">Team</label>
            {!isNewTeam ? (
              <Select
                id="project-team"
                placeholder="Select a team..."
                options={[
                  ...teams.map((team) => ({ value: team.id, label: team.name })),
                  { value: '__new__', label: '+ Create new team' },
                ]}
                {...register('teamId')}
              />
            ) : (
              <div className="flex gap-2">
                <Input placeholder="New team name" {...register('newTeamName')} />
                <Button type="button" variant="secondary" onClick={() => setIsNewTeam(false)}>Pick existing</Button>
              </div>
            )}
            {(errors.teamId || errors.newTeamName) && (
              <p className="mt-1 text-xs text-red-400">{errors.teamId?.message ?? errors.newTeamName?.message}</p>
            )}
            {!isNewTeam && !teamId && !teams.length && (
              <p className="mt-1 text-xs text-gray-500">No teams yet - choose &quot;Create new team&quot;.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-repo" className="mb-1 block text-sm text-gray-300">Repo URL</label>
              <Input id="project-repo" placeholder="https://github.com/..." {...register('repoUrl')} />
              {errors.repoUrl && <p className="mt-1 text-xs text-red-400">{errors.repoUrl.message}</p>}
            </div>
            <div>
              <label htmlFor="project-demo" className="mb-1 block text-sm text-gray-300">Demo URL</label>
              <Input id="project-demo" placeholder="https://..." {...register('demoUrl')} />
              {errors.demoUrl && <p className="mt-1 text-xs text-red-400">{errors.demoUrl.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="project-status" className="mb-1 block text-sm text-gray-300">Submit as</label>
            <Select
              id="project-status"
              options={[
                { value: 'submitted', label: 'Submitted (visible to judges)' },
                { value: 'draft', label: 'Draft' },
              ]}
              {...register('status')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
