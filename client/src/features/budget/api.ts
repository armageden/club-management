import { api } from '@/lib/api';
import type {
  BudgetSummary,
  CreateContributionRequest,
  CreateExpenditureRequest,
  LedgerEntry,
} from './types';

export const budgetApi = {
  ledger: (eventId: string) => api.get<LedgerEntry[]>(`/budget/ledger/${eventId}`),

  summary: (eventId: string) => api.get<BudgetSummary>(`/budget/summary/${eventId}`),

  createContribution: (data: CreateContributionRequest) =>
    api.post<LedgerEntry>('/budget/contributions', data),

  createExpenditure: (data: CreateExpenditureRequest) =>
    api.post<LedgerEntry>('/budget/expenditures', data),
};

export const budgetQueryKeys = {
  ledger: (eventId: string) => ['budget', 'ledger', eventId] as const,
  summary: (eventId: string) => ['budget', 'summary', eventId] as const,
};
