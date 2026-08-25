import { formatDateTime } from '@/lib/formatters';

export function formatDateTimeRange(start: Date | string, end: Date | string): string {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}
