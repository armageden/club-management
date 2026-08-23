'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, RotateCcw, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { hardwareApi, hardwareQueryKeys, type HardwareTimelineEvent } from '../api';
import { formatDateTime } from '@/lib/formatters';

interface ItemTimelineProps {
  eventId: string;
  itemId: string;
}

const iconMap = {
  created: Package,
  checked_out: RotateCcw,
  returned: CheckCircle,
  damaged: AlertTriangle,
  status_change: RefreshCw,
} as const;

const colorMap = {
  created: 'bg-indigo-400 border-indigo-400',
  checked_out: 'bg-amber-400 border-amber-400',
  returned: 'bg-emerald-400 border-emerald-400',
  damaged: 'bg-red-400 border-red-400',
  status_change: 'bg-blue-400 border-blue-400',
} as const;

const labelMap = {
  created: 'Item added',
  checked_out: 'Checked out',
  returned: 'Returned',
  damaged: 'Damage reported',
  status_change: 'Status changed',
} as const;

function eventDescription(event: HardwareTimelineEvent): string {
  const d = event.details || {};
  switch (event.type) {
    case 'checked_out':
      return [d.borrower_name && `to ${d.borrower_name}`, d.due_at && `due ${formatDateTime(d.due_at as string)}`]
        .filter(Boolean)
        .join(', ');
    case 'returned':
      return [d.condition && `condition: ${d.condition}`, d.received_by_name && `received by ${d.received_by_name}`]
        .filter(Boolean)
        .join(', ');
    case 'damaged':
      return [d.severity && `severity: ${d.severity}`, d.description as string].filter(Boolean).join(' — ');
    case 'status_change':
      return [d.from && `from ${d.from}`, d.to && `to ${d.to}`].filter(Boolean).join(' ');
    default:
      return (d.description as string) || '';
  }
}

export function ItemTimeline({ eventId, itemId }: ItemTimelineProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: hardwareQueryKeys.timeline(eventId, itemId),
    queryFn: async () => {
      const res = await hardwareApi.getItemTimeline(eventId, itemId);
      return res.data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-gray-500 py-8 text-center">Loading history...</p>}
        {isError && <p className="text-sm text-red-400 py-8 text-center">Failed to load item history.</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">No history recorded yet.</p>
        )}
        {data && data.length > 0 && (
          <div className="space-y-0">
            {data.map((event, i) => {
              const Icon = iconMap[event.type] ?? RefreshCw;
              const description = eventDescription(event);
              const isLast = i === data.length - 1;
              return (
                <div key={`${event.type}-${event.timestamp}-${i}`} className="flex gap-4">
                  <div className="relative flex flex-col items-center w-6 flex-shrink-0">
                    <div className={cn('z-10 w-3 h-3 rounded-full border-2 mt-1', colorMap[event.type])} />
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-700" />}
                  </div>
                  <div className={cn('pb-6', isLast && 'pb-0')}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">{labelMap[event.type]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(event.timestamp)}</p>
                    {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
                    {event.user_name && <p className="text-xs text-gray-500 mt-0.5">by {event.user_name}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
