'use client';

import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Printer } from 'lucide-react';
import { hardwareApi, hardwareQueryKeys } from '../api';
import type { HardwareItem } from '@/types/api';

interface QrLabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

/**
 * Printable QR labels for hardware items. Each label encodes
 * {origin}/hardware?item={id} — scanning it on a phone opens the app
 * with that item's action pre-loaded.
 */
export function QrLabelsModal({ open, onOpenChange, eventId }: QrLabelsModalProps) {
  const { data } = useQuery({
    queryKey: hardwareQueryKeys.items(eventId),
    queryFn: () => hardwareApi.getItems(eventId, { pageSize: 500 }),
    enabled: open,
  });

  const items = (data?.data ?? []) as unknown as HardwareItem[];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>QR Labels</DialogTitle>
          <DialogDescription>
            Print and attach these to the physical items. Scanning a label opens the item in the app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end print:hidden">
          <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>

        <div className="qr-labels grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-700 rounded-lg p-3 flex flex-col items-center text-center break-inside-avoid bg-white text-black">
              <QRCodeCanvas value={`${origin}/hardware?item=${item.id}`} size={96} includeMargin />
              <p className="mt-2 text-xs font-semibold leading-tight">{item.name}</p>
              {item.serial_number && <p className="text-[10px] font-mono">{item.serial_number}</p>}
              {item.location && <p className="text-[10px]">{item.location}</p>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
