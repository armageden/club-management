'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { ItemTimeline } from './ItemTimeline';

interface ItemDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  itemId: string | null;
  itemName?: string;
}

export function ItemDetailsModal({ open, onOpenChange, eventId, itemId, itemName }: ItemDetailsModalProps) {
  return (
    <Dialog open={open && !!itemId} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{itemName || 'Item'} — Details</DialogTitle>
          <DialogDescription>Lifecycle history for this item.</DialogDescription>
        </DialogHeader>
        {itemId && <ItemTimeline eventId={eventId} itemId={itemId} />}
      </DialogContent>
    </Dialog>
  );
}
