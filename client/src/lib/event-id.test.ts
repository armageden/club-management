import { describe, it, expect, beforeEach } from "vitest";
import {
  REAL_EVENT_ID,
  DEMO_EVENT_ID,
  getActiveEventId,
  isDemoMode,
  setDemoMode,
} from "./event-id";

beforeEach(() => {
  localStorage.clear();
});

describe("event id selection", () => {
  it("defaults to the real event when demo mode was never enabled", () => {
    expect(isDemoMode()).toBe(false);
    expect(getActiveEventId()).toBe(REAL_EVENT_ID);
  });

  it("returns the demo event while demo mode is on", () => {
    setDemoMode(true);

    expect(localStorage.getItem("demo_mode")).toBe("true");
    expect(getActiveEventId()).toBe(DEMO_EVENT_ID);
  });

  it("switches back to the real event when demo mode is turned off", () => {
    setDemoMode(true);
    setDemoMode(false);

    expect(getActiveEventId()).toBe(REAL_EVENT_ID);
  });

  it("treats anything other than 'true' as off", () => {
    localStorage.setItem("demo_mode", "false");

    expect(isDemoMode()).toBe(false);
    expect(getActiveEventId()).toBe(REAL_EVENT_ID);
  });
});
