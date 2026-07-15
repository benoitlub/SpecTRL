import { SpecTRLOctopusAdapter } from "./SpecTRLOctopusAdapter";

const DEFAULT_OCTOPUS_ENDPOINT = "https://octopus-engine.onrender.com";
const DEFAULT_PRODUCTION_TIMEOUT_MS = 30_000;

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
};

const parseTimeout = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

function wakeOctopus(endpoint: string): void {
  if (typeof window === "undefined") return;

  // Render instances may be asleep. Wake the neutral health endpoint early,
  // without blocking SpecTRL or changing the monitor state for a real mission.
  void fetch(`${endpoint.replace(/\/$/, "")}/health`, {
    method: "GET",
    mode: "cors",
    cache: "no-store",
  }).catch(() => undefined);
}

export const createSpecTRLOctopusAdapter = (): SpecTRLOctopusAdapter => {
  const endpoint = import.meta.env.VITE_OCTOPUS_ADAPTER_ENDPOINT || DEFAULT_OCTOPUS_ENDPOINT;
  const enabled = parseBoolean(import.meta.env.VITE_OCTOPUS_ADAPTER_ENABLED, import.meta.env.PROD);

  if (enabled) wakeOctopus(endpoint);

  return new SpecTRLOctopusAdapter({
    enabled,
    endpoint,
    timeoutMs: parseTimeout(import.meta.env.VITE_OCTOPUS_ADAPTER_TIMEOUT_MS)
      ?? (import.meta.env.PROD ? DEFAULT_PRODUCTION_TIMEOUT_MS : undefined),
  });
};

export { SpecTRLOctopusAdapter } from "./SpecTRLOctopusAdapter";
export type {
  OctopusAdapterConfig,
  OctopusAdapterResult,
  OctopusDecision,
  OctopusDecisionKind,
  SpectrlEventType,
  SpectrlOctopusEvent,
  SpectrlObservationContext,
} from "./types";
