'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, createColumns } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { hardwareApi, hardwareQueryKeys } from '../api';
import type { HardwareCheckout } from '@/types/api';
import { formatRelativeTime, formatDateTime, getDueState, dueStateStyles } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { RotateCcw, AlertTriangle, Calendar, Package, MoreVertical, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/export-csv';

// API may enrich checkout rows with these display fields
type EnrichedCheckout = HardwareCheckout & {
  hardware_item_name?: string;
  hardware_item_category?: string;
  borrower_name?: string;
  borrower_email?: string;
  checked_out_by_name?: string;
};

interface HardwareCheckoutsTableProps {
  eventId: string;
  onReturn: (checkout: HardwareCheckout) => void;
  onDamageReport: (item: { id: string; name: string }, checkoutId: string) => void;
  onViewDetails?: (item: { id: string; name: string }) => void;
}

export function HardwareCheckoutsTable({ eventId, onReturn, onDamageReport, onViewDetails }: HardwareCheckoutsTableProps) {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    pageSize: 25,
    sortBy: 'checked_out_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const { data, isLoading } = useQuery({
    queryKey: [...hardwareQueryKeys.checkouts(eventId), filters],
    queryFn: () => hardwareApi.getCheckouts(eventId),
    placeholderData: (prev) => prev,
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return (data.data as EnrichedCheckout[]).filter((checkout) => {
      if (filters.status && checkout.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const hardwareName = checkout.hardware_item_name?.toLowerCase() || '';
        const borrowerName = checkout.borrower_name?.toLowerCase() || '';
        if (!hardwareName.includes(searchLower) && !borrowerName.includes(searchLower)) return false;
      }
      return true;
    });
  }, [data, filters]);

  const columns = useMemo(() => {
    const columnHelper = createColumns<EnrichedCheckout>();
    return [
      columnHelper.accessor('hardware_item_name', {
        header: 'Item',
        cell: (info) => (
          <div>
            <p className="font-medium text-white">{info.getValue() || 'Unknown'}</p>
            {info.row.original.hardware_item_category && (
              <p className="text-xs text-gray-500">{info.row.original.hardware_item_category}</p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('borrower_name', {
        header: 'Borrower',
        cell: (info) => (
          <div>
            <p className="font-medium text-white">{info.getValue() || 'Unknown'}</p>
            {info.row.original.borrower_email && (
              <p className="text-xs text-gray-500">{info.row.original.borrower_email}</p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('checked_out_by_name', {
        header: 'Checked Out By',
        cell: (info) => info.getValue() || <span className="text-gray-500 text-xs">—</span>,
      }),
      columnHelper.accessor('checked_out_at', {
        header: 'Checked Out',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-sm text-white">{formatRelativeTime(info.getValue())}</span>
          </div>
        ),
      }),
      columnHelper.accessor('due_at', {
        header: 'Due',
        cell: (info) => {
          const dueAt = info.getValue();
          if (!dueAt) return <span className="text-gray-500 text-xs">No due date</span>;
          const state = getDueState(dueAt, info.row.original.status);
          const style = dueStateStyles[state];
          return (
            <div className="flex items-center gap-1">
              <Calendar className={cn('h-3.5 w-3.5', style.icon)} />
              <span className={cn('text-sm', style.text)}>
                {formatDateTime(dueAt)}
              </span>
              {style.label && <span className="text-xs font-medium">{style.label}</span>}
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const checkout = info.row.original;
          const canReturn = checkout.status === 'active' || checkout.status === 'overdue';
          const canDamage = checkout.status === 'active' || checkout.status === 'overdue';

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canReturn && (
                  <DropdownMenuItem
                    onClick={() => onReturn(checkout)}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return
                  </DropdownMenuItem>
                )}
                {canDamage && (
                  <DropdownMenuItem
                    onClick={() => onDamageReport({ id: checkout.hardware_item_id, name: checkout.hardware_item_name || 'Unknown' }, checkout.id)}
                    className="flex items-center gap-2 text-amber-400 focus:text-amber-300"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Report Damage
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onViewDetails?.({ id: checkout.hardware_item_id, name: checkout.hardware_item_name || 'Unknown' })}
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    View Details
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ];
  }, [onReturn, onDamageReport, onViewDetails]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Checkouts</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonTable rows={5} columns={7} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Checkouts</CardTitle>
        <Button
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          disabled={filteredData.length === 0}
          onClick={() =>
            downloadCsv(
              `hardware-checkouts-${eventId.slice(0, 8)}`,
              filteredData.map((c) => ({
                item: c.hardware_item_name, category: c.hardware_item_category,
                borrower: c.borrower_name, borrower_email: c.borrower_email,
                checked_out_at: c.checked_out_at, due_at: c.due_at, status: c.status,
                checked_out_by: c.checked_out_by_name,
              }))
            )
          }
        >
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search checkouts..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="input-base pl-10"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="input-base w-[160px] bg-gray-800 border-gray-700"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>

        {/* Table */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto text-gray-700 mb-4" />
            <p className="text-lg">No checkouts found</p>
            <p className="text-sm">Checkouts will appear here when items are borrowed</p>
          </div>
        ) : (
          <DataTable
            data={filteredData as unknown as Record<string, unknown>[]}
            columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
            pagination={true}
            pageSize={filters.pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            emptyMessage="No checkouts found"
          />
        )}
      </CardContent>
    </Card>
  );
}