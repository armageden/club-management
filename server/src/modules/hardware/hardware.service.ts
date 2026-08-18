import { hardwareRepository } from "./hardware.repository.js";
import { ConflictError, NotFoundError, ValidationError } from "../../middleware/error.middleware.js";
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
} from "../../types/index.js";

export const hardwareService = {
  // Hardware Items
  async listItems(eventId: string, params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: HardwareItem[]; total: number }> {
    return hardwareRepository.listByEvent(eventId, params);
  },

  async getItem(eventId: string, itemId: string): Promise<HardwareItem> {
    const item = await hardwareRepository.getById(eventId, itemId);
    if (!item) throw new NotFoundError('Hardware item not found');
    return item;
  },

  async createItem(eventId: string, data: CreateHardwareItemRequest, userId: string): Promise<HardwareItem> {
    // Validate quantity
    if (data.quantity_available !== undefined && data.quantity_available < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    // Validate status
    const validStatuses = ['available', 'checked_out', 'damaged', 'lost', 'retired'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new ValidationError('Invalid status');
    }

    // Validate condition
    const validConditions = ['new', 'good', 'fair', 'damaged', 'retired'];
    if (data.condition && !validConditions.includes(data.condition)) {
      throw new ValidationError('Invalid condition');
    }

    return hardwareRepository.create(eventId, data, userId);
  },

  async updateItem(eventId: string, itemId: string, data: UpdateHardwareItemRequest): Promise<HardwareItem> {
    const item = await hardwareRepository.getById(eventId, itemId);
    if (!item) throw new NotFoundError('Hardware item not found');

    // Validate status transitions
    if (data.status) {
      const validStatuses = ['available', 'checked_out', 'damaged', 'lost', 'retired'];
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError('Invalid status');
      }

      // Prevent changing status if item is checked out
      if (item.status === 'checked_out' && data.status !== 'damaged' && data.status !== 'lost') {
        const activeCheckout = await hardwareRepository.getActiveCheckoutForItem(itemId);
        if (activeCheckout && data.status === 'available') {
          throw new ConflictError('Cannot mark as available while checked out');
        }
      }
    }

    // Validate quantity
    if (data.quantity_available !== undefined && data.quantity_available < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    // Validate condition
    if (data.condition) {
      const validConditions = ['new', 'good', 'fair', 'damaged', 'retired'];
      if (!validConditions.includes(data.condition)) {
        throw new ValidationError('Invalid condition');
      }
    }

    const updated = await hardwareRepository.update(eventId, itemId, data);
    if (!updated) throw new NotFoundError('Hardware item not found');
    return updated;
  },

  async deleteItem(eventId: string, itemId: string): Promise<void> {
    const item = await hardwareRepository.getById(eventId, itemId);
    if (!item) throw new NotFoundError('Hardware item not found');

    // Check for active checkouts
    const activeCheckout = await hardwareRepository.getActiveCheckoutForItem(itemId);
    if (activeCheckout) {
      throw new ConflictError('Cannot delete item with active checkout');
    }

    await hardwareRepository.delete(eventId, itemId);
  },

  // Checkouts
  async listCheckouts(eventId: string): Promise<HardwareCheckout[]> {
    return hardwareRepository.listCheckouts(eventId);
  },

  async getCheckout(eventId: string, checkoutId: string): Promise<HardwareCheckout> {
    const checkout = await hardwareRepository.getCheckoutById(eventId, checkoutId);
    if (!checkout) throw new NotFoundError('Checkout not found');
    return checkout;
  },

  async checkoutItem(eventId: string, data: CheckoutHardwareRequest, checkedOutBy: string): Promise<HardwareCheckout> {
    // Validate item exists and is available
    const item = await hardwareRepository.getById(eventId, data.hardware_item_id);
    if (!item) throw new NotFoundError('Hardware item not found');
    if (item.status !== 'available') throw new ConflictError('Item is not available for checkout');
    if (item.quantity_available <= 0) throw new ConflictError('No quantity available');

    // Validate borrower exists
    // Note: In a real app, you'd check the users table
    // For now we trust the userId is valid

    // Validate due date
    if (data.due_at) {
      const dueDate = new Date(data.due_at);
      if (dueDate <= new Date()) {
        throw new ValidationError('Due date must be in the future');
      }
    }

    return hardwareRepository.checkout(eventId, data, checkedOutBy);
  },

  // Returns
  async returnItem(eventId: string, data: ReturnHardwareRequest): Promise<{ checkout: HardwareCheckout; returnRecord: HardwareReturn }> {
    // Validate checkout exists
    const checkout = await hardwareRepository.getCheckoutById(eventId, data.checkout_id);
    if (!checkout) throw new NotFoundError('Checkout not found');

    // Validate condition
    const validConditions = ['new', 'good', 'fair', 'damaged'];
    if (!validConditions.includes(data.condition)) {
      throw new ValidationError('Invalid condition');
    }

    // If damaged, we should create a damage report instead
    if (data.condition === 'damaged') {
      throw new ValidationError('For damaged items, use the damage report endpoint');
    }

    return hardwareRepository.returnHardware(eventId, data);
  },

  // Damage Reports
  async listDamageReports(eventId: string): Promise<HardwareDamageReport[]> {
    return hardwareRepository.listDamageReports(eventId);
  },

  async createDamageReport(eventId: string, data: CreateDamageReportRequest, reportedBy: string): Promise<HardwareDamageReport> {
    // Validate item exists
    const item = await hardwareRepository.getById(eventId, data.hardware_item_id);
    if (!item) throw new NotFoundError('Hardware item not found');

    // Validate severity
    const validSeverities = ['minor', 'moderate', 'major', 'critical'];
    if (!validSeverities.includes(data.severity)) {
      throw new ValidationError('Invalid severity');
    }

    // If checkout_id provided, verify it belongs to this item
    if (data.checkout_id) {
      const checkout = await hardwareRepository.getCheckoutById(eventId, data.checkout_id);
      if (!checkout) throw new NotFoundError('Checkout not found');
      if (checkout.hardware_item_id !== data.hardware_item_id) {
        throw new ValidationError('Checkout does not match hardware item');
      }
    }

    return hardwareRepository.createDamageReport(eventId, data, reportedBy);
  },

  async resolveDamageReport(eventId: string, reportId: string, resolvedBy: string): Promise<HardwareDamageReport> {
    const report = await hardwareRepository.resolveDamageReport(eventId, reportId, resolvedBy);
    if (!report) throw new NotFoundError('Damage report not found');
    return report;
  },

  // Analytics
  async getAnalytics(eventId: string): Promise<HardwareAnalytics> {
    return hardwareRepository.getAnalytics(eventId);
  },

  // Overdue Management
  async getOverdueItems(eventId: string): Promise<HardwareCheckout[]> {
    return hardwareRepository.getOverdueCheckouts(eventId);
  },

  async markOverdueItems(eventId: string): Promise<number> {
    const overdue = await hardwareRepository.getOverdueCheckouts(eventId);
    for (const checkout of overdue) {
      await hardwareRepository.markOverdue(checkout.id);
    }
    return overdue.length;
  },

  // User-specific
  async getUserActiveCheckouts(eventId: string, userId: string): Promise<HardwareCheckout[]> {
    return hardwareRepository.getUserActiveCheckouts(eventId, userId);
  },
};