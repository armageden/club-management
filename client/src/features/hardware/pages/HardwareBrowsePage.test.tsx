import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api", () => ({
  hardwareApi: {
    getItems: vi.fn(),
    getItem: vi.fn(),
    getMyCheckouts: vi.fn(),
    checkoutItem: vi.fn(),
  },
  hardwareQueryKeys: {
    items: (eventId: string, params?: any) => ["hardware", "items", eventId, params],
    item: (eventId: string, itemId: string) => ["hardware", "items", eventId, itemId],
    myCheckouts: (eventId: string) => ["hardware", "checkouts", eventId, "my"],
  },
  hardwareMutationKeys: {
    checkout: () => "checkoutHardware",
  },
}));

vi.mock("@/app/providers", () => ({
  useAuth: () => ({
    user: { id: "user-1", full_name: "Participant", email: "part@test.com", global_role: "user" },
    token: "tok-1",
    loading: false,
  }),
}));

vi.mock("@/lib/formatters", () => ({
  getDueState: () => "on-time",
  dueStateStyles: { "on-time": { text: "" } },
}));

import HardwareBrowsePage from "./HardwareBrowsePage";
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
  mockHardwareApi.getItems.mockResolvedValue({ data: [], total: 0 } as any);
  mockHardwareApi.getMyCheckouts.mockResolvedValue({ data: [] } as any);
});

describe("HardwareBrowsePage", () => {
  it("renders the heading", () => {
    renderWithQuery(<HardwareBrowsePage eventId="evt-1" />);
    expect(screen.getByRole("heading", { name: /hardware inventory/i })).toBeInTheDocument();
  });

  it("shows Browse Hardware and My Checkouts tabs", () => {
    renderWithQuery(<HardwareBrowsePage eventId="evt-1" />);
    expect(screen.getByRole("tab", { name: /browse hardware/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /my checkouts/i })).toBeInTheDocument();
  });

  it("shows empty state when no items match filters", async () => {
    renderWithQuery(<HardwareBrowsePage eventId="evt-1" />);
    expect(await screen.findByText(/no hardware items found/i)).toBeInTheDocument();
  });

  it("fetches items with available filter by default", async () => {
    renderWithQuery(<HardwareBrowsePage eventId="evt-1" />);
    await waitFor(() => {
      expect(mockHardwareApi.getItems).toHaveBeenCalledWith("evt-1", expect.objectContaining({ status: "available" }));
    });
  });

  it("shows search and filter controls", () => {
    renderWithQuery(<HardwareBrowsePage eventId="evt-1" />);
    expect(screen.getByPlaceholderText(/search hardware/i)).toBeInTheDocument();
  });
});
