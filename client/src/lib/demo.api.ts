import { apiRequest } from "./api";

export interface DemoDataStatus {
  enabled: boolean;
  counts: Record<string, number>;
}

// Global-admin endpoints that seed/purge the "Demo Hackathon" event.
export async function enableDemoData(): Promise<DemoDataStatus> {
  return apiRequest<DemoDataStatus>("/demo/enable", { method: "POST" });
}

export async function disableDemoData(): Promise<{ enabled: boolean }> {
  return apiRequest<{ enabled: boolean }>("/demo/disable", { method: "POST" });
}
