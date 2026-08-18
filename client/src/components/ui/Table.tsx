import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="table-container">
    <table ref={ref} className={cn('table', className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, TableProps>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-gray-800', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, TableProps>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, TableProps>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-gray-800 bg-gray-950/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-gray-800 transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-indigo-900/20',
      selected && 'bg-indigo-900/20',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('text-left font-semibold text-gray-400 text-xs uppercase tracking-wider p-4', className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 text-sm text-white', className)} {...props} />
));
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-gray-500', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };