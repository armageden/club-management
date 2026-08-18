'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, createColumns } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Input';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Dialog, DialogTriggerButton, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogCloseButton } from '@/components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Toaster, toast } from '@/components/ui/Toast';
import { hardwareApi, hardwareQueryKeys, hardwareMutationKeys } from './api';
import type { HardwareItem, HardwareItemFormData, CreateHardwareItemRequest, UpdateHardwareItemRequest } from './types';
import { HARDWARE_CATEGORIES, HARDWARE_CONDITIONS, HARDWARE_STATUSES } from './types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Package, AlertTriangle, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  quantity_available: z.coerce.number().int().min(0, 'Quantity must be >= 0').default(1),
  condition: z.enum(['new', 'good', 'fair', 'damaged', 'retired']).default('good'),
  status: z.enum(['available', 'checked_out', 'damaged', 'lost', 'retired']).default('available'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const updateItemSchema = createItemSchema.partial();

interface HardwareTableProps {
  eventId: string;
  onEdit?: (item: HardwareItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function HardwareTable({ eventId, onEdit, canEdit = true, canDelete = true }: HardwareTableProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    page: 1,
    pageSize: 25,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<HardwareItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: hardwareQueryKeys.items(eventId, filters),
    queryFn: () => hardwareApi.getItems(eventId, filters),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationKey: hardwareMutationKeys.createItem(),
    mutationFn: (data: CreateHardwareItemRequest) => hardwareApi.createItem(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareQueryKeys.items(eventId) });
      toast.success('Hardware item created');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationKey: hardwareMutationKeys.updateItem(),
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateHardwareItemRequest }) =>
      hardwareApi.updateItem(eventId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareQueryKeys.items(eventId) });
      toast.success('Hardware item updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationKey: hardwareMutationKeys.deleteItem(),
    mutationFn: (itemId: string) => hardwareApi.deleteItem(eventId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareQueryKeys.items(eventId) });
      toast.success('Hardware item deleted');
      setDeleteDialogOpen(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEdit = (item: HardwareItem) => {
    onEdit?.(item);
  };

  const columns = useMemo(() => {
    const columnHelper = createColumns<HardwareItem>();
    return [
      columnHelper.accessor('name', {
        header: 'Item',
        cell: (info) => (
          <div>
            <p className="font-medium text-white">{info.getValue()}</p>
            {info.row.original.model && (
              <p className="text-xs text-gray-500">{info.row.original.model}</p>
            )}
            {info.row.original.serial_number && (
              <p className="text-xs text-gray-500 font-mono">{info.row.original.serial_number}</p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => info.getValue() ? (
          <Badge variant="primary">{info.getValue()}</Badge>
        ) : (
          <span className="text-gray-500 text-xs">—</span>
        ),
      }),
      columnHelper.accessor('quantity_available', {
        header: 'Available',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-lg">{info.getValue()}</span>
            <span className="text-xs text-gray-500">/ {info.row.original.quantity_available + (info.row.original.status === 'checked_out' ? 1 : 0)}</span>
          </div>
        ),
      }),
      columnHelper.accessor('condition', {
        header: 'Condition',
        cell: (info) => {
          const condition = HARDWARE_CONDITIONS.find(c => c.value === info.getValue());
          return condition ? (
            <Badge variant={condition.value === 'damaged' ? 'danger' : condition.value === 'new' ? 'success' : 'neutral'}>
              {condition.label}
            </Badge>
          ) : (
            <Badge variant="neutral">{info.getValue()}</Badge>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: (info) => info.getValue() || <span className="text-gray-500 text-xs">—</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEdit(info.row.original)}
                disabled={!canEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(info.row.original)}
                disabled={!canDelete}
                className="text-red-400 focus:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ];
  }, [canEdit, canDelete, handleEdit]);

  const handleDeleteConfirm = () => {
    if (deleteDialogOpen) {
      deleteMutation.mutate(deleteDialogOpen.id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hardware Inventory</CardTitle>
        <Button onClick={() => createMutation.reset()} leftIcon={<Plus className="h-4 w-4" />}>
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="input-base pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters(prev => ({ ...prev, status: v, page: 1 }))}
            options={[{ value: '', label: 'All Status' }, ...HARDWARE_STATUSES.map(s => ({ value: s.value, label: s.label }))]}
            placeholder="Status"
            className="w-[160px]"
          />
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters(prev => ({ ...prev, category: v, page: 1 }))}
            options={[{ value: '', label: 'All Categories' }, ...HARDWARE_CATEGORIES.map(c => ({ value: c, label: c }))]}
            placeholder="Category"
            className="w-[160px]"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={8} />
        ) : data ? (
          <DataTable
            data={data.data}
            columns={columns}
            pagination={true}
            pageSize={filters.pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            onPaginationChange={(pagination) => setFilters(prev => ({ ...prev, page: pagination.pageIndex + 1, pageSize: pagination.pageSize }))}
            onSortingChange={(sorting) => setFilters(prev => ({
              ...prev,
              sortBy: sorting[0]?.id || 'created_at',
              sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
            }))}
            emptyMessage="No hardware items found"
          />
        ) : (
          <div className="text-center py-8 text-gray-500">Failed to load hardware items</div>
        )}

        {/* Delete Dialog */}
        <Dialog open={!!deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Delete Hardware Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialogOpen?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogCloseButton>Cancel</DialogCloseButton>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={deleteMutation.isPending}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}