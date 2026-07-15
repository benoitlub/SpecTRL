import { SpecTRLOctopusAdapter } from "./SpecTRLOctopusAdapter";

const DEFAULT_OCTOPUS_ENDPOINT = "https://octopus-engine.onrender.com";

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
};

const parseTimeout = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const createSpecTRLOctopusAdapter = (): SpecTRLOctopusAdapter => {
  const endpoint = import.meta.env.VITE_OCTOPUS_ADAPTER_ENDPOINT || DEFAULT_OCTOPUS_ENDPOINT;

  return new SpecTRLOctopusAdapter({
    enabled: parseBoolean(import.meta.env.VITE_OCTOPUS_ADAPTER_ENABLED, import.meta.env.PROD),
    endpoint,
    timeoutMs: parseTimeout(import.meta.env.VITE_OCTOPUS_ADAPTER_TIMEOUT_MS),
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
