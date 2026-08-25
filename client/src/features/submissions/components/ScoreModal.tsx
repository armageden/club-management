'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/Dialog';

const scoreSchema = z.object({
  scoreInnovation: z.coerce.number().min(0).max(100),
  scoreTechnical: z.coerce.number().min(0).max(100),
  scorePresentation: z.coerce.number().min(0).max(100),
  scoreUsefulness: z.coerce.number().min(0).max(100),
  feedback: z.string().optional(),
});

type ScoreFormData = z.infer<typeof scoreSchema>;

interface ScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionTitle: string;
  teamName: string;
  onSubmit: (data: ScoreFormData) => Promise<unknown>;
  isLoading?: boolean;
}

const criteria: { name: keyof Omit<ScoreFormData, 'feedback'>; label: string; hint: string }[] = [
  { name: 'scoreInnovation', label: 'Innovation', hint: 'Originality of the idea' },
  { name: 'scoreTechnical', label: 'Technical', hint: 'Implementation quality' },
  { name: 'scorePresentation', label: 'Presentation', hint: 'Pitch & demo clarity' },
  { name: 'scoreUsefulness', label: 'Usefulness', hint: 'Real-world impact' },
];

export function ScoreModal({ open, onOpenChange, submissionTitle, teamName, onSubmit, isLoading }: ScoreModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      scoreInnovation: 50,
      scoreTechnical: 50,
      scorePresentation: 50,
      scoreUsefulness: 50,
      feedback: '',
    },
  });

  const values = watch();
  const average = Math.round(
    ((Number(values.scoreInnovation) || 0) +
      (Number(values.scoreTechnical) || 0) +
      (Number(values.scorePresentation) || 0) +
      (Number(values.scoreUsefulness) || 0)) /
      4
  );

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFormSubmit = async (data: ScoreFormData) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Score Project</DialogTitle>
          <DialogDescription>
            {submissionTitle} - {teamName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {criteria.map((criterion) => (
            <div key={criterion.name}>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor={criterion.name} className="text-sm text-gray-300">
                  {criterion.label} <span className="text-xs text-gray-500">({criterion.hint})</span>
                </label>
                <span className="font-mono text-sm text-indigo-400">{Number(values[criterion.name]) || 0}</span>
              </div>
              <Input
                id={criterion.name}
                type="range"
                min={0}
                max={100}
                step={1}
                {...register(criterion.name)}
              />
              {errors[criterion.name] && <p className="mt-1 text-xs text-red-400">{errors[criterion.name]?.message}</p>}
            </div>
          ))}

          <p className="text-sm text-gray-400">
            Average total: <span className="font-mono font-bold text-white">{average}</span>/100
          </p>

          <div>
            <label htmlFor="score-feedback" className="mb-1 block text-sm text-gray-300">Feedback</label>
            <Textarea id="score-feedback" rows={3} placeholder="Optional feedback for the team" {...register('feedback')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Score'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
