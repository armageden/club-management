'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { hardwareApi } from '../api';
import type { HardwareCheckout, HardwareReturn, HardwareDamageReport } from '../types';
import { formatRelativeTime, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Package, RotateCcw, AlertTriangle, User, Calendar, CheckCircle } from 'lucide-react';

interface ItemTimelineProps {
  eventId: string;
  itemId: string;
}

export function ItemTimeline({ eventId, itemId }: ItemTimelineProps) {
  // This would fetch timeline data for a specific item
  // For now, we'll create a placeholder that shows the structure
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline would be rendered here */}
          <div className="text-center py-8 text-gray-500">
            <p>Timeline visualization coming soon</p>
            <p className="text-sm mt-1">Shows: Added → Checked Out → Returned → Damaged events</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Full implementation would include:
/*
interface TimelineEvent {
  type: 'created' | 'checked_out' | 'returned' | 'damaged' | 'status_change';
  timestamp: string;
  user: { name: string };
  details: Record<string, unknown>;
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const icons = {
    created: <Package className="h-4 w-4 text-indigo-400" />,
    checked_out: <RotateCcw className="h-4 w-4 text-amber-400" />,
    returned: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    damaged: <AlertTriangle className="h-4 w-4 text-red-400" />,
    status_change: <Calendar className="h-4 w-4 text-blue-400" />,
  };

  return (
    <div className="flex gap-4">
      <div className="relative flex-shrink-0 w-8">
        <div className={cn('w-2 h-2 rounded-full border-2',
          event.type === 'created' && 'bg-indigo-400',
          event.type === 'checked_out' && 'bg-amber-400',
          event.type === 'returned' && 'bg-emerald-400',
          event.type === 'damaged' && 'bg-red-400',
          event.type === 'status_change' && 'bg-blue-400'
        )} />
        <div className="absolute left-1 top-2 bottom-0 w-0.5 bg-gray-700" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icons[event.type]}
          <span className="font-medium text-white capitalize">{event.type.replace('_', ' ')}</span>
          <span className="text-xs text-gray-500">{formatRelativeTime(event.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-400 ml-6">By {event.user.name}</p>
        <div className="mt-2 text-xs text-gray-500 ml-6">
          {Object.entries(event.details).map(([k, v]) => (
            <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
*/