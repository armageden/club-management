'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type Table,
} from '@tanstack/react-table';
import { useState, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchable?: boolean;
  searchKeys?: (keyof TData)[];
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  onRowSelect?: (rows: TData[]) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  rowKey?: keyof TData | ((row: TData) => string);
  renderToolbar?: () => ReactNode;
  renderRowActions?: (row: Row<TData>) => ReactNode;
}

export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  filterable = true,
  sortable = true,
  pagination = true,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  selectable = false,
  onRowSelect,
  emptyMessage = 'No data available',
  loading = false,
  className,
  rowKey = 'id',
  renderToolbar,
  renderRowActions,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getRowId = useMemo(() => {
    if (typeof rowKey === 'function') return rowKey;
    return (row: TData) => String(row[rowKey]);
  }, [rowKey]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: (filterable || searchable) ? getFilteredRowModel() : undefined,
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: getExpandedRowModel(),
    getRowId,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  const selectedRows = useMemo(() => {
    return data.filter(row => rowSelection[getRowId(row)]);
  }, [data, rowSelection, getRowId]);

  useEffect(() => {
    if (onRowSelect) onRowSelect(selectedRows);
  }, [selectedRows, onRowSelect]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      table.getFilteredSelectedRowModel().rows.forEach(row => {
        setRowSelection(prev => ({ ...prev, [getRowId(row.original)]: true }));
      });
    } else {
      table.getFilteredSelectedRowModel().rows.forEach(row => {
        setRowSelection(prev => { const next = { ...prev }; delete next[getRowId(row.original)]; return next; });
      });
    }
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    setRowSelection(prev => ({ ...prev, [rowId]: checked }));
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="card">
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="empty-state-title">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* Toolbar */}
      {(searchable || filterable || renderToolbar) && (
        <div className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-800 bg-gray-950/50">
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="input-base pl-10 pr-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  onClick={() => setGlobalFilter('')}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {renderToolbar && <div className="flex-1" />}

          {renderToolbar && renderToolbar()}

          {pagination && (
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-400">Rows per page:</label>
              <Select
                value={paginationState.pageSize}
                onValueChange={(v) => setPaginationState(prev => ({ ...prev, pageSize: Number(v), pageIndex: 0 }))}
                options={pageSizeOptions.map(n => ({ value: String(n), label: String(n) }))}
                className="w-[100px]"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="table" role="grid">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {selectable && (
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={cn(
                      'p-4',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-800',
                      header.getIsSorted() && 'bg-gray-800'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="inline-flex">
                          {header.getIsSorted() === 'asc' ? <ChevronUp className="h-4 w-4" /> : header.getIsSorted() === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 opacity-30" />}
                        </span>
                      )}
                    </div>
                    {header.column.getCanFilter() && filterable && (
                      <div className="mt-2">
                        {header.column.filterFn === 'includesString' && (
                          <Input
                            placeholder="Filter..."
                            value={(header.getFilterValue() as string) || ''}
                            onChange={(e) => header.setFilterValue(e.target.value)}
                            className="text-xs h-8"
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
                {renderRowActions && (
                  <th className="w-48 p-4 text-right">Actions</th>
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-gray-800 transition-colors hover:bg-gray-800/50',
                  rowSelection[getRowId(row.original)] && 'bg-indigo-900/20'
                )}
              >
                {selectable && (
                  <td className="p-4">
                    <Checkbox
                      checked={rowSelection[getRowId(row.original)]}
                      onCheckedChange={(checked) => handleRowSelect(getRowId(row.original), checked as boolean)}
                    />
                  </td>
                )}
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="p-4 text-right">
                    {renderRowActions(row)}
                  </td>
                )}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)} className="p-8 text-center text-gray-500">
                  {globalFilter ? 'No results found' : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-gray-950/50">
          <div className="text-sm text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Column helper for easier column definitions
export function createColumns<TData>() {
  return createColumnHelper<TData>();
}

// Checkbox component (simple version)
import { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          {...props}
        />
        {label && <label htmlFor={checkboxId} className="text-sm text-gray-300">{label}</label>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

// Need to import useEffect
import { useEffect } from 'react';