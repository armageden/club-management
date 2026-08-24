// Demo mode: when enabled, every API call targets the seeded demo event
// instead of the real one. State lives in localStorage so it survives reloads.
export const REAL_EVENT_ID = "e0000000-0000-0000-0000-000000000001";
export const DEMO_EVENT_ID = "e0000000-0000-0000-0000-000000000002";

const DEMO_MODE_KEY = "demo_mode";

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function getActiveEventId(): string {
  return isDemoMode() ? DEMO_EVENT_ID : REAL_EVENT_ID;
}

export function setDemoMode(on: boolean): void {
  localStorage.setItem(DEMO_MODE_KEY, String(on));
}
