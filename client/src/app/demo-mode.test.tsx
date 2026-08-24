import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DemoModeProvider, useDemoMode } from "./demo-mode";
import { DEMO_EVENT_ID, REAL_EVENT_ID } from "@/lib/event-id";

function Probe() {
  const { demoMode, activeEventId, toggleDemoMode } = useDemoMode();
  return (
    <div>
      <span data-testid="mode">{String(demoMode)}</span>
      <span data-testid="event">{activeEventId}</span>
      <button onClick={toggleDemoMode}>toggle</button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient();
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  render(
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider>
        <Probe />
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { invalidateSpy };
}

beforeEach(() => {
  localStorage.clear();
});

describe("DemoModeProvider", () => {
  it("defaults to real event when demo mode was never enabled", () => {
    renderProbe();

    expect(screen.getByTestId("mode")).toHaveTextContent("false");
    expect(screen.getByTestId("event")).toHaveTextContent(REAL_EVENT_ID);
  });

  it("toggling switches every consumer to the demo event and persists", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByTestId("mode")).toHaveTextContent("true");
    expect(screen.getByTestId("event")).toHaveTextContent(DEMO_EVENT_ID);
    expect(localStorage.getItem("demo_mode")).toBe("true");
  });

  it("invalidates react-query cache on toggle so pages refetch", async () => {
    const user = userEvent.setup();
    const { invalidateSpy } = renderProbe();

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it("starts in demo mode when previously enabled", () => {
    localStorage.setItem("demo_mode", "true");
    renderProbe();

    expect(screen.getByTestId("mode")).toHaveTextContent("true");
    expect(screen.getByTestId("event")).toHaveTextContent(DEMO_EVENT_ID);
  });
});
