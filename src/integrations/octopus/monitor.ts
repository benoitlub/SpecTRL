import type { OctopusAdapterResult, SpectrlEventType } from "./types";

export const OCTOPUS_MONITOR_EVENT = "spectrl:octopus-monitor";

export type OctopusMonitorState = {
  status: "idle" | "sending" | "delivered" | "failed" | "disabled";
  eventType?: SpectrlEventType;
  decision?: string;
  latencyMs?: number;
  message?: string;
  updatedAt: string;
};

export function publishOctopusMonitor(state: Omit<OctopusMonitorState, "updatedAt">): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<OctopusMonitorState>(OCTOPUS_MONITOR_EVENT, {
    detail: { ...state, updatedAt: new Date().toISOString() },
  }));
}

export function monitorStateFromResult(
  eventType: SpectrlEventType,
  result: OctopusAdapterResult,
): Omit<OctopusMonitorState, "updatedAt"> {
  if (result.status === "disabled") return { status: "disabled", eventType, message: "Adaptateur désactivé" };
  if (result.status === "failed") return {
    status: "failed",
    eventType,
    latencyMs: result.latencyMs,
    message: result.error.message,
  };
  return {
    status: "delivered",
    eventType,
    decision: result.decision.decision,
    latencyMs: result.latencyMs,
    message: result.decision.reason,
  };
}
