import { OctopusClient } from "./OctopusClient";
import type {
  OctopusAdapterConfig,
  OctopusAdapterResult,
  OctopusDecision,
  OctopusMissionResponse,
  SpectrlOctopusEvent,
  SpectrlObservationContext,
  SpectrlEventType,
} from "./types";

function inferDecision(mission: OctopusMissionResponse): OctopusDecision {
  const output = mission.output ?? {};
  const decision = typeof output.decision === "string"
    ? output.decision
    : mission.status === "completed"
      ? "record"
      : mission.status === "waiting-authorization" || mission.status === "waiting-executor"
        ? "request_analysis"
        : "ignore";

  return {
    id: mission.operationId,
    decision,
    reason: typeof output.reason === "string" ? output.reason : mission.summary,
    actions: Array.isArray(output.actions)
      ? output.actions.filter((item): item is string => typeof item === "string")
      : [],
    metadata: { missionStatus: mission.status, contextId: mission.contextId, output },
  };
}

export class SpecTRLOctopusAdapter {
  constructor(
    private readonly config: OctopusAdapterConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  isEnabled(): boolean {
    return this.config.enabled && Boolean(this.config.endpoint);
  }

  createEvent(
    type: SpectrlEventType,
    payload: SpectrlObservationContext,
  ): SpectrlOctopusEvent {
    return {
      id: globalThis.crypto?.randomUUID?.() ?? this.fallbackId(),
      source: "spectrl",
      type,
      occurredAt: new Date().toISOString(),
      payload,
    };
  }

  async emit(event: SpectrlOctopusEvent): Promise<OctopusAdapterResult> {
    if (!this.isEnabled()) {
      return { status: "disabled" };
    }

    const client = new OctopusClient({
      endpoint: this.config.endpoint!,
      timeoutMs: this.config.timeoutMs,
      headers: this.config.headers,
    }, this.fetchImpl);

    const result = await client.sendMission<OctopusMissionResponse>({
      operationId: `spectrl_${event.id}`,
      title: `Recevoir une observation spectrale ${event.type}`,
      objective: "Recevoir, horodater et enregistrer une observation sans interprétation métier.",
      context: {
        id: `spectrl:${event.id}`,
        label: event.payload.metadata?.signatureName ?? event.type,
        objective: "Conserver cet influx spectral pour son historique et de futures comparaisons.",
        metadata: { source: "spectrl", event },
      },
      requiredCapabilities: ["observation.receive"],
      authorizedResources: [],
    });

    if (!result.ok) {
      return {
        status: "failed",
        error: result.error,
        latencyMs: result.diagnostic.latencyMs,
        diagnostic: result.diagnostic,
      };
    }

    return {
      status: "delivered",
      decision: inferDecision(result.data),
      mission: result.data,
      latencyMs: result.diagnostic.latencyMs,
      diagnostic: result.diagnostic,
    };
  }

  private fallbackId(): string {
    return `spectrl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
