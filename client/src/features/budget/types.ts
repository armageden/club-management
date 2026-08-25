export type ContributionType = 'cash' | 'in_kind';
export type ExpenditureCategory = 'venue' | 'catering' | 'swag' | 'prizes' | 'marketing' | 'other';
export type SponsorTier = 'title' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'community';

export interface LedgerEntry {
  id: string;
  entry_type: 'contribution' | 'expenditure';
  amount: number;
  party: string | null;
  contribution_type: ContributionType | null;
  tier: SponsorTier | null;
  category: ExpenditureCategory | null;
  description: string | null;
  occurred_at: string;
  recorded_by_name: string | null;
}

export interface BudgetSummary {
  totalCash: number;
  totalInKind: number;
  totalContributions: number;
  contributionCount: number;
  totalExpenditures: number;
  expenditureCount: number;
  netBalance: number;
  expendituresByCategory: { category: ExpenditureCategory; total: number }[];
}

export interface CreateContributionRequest {
  eventId: string;
  sponsorName: string;
  contactName?: string;
  contactEmail?: string;
  tier?: SponsorTier;
  contributionType: ContributionType;
  amount: number;
  description?: string;
  receivedAt?: string;
}

export interface CreateExpenditureRequest {
  eventId: string;
  category: ExpenditureCategory;
  amount: number;
  vendor?: string;
  description?: string;
  spentAt?: string;
}
