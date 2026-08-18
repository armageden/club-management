import type {
  HardwareItem,
  HardwareCheckout,
  HardwareReturn,
  HardwareDamageReport,
  HardwareAnalytics,
  CreateHardwareItemRequest,
  UpdateHardwareItemRequest,
  CheckoutHardwareRequest,
  ReturnHardwareRequest,
  CreateDamageReportRequest,
} from '@/types/api';

// Re-export all types
export type {
  HardwareItem,
  HardwareCheckout,
  HardwareReturn,
  HardwareDamageReport,
  HardwareAnalytics,
  CreateHardwareItemRequest,
  UpdateHardwareItemRequest,
  CheckoutHardwareRequest,
  ReturnHardwareRequest,
  CreateDamageReportRequest,
};

// Additional frontend-specific types
export interface HardwareItemFormData {
  name: string;
  category: string;
  model: string;
  serial_number: string;
  quantity_available: number;
  condition: 'new' | 'good' | 'fair' | 'damaged' | 'retired';
  status: 'available' | 'checked_out' | 'damaged' | 'lost' | 'retired';
  location: string;
  notes: string;
}

export interface CheckoutFormData {
  hardware_item_id: string;
  borrower_user_id: string;
  due_at?: string;
  notes: string;
}

export interface ReturnFormData {
  checkout_id: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  received_by: string;
  notes: string;
}

export interface DamageReportFormData {
  hardware_item_id: string;
  checkout_id?: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

export const HARDWARE_CATEGORIES = [
  'Microcontrollers',
  'Sensors',
  'Actuators',
  'Displays',
  'Communication',
  'Power',
  'Tools',
  'Cables & Connectors',
  'Kits',
  'Other',
] as const;

export const HARDWARE_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'retired', label: 'Retired' },
] as const;

export const HARDWARE_STATUSES = [
  { value: 'available', label: 'Available', color: 'success' },
  { value: 'checked_out', label: 'Checked Out', color: 'warning' },
  { value: 'damaged', label: 'Damaged', color: 'danger' },
  { value: 'lost', label: 'Lost', color: 'danger' },
  { value: 'retired', label: 'Retired', color: 'neutral' },
] as const;

export const DAMAGE_SEVERITIES = [
  { value: 'minor', label: 'Minor', color: 'info' },
  { value: 'moderate', label: 'Moderate', color: 'warning' },
  { value: 'major', label: 'Major', color: 'danger' },
  { value: 'critical', label: 'Critical', color: 'danger' },
] as const;