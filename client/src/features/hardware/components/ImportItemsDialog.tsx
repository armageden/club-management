'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Toaster, toast } from '@/components/ui/Toast';
import type { CreateHardwareItemRequest } from '@/types/api';

interface ImportItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: CreateHardwareItemRequest[]) => Promise<void>;
  isLoading?: boolean;
}

const CSV_COLUMNS = 'name,category,model,serial_number,quantity_available,condition,location,notes';

const SAMPLE = [
  'name,category,model,quantity_available,location',
  'Arduino Nano,Microcontrollers,A000005,15,Shelf A-3',
  'Logic Analyzer,Tools,LA1010,4,Cabinet T-1',
].join('\n');

/**
 * Parses pasted CSV rows into item payloads. Simple comma splitting —
 * commas inside values are not supported.
 */
export function parseItemsCsv(text: string): CreateHardwareItemRequest[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstCells = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasHeader = firstCells[0] === 'name';
  const header = hasHeader ? firstCells : CSV_COLUMNS.split(',');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const items: CreateHardwareItemRequest[] = [];
  for (const line of dataLines) {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    header.forEach((col, i) => {
      if (CSV_COLUMNS.split(',').includes(col)) row[col] = cells[i] ?? '';
    });
    if (!row.name) continue;
    items.push({
      name: row.name,
      category: row.category || undefined,
      model: row.model || undefined,
      serial_number: row.serial_number || undefined,
      quantity_available: row.quantity_available ? parseInt(row.quantity_available, 10) : 1,
      condition: (row.condition as CreateHardwareItemRequest['condition']) || undefined,
      location: row.location || undefined,
      notes: row.notes || undefined,
    });
  }
  return items;
}

export function ImportItemsDialog({ open, onOpenChange, onSubmit, isLoading }: ImportItemsDialogProps) {
  const [text, setText] = useState('');

  const items = parseItemsCsv(text);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Nothing to import — check the format');
      return;
    }
    try {
      await onSubmit(items);
      setText('');
    } catch {
      // parent reports via toast
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Import Items (CSV)</DialogTitle>
            <DialogDescription>
              Paste rows with columns: <code className="text-indigo-300">{CSV_COLUMNS}</code>. Only
              <code className="text-indigo-300"> name</code> is required. The whole batch is applied atomically.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={SAMPLE}
            rows={8}
            className="input-base font-mono text-xs"
          />

          <p className="text-xs text-gray-500">
            {items.length > 0 ? `${items.length} item${items.length === 1 ? '' : 's'} ready to import` : 'No valid rows yet'}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setText(SAMPLE)}>
              Load sample
            </Button>
            <Button onClick={handleSubmit} disabled={items.length === 0 || isLoading} loading={isLoading}>
              Import {items.length > 0 ? items.length : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
