'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { GitBranch, ExternalLink, Plus } from 'lucide-react';
import { submissionsApi, submissionsQueryKeys } from '../api';
import type { SubmissionRow, TeamRow } from '../types';
import { SubmitProjectModal } from '../components/SubmitProjectModal';
import { formatDateTime } from '@/lib/formatters';

export default function ProjectsPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: submissionsQueryKeys.list(eventId),
    queryFn: () => submissionsApi.list(eventId),
  });

  const { data: teamsData } = useQuery({
    queryKey: submissionsQueryKeys.teams(eventId),
    queryFn: () => submissionsApi.listTeams(eventId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: submissionsQueryKeys.list(eventId) });
    queryClient.invalidateQueries({ queryKey: submissionsQueryKeys.teams(eventId) });
    queryClient.invalidateQueries({ queryKey: submissionsQueryKeys.leaderboard(eventId) });
  };

  const createTeamMutation = useMutation({
    mutationFn: (name: string) => submissionsApi.createTeam({ eventId, name }),
    onError: (error: Error) => toast.error(error.message),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; repoUrl?: string; demoUrl?: string; status: 'draft' | 'submitted'; teamId: string }) =>
      submissionsApi.create({ eventId, ...payload }),
    onSuccess: () => {
      toast.success('Project saved');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCreateTeam = async (name: string): Promise<TeamRow> => {
    const res = await createTeamMutation.mutateAsync(name);
    if (!res.data) throw new Error('Team creation failed');
    return res.data;
  };

  const submissions: SubmissionRow[] = data?.data ?? [];
  const teams: TeamRow[] = teamsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-indigo-400" /> Projects
          </h1>
          <p className="text-sm text-gray-400">All project submissions for this event.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Submit Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading projects...</p>
          ) : submissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No projects yet. Be the first to submit!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Judge Scores</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Links</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <p className="font-medium text-white">{submission.title}</p>
                      {submission.description && (
                        <p className="max-w-sm truncate text-xs text-gray-500">{submission.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">{submission.team_name}</TableCell>
                    <TableCell><StatusBadge status={submission.status} /></TableCell>
                    <TableCell className="text-gray-300">{submission.score_count}</TableCell>
                    <TableCell className="text-gray-400">
                      {submission.submitted_at ? formatDateTime(submission.submitted_at) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {submission.repo_url && (
                          <a href={submission.repo_url} target="_blank" rel="noreferrer" aria-label={`${submission.title} repository`} className="text-indigo-400 hover:text-indigo-300">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {submission.demo_url && (
                          <a href={submission.demo_url} target="_blank" rel="noreferrer" aria-label={`${submission.title} demo`} className="text-emerald-400 hover:text-emerald-300">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SubmitProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        teams={teams}
        onSubmit={(payload) => createMutation.mutateAsync(payload).then(() => undefined)}
        onCreateTeam={handleCreateTeam}
        isLoading={createMutation.isPending || createTeamMutation.isPending}
      />
    </div>
  );
}
