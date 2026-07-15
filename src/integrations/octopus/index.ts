import { SpecTRLOctopusAdapter } from "./SpecTRLOctopusAdapter";

const parseBoolean = (value: string | undefined): boolean =>
  value === "true" || value === "1";

const parseTimeout = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const createSpecTRLOctopusAdapter = (): SpecTRLOctopusAdapter =>
  new SpecTRLOctopusAdapter({
    enabled: parseBoolean(import.meta.env.VITE_OCTOPUS_ADAPTER_ENABLED),
    endpoint: import.meta.env.VITE_OCTOPUS_ADAPTER_ENDPOINT,
    timeoutMs: parseTimeout(import.meta.env.VITE_OCTOPUS_ADAPTER_TIMEOUT_MS),
  });

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
