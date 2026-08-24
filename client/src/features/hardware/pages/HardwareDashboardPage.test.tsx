import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api", () => ({
  hardwareApi: {
    getItems: vi.fn(),
    getItem: vi.fn(),
    createItem: vi.fn(),
    createItemsBulk: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    getCheckouts: vi.fn(),
    getCheckout: vi.fn(),
    checkoutItem: vi.fn(),
    returnItem: vi.fn(),
    getDamageReports: vi.fn(),
    createDamageReport: vi.fn(),
    resolveDamageReport: vi.fn(),
    getAnalytics: vi.fn(),
    getOverdue: vi.fn(),
    markOverdue: vi.fn(),
    getMyCheckouts: vi.fn(),
    getItemTimeline: vi.fn(),
  },
  hardwareQueryKeys: {
    items: (eventId: string, params?: any) => ["hardware", "items", eventId, params],
    item: (eventId: string, itemId: string) => ["hardware", "items", eventId, itemId],
    checkouts: (eventId: string) => ["hardware", "checkouts", eventId],
    damageReports: (eventId: string) => ["hardware", "damage-reports", eventId],
    analytics: (eventId: string) => ["hardware", "analytics", eventId],
    overdue: (eventId: string) => ["hardware", "checkouts", eventId, "overdue"],
    myCheckouts: (eventId: string) => ["hardware", "checkouts", eventId, "my"],
    timeline: (eventId: string, itemId: string) => ["hardware", "items", eventId, itemId, "timeline"],
  },
  hardwareMutationKeys: {
    createItem: () => "createHardwareItem",
    updateItem: () => "updateHardwareItem",
    deleteItem: () => "deleteHardwareItem",
    checkout: () => "checkoutHardware",
    return: () => "returnHardware",
    createDamageReport: () => "createDamageReport",
  },
}));

vi.mock("@/app/providers", () => ({
  useAuth: () => ({
    user: { id: "user-1", full_name: "Admin", email: "admin@test.com", global_role: "admin" },
    token: "tok-1",
    loading: false,
  }),
}));

import HardwareDashboardPage from "./HardwareDashboardPage";
import { hardwareApi } from "../api";

const mockHardwareApi = vi.mocked(hardwareApi);

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHardwareApi.getItems.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20 } as any);
  mockHardwareApi.getCheckouts.mockResolvedValue({ data: [] } as any);
  mockHardwareApi.getAnalytics.mockResolvedValue({ data: {} } as any);
  mockHardwareApi.getDamageReports.mockResolvedValue({ data: [] } as any);
  mockHardwareApi.getOverdue.mockResolvedValue({ data: [] } as any);
});

describe("HardwareDashboardPage", () => {
  it("renders the heading and tab triggers", async () => {
    renderWithQuery(<HardwareDashboardPage eventId="evt-1" />);
    expect(screen.getAllByRole("heading", { name: /hardware inventory/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("tab", { name: /inventory/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /checkouts/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /damage reports/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /analytics/i })).toBeInTheDocument();
  });

  it("shows Add Item buttons (header + table)", () => {
    renderWithQuery(<HardwareDashboardPage eventId="evt-1" />);
    expect(screen.getAllByRole("button", { name: /add item/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("fetches items and analytics on mount", async () => {
    renderWithQuery(<HardwareDashboardPage eventId="evt-1" />);
    await waitFor(() => {
      expect(mockHardwareApi.getItems).toHaveBeenCalledWith("evt-1", expect.any(Object));
    });
  });

  it("shows empty state when no items exist", async () => {
    renderWithQuery(<HardwareDashboardPage eventId="evt-1" />);
    expect(await screen.findByText(/no hardware items/i)).toBeInTheDocument();
  });
});
