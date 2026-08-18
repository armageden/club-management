import { api, queryKeys, mutationKeys } from '@/lib/api';
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
  PaginatedResponse,
} from '@/types/api';

export const hardwareApi = {
  // Items
  getItems: (eventId: string, params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get<PaginatedResponse<HardwareItem>>(`/events/${eventId}/hardware/items`, { params }),

  getItem: (eventId: string, itemId: string) => api.get<{ success: boolean; data: HardwareItem }>(`/events/${eventId}/hardware/items/${itemId}`),

  createItem: (eventId: string, data: CreateHardwareItemRequest) => api.post<{ success: boolean; data: HardwareItem }>(`/events/${eventId}/hardware/items`, data),

  updateItem: (eventId: string, itemId: string, data: UpdateHardwareItemRequest) => api.put<{ success: boolean; data: HardwareItem }>(`/events/${eventId}/hardware/items/${itemId}`, data),

  deleteItem: (eventId: string, itemId: string) => api.delete<{ success: boolean; data: { message: string } }>(`/events/${eventId}/hardware/items/${itemId}`),

  // Checkouts
  getCheckouts: (eventId: string) => api.get<{ success: boolean; data: HardwareCheckout[] }>(`/events/${eventId}/hardware/checkouts`),

  getCheckout: (eventId: string, checkoutId: string) => api.get<{ success: boolean; data: HardwareCheckout }>(`/events/${eventId}/hardware/checkouts/${checkoutId}`),

  checkoutItem: (eventId: string, data: CheckoutHardwareRequest) => api.post<{ success: boolean; data: HardwareCheckout }>(`/events/${eventId}/hardware/checkouts`, data),

  // Returns
  returnItem: (eventId: string, data: ReturnHardwareRequest) => api.post<{ success: boolean; data: { checkout: HardwareCheckout; returnRecord: HardwareReturn } }>(`/events/${eventId}/hardware/returns`, data),

  // Damage Reports
  getDamageReports: (eventId: string) => api.get<{ success: boolean; data: HardwareDamageReport[] }>(`/events/${eventId}/hardware/damage-reports`),

  createDamageReport: (eventId: string, data: CreateDamageReportRequest) => api.post<{ success: boolean; data: HardwareDamageReport }>(`/events/${eventId}/hardware/damage-reports`, data),

  resolveDamageReport: (eventId: string, reportId: string) => api.put<{ success: boolean; data: HardwareDamageReport }>(`/events/${eventId}/hardware/damage-reports/${reportId}/resolve`),

  // Analytics
  getAnalytics: (eventId: string) => api.get<{ success: boolean; data: HardwareAnalytics }>(`/events/${eventId}/hardware/analytics`),

  // Overdue
  getOverdue: (eventId: string) => api.get<{ success: boolean; data: HardwareCheckout[] }>(`/events/${eventId}/hardware/overdue`),

  markOverdue: (eventId: string) => api.post<{ success: boolean; data: { marked: number } }>(`/events/${eventId}/hardware/overdue/mark`),

  // User checkouts
  getMyCheckouts: (eventId: string) => api.get<{ success: boolean; data: HardwareCheckout[] }>(`/events/${eventId}/hardware/my-checkouts`),
};

// Query keys for TanStack Query
export const hardwareQueryKeys = {
  items: (eventId: string, params?: Record<string, unknown>) =>
    [...queryKeys.hardwareItems(eventId, params)],
  item: (eventId: string, itemId: string) =>
    [...queryKeys.hardwareItems(eventId), itemId],
  checkouts: (eventId: string) =>
    queryKeys.hardwareCheckouts(eventId),
  damageReports: (eventId: string) =>
    queryKeys.hardwareDamageReports(eventId),
  analytics: (eventId: string) =>
    queryKeys.hardwareAnalytics(eventId),
  overdue: (eventId: string) =>
    [...queryKeys.hardwareCheckouts(eventId), 'overdue'],
  myCheckouts: (eventId: string) =>
    [...queryKeys.hardwareCheckouts(eventId), 'my'],
};

// Mutation keys
export const hardwareMutationKeys = {
  createItem: () => mutationKeys.createHardwareItem,
  updateItem: () => mutationKeys.updateHardwareItem,
  deleteItem: () => mutationKeys.deleteHardwareItem,
  checkout: () => mutationKeys.checkoutHardware,
  return: () => mutationKeys.returnHardware,
  createDamageReport: () => mutationKeys.createDamageReport,
};