import { QRCodeCanvas } from 'qrcode.react';
import { useMemo } from 'react';

export interface QRCodeData {
  type: 'checkin' | 'hardware' | 'venue' | 'project' | 'custom';
  eventId: string;
  itemId?: string;
  userId?: string;
  customData?: Record<string, unknown>;
}

export function generateQRData(data: QRCodeData): string {
  const payload = {
    v: 1,
    ...data,
    ts: Date.now(),
  };
  return JSON.stringify(payload);
}

export function parseQRData(qrString: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(qrString);
    if (parsed.v === 1 && parsed.type && parsed.eventId) {
      return parsed as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
}

export function generateCheckinQR(eventId: string, userId: string): string {
  return generateQRData({ type: 'checkin', eventId, userId });
}

export function generateHardwareQR(eventId: string, itemId: string): string {
  return generateQRData({ type: 'hardware', eventId, itemId });
}

export function generateVenueQR(eventId: string, locationId: string): string {
  return generateQRData({ type: 'venue', eventId, itemId: locationId });
}

export function generateProjectQR(eventId: string, projectId: string): string {
  return generateQRData({ type: 'project', eventId, itemId: projectId });
}

// React component for displaying QR codes
export interface QRCodeDisplayProps {
  data: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  label?: string;
}

export function QRCodeDisplay({
  data,
  size = 128,
  level = 'M',
  includeMargin = true,
  className,
  label,
}: QRCodeDisplayProps) {
  return (
    <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <QRCodeCanvas
        value={data}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor="#ffffff"
        fgColor="#0a0a0b"
      />
      {label && <span className="text-xs text-gray-400 font-mono">{label}</span>}
    </div>
  );
}

// Hook for generating QR codes
export function useQRCode(qrData: QRCodeData) {
  const qrString = useMemo(() => generateQRData(qrData), [qrData]);
  return qrString;
}

// Batch QR code generator for multiple items
export function generateBatchQRCodes(items: Array<{ id: string; data: QRCodeData }>): Array<{ id: string; qrData: string; qrString: string }> {
  return items.map(item => ({
    id: item.id,
    qrData: JSON.stringify(item.data),
    qrString: generateQRData(item.data),
  }));
}

// Validate QR code format
export function isValidQRCode(qrString: string): boolean {
  return parseQRData(qrString) !== null;
}