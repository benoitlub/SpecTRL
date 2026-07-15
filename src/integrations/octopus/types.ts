import type { OctopusDiagnostic } from "./OctopusClient";

export type SpectrlEventType =
  | "audio.detected"
  | "audio.classified"
  | "ambient.changed"
  | "observation.created";

export interface SpectrlObservationContext {
  sessionId?: string;
  locationLabel?: string;
  confidence?: number;
  frequencyPeakHz?: number;
  durationMs?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SpectrlOctopusEvent {
  id: string;
  source: "spectrl";
  type: SpectrlEventType;
  occurredAt: string;
  payload: SpectrlObservationContext;
}

export type OctopusDecisionKind = "ignore" | "record" | "enrich" | "request_analysis" | string;

export interface OctopusDecision {
  id?: string;
  decision: OctopusDecisionKind;
  reason?: string;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

export interface OctopusMissionResponse {
  status?: string;
  code?: string;
  summary?: string;
  output?: Record<string, unknown>;
  operationId?: string;
  missionId?: string;
  contextId?: string;
}

export interface OctopusAdapterConfig {
  enabled: boolean;
  endpoint?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export type OctopusAdapterResult =
  | { status: "disabled" }
  | { status: "delivered"; decision: OctopusDecision; mission: OctopusMissionResponse; latencyMs: number; diagnostic: OctopusDiagnostic }
  | { status: "failed"; error: Error; latencyMs: number; diagnostic: OctopusDiagnostic };
