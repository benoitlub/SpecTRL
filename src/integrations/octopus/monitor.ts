import type { OctopusAdapterResult, SpectrlEventType } from "./types";

export const OCTOPUS_MONITOR_EVENT = "spectrl:octopus-monitor";

export type OctopusMonitorState = {
  status: "idle" | "sending" | "delivered" | "failed" | "disabled";
  eventType?: SpectrlEventType;
  decision?: string;
  latencyMs?: number;
  message?: string;
  endpoint?: string;
  httpStatus?: number;
  responseStatus?: string;
  responseCode?: string;
  networkError?: string;
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

  const diagnostic = result.diagnostic;
  const common = {
    eventType,
    latencyMs: result.latencyMs,
    endpoint: diagnostic.endpoint,
    httpStatus: diagnostic.httpStatus,
    responseStatus: diagnostic.responseStatus,
    responseCode: diagnostic.responseCode,
    networkError: diagnostic.networkError,
  };

  if (result.status === "failed") return {
    status: "failed",
    ...common,
    message: diagnostic.summary ?? diagnostic.networkError ?? result.error.message,
  };

  return {
    status: "delivered",
    ...common,
    decision: result.decision.decision,
    message: result.decision.reason ?? diagnostic.summary,
  };
}
