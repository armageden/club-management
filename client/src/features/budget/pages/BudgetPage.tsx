'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import {
  Wallet,
  HandCoins,
  Receipt,
  Scale,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { budgetApi, budgetQueryKeys } from '../api';
import type { LedgerEntry, SponsorTier } from '../types';
import { AddSponsorshipModal } from '../components/AddSponsorshipModal';
import { AddExpenditureModal } from '../components/AddExpenditureModal';
import { formatCurrency, formatDateTime, capitalize } from '@/lib/formatters';

const categoryLabels: Record<string, string> = {
  venue: 'Venue',
  catering: 'Catering',
  swag: 'Swag',
  prizes: 'Prizes',
  marketing: 'Marketing',
  other: 'Other',
};

const tierVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral'> = {
  title: 'danger',
  platinum: 'info',
  gold: 'warning',
  silver: 'neutral',
  bronze: 'default',
  community: 'success',
};

export default function BudgetPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [sponsorshipOpen, setSponsorshipOpen] = useState(false);
  const [expenditureOpen, setExpenditureOpen] = useState(false);

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: budgetQueryKeys.ledger(eventId),
    queryFn: () => budgetApi.ledger(eventId),
  });

  const { data: summaryData } = useQuery({
    queryKey: budgetQueryKeys.summary(eventId),
    queryFn: () => budgetApi.summary(eventId),
  });

  const invalidateBudget = () => {
    queryClient.invalidateQueries({ queryKey: budgetQueryKeys.ledger(eventId) });
    queryClient.invalidateQueries({ queryKey: budgetQueryKeys.summary(eventId) });
  };

  const contributionMutation = useMutation({
    mutationFn: (payload: {
      sponsorName: string;
      tier?: SponsorTier;
      contributionType: 'cash' | 'in_kind';
      amount: number;
      contactName?: string;
      description?: string;
    }) =>
      budgetApi.createContribution({
        eventId,
        sponsorName: payload.sponsorName,
        tier: payload.tier || undefined,
        contributionType: payload.contributionType,
        amount: payload.amount,
        contactName: payload.contactName || undefined,
        description: payload.description || undefined,
      }),
    onSuccess: () => {
      toast.success('Sponsorship logged');
      invalidateBudget();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const expenditureMutation = useMutation({
    mutationFn: (payload: {
      category: string;
      amount: number;
      vendor?: string;
      description?: string;
    }) =>
      budgetApi.createExpenditure({
        eventId,
        category: payload.category as 'venue' | 'catering' | 'swag' | 'prizes' | 'marketing' | 'other',
        amount: payload.amount,
        vendor: payload.vendor || undefined,
        description: payload.description || undefined,
      }),
    onSuccess: () => {
      toast.success('Expenditure logged');
      invalidateBudget();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const entries: LedgerEntry[] = ledgerData?.data ?? [];
  const summary = summaryData?.data;
  const netPositive = (summary?.netBalance ?? 0) >= 0;
  const utilization =
    summary && summary.totalContributions > 0
      ? Math.min(100, Math.round((summary.totalExpenditures / summary.totalContributions) * 100))
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" /> Budget &amp; Sponsorship Ledger
          </h1>
          <p className="text-sm text-gray-400">Track sponsor contributions against operational expenditures for this event.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSponsorshipOpen(true)}>
            <HandCoins className="mr-2 h-4 w-4" /> Log Sponsorship
          </Button>
          <Button onClick={() => setExpenditureOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" /> Log Expenditure
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <HandCoins className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs text-gray-400">Total Sponsorships</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary?.totalContributions ?? 0)}</p>
              <p className="text-[11px] text-gray-500">
                {formatCurrency(summary?.totalCash ?? 0)} cash · {formatCurrency(summary?.totalInKind ?? 0)} in-kind
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Receipt className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary?.totalExpenditures ?? 0)}</p>
              <p className="text-[11px] text-gray-500">{summary?.expenditureCount ?? 0} entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Scale className={`h-8 w-8 ${netPositive ? 'text-emerald-400' : 'text-red-400'}`} />
            <div>
              <p className="text-xs text-gray-400">Net Balance</p>
              <p className={`text-xl font-bold ${netPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {netPositive ? '+' : ''}{formatCurrency(summary?.netBalance ?? 0)}
              </p>
              <p className="text-[11px] text-gray-500">
                {summary && summary.contributionCount > 0 ? `${utilization ?? 0}% of sponsorship spent` : 'No sponsorship yet'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
              <TrendingDown className="h-3.5 w-3.5" /> Spend by Category
            </p>
            {summary && summary.expendituresByCategory.length > 0 ? (
              <ul className="space-y-1">
                {summary.expendituresByCategory.slice(0, 4).map((row) => (
                  <li key={row.category} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{categoryLabels[row.category] ?? capitalize(row.category)}</span>
                    <span className="font-medium text-gray-100">{formatCurrency(row.total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No expenses logged</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ledger table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Ledger</CardTitle>
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> {summary?.contributionCount ?? 0} contributions
            <span className="text-gray-600">·</span>
            <TrendingDown className="h-4 w-4 text-red-400" /> {summary?.expenditureCount ?? 0} expenditures
          </span>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading ledger...</p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No transactions yet. Log a sponsorship or an expenditure to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const isContribution = entry.entry_type === 'contribution';
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant={isContribution ? 'success' : 'danger'} size="sm">
                          {isContribution ? 'Sponsorship' : 'Expense'}
                        </Badge>
                        {!isContribution && entry.category && (
                          <p className="mt-1 text-[11px] text-gray-500">{categoryLabels[entry.category] ?? entry.category}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {isContribution ? (
                          <div>
                            <p className="font-medium text-white">{entry.party}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {entry.contribution_type === 'in_kind' && (
                                <Badge variant="info" size="sm">In-kind</Badge>
                              )}
                              {entry.tier && (
                                <Badge variant={tierVariant[entry.tier] ?? 'neutral'} size="sm">{capitalize(entry.tier)}</Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-300">{entry.party ?? '-'}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate text-gray-300" title={entry.description ?? undefined}>
                          {entry.description ?? '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-gray-400">{formatDateTime(entry.occurred_at)}</TableCell>
                      <TableCell className="text-gray-400">{entry.recorded_by_name ?? '-'}</TableCell>
                      <TableCell className={`text-right font-semibold ${isContribution ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isContribution ? '+' : '-'}{formatCurrency(entry.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddSponsorshipModal
        open={sponsorshipOpen}
        onOpenChange={setSponsorshipOpen}
        eventId={eventId}
        onSubmit={(payload) => contributionMutation.mutateAsync(payload).then(() => undefined)}
        isLoading={contributionMutation.isPending}
      />

      <AddExpenditureModal
        open={expenditureOpen}
        onOpenChange={setExpenditureOpen}
        eventId={eventId}
        onSubmit={(payload) => expenditureMutation.mutateAsync(payload).then(() => undefined)}
        isLoading={expenditureMutation.isPending}
      />
    </div>
  );
}
