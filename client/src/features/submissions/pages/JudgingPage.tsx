'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { Gavel, Trophy, Medal, ExternalLink } from 'lucide-react';
import { submissionsApi, submissionsQueryKeys } from '../api';
import type { LeaderboardRow } from '../types';
import { ScoreModal } from '../components/ScoreModal';

export default function JudgingPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [scoreTarget, setScoreTarget] = useState<LeaderboardRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: submissionsQueryKeys.leaderboard(eventId),
    queryFn: () => submissionsApi.leaderboard(eventId),
  });

  const scoreMutation = useMutation({
    mutationFn: ({ submissionId, scores }: { submissionId: string; scores: Parameters<typeof submissionsApi.submitScore>[1] }) =>
      submissionsApi.submitScore(submissionId, scores),
    onSuccess: () => {
      toast.success('Score submitted');
      queryClient.invalidateQueries({ queryKey: submissionsQueryKeys.leaderboard(eventId) });
      queryClient.invalidateQueries({ queryKey: submissionsQueryKeys.list(eventId) });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const leaderboard: LeaderboardRow[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gavel className="h-6 w-6 text-amber-400" /> Judging & Leaderboard
        </h1>
        <p className="text-sm text-gray-400">Rank submitted projects and record your scores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" /> Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading leaderboard...</p>
          ) : leaderboard.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No submitted projects to judge yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Final Score</TableHead>
                  <TableHead>Judges</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.submission_id}>
                    <TableCell>
                      <span className="flex items-center gap-1.5 font-mono text-white">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
                        {index === 1 && <Medal className="h-4 w-4 text-gray-300" />}
                        {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                        #{index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-white">{entry.title}</p>
                    </TableCell>
                    <TableCell className="text-gray-300">{entry.team_name}</TableCell>
                    <TableCell>
                      <Badge variant={Number(entry.final_score) >= 75 ? 'success' : Number(entry.final_score) >= 50 ? 'info' : 'neutral'}>
                        {entry.final_score != null ? Number(entry.final_score).toFixed(2) : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{entry.total_votes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {entry.repo_url && (
                          <a href={entry.repo_url} target="_blank" rel="noreferrer" aria-label={`${entry.title} repository`} className="text-indigo-400 hover:text-indigo-300">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {entry.demo_url && (
                          <a href={entry.demo_url} target="_blank" rel="noreferrer" aria-label={`${entry.title} demo`} className="text-emerald-400 hover:text-emerald-300">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="secondary" onClick={() => setScoreTarget(entry)}>
                        Score
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ScoreModal
        open={scoreTarget !== null}
        onOpenChange={(open) => !open && setScoreTarget(null)}
        submissionTitle={scoreTarget?.title ?? ''}
        teamName={scoreTarget?.team_name ?? ''}
        onSubmit={(scores) => scoreMutation.mutateAsync({ submissionId: scoreTarget!.submission_id, scores }).then(() => undefined)}
        isLoading={scoreMutation.isPending}
      />
    </div>
  );
}
