import type {
  OctopusAdapterConfig,
  OctopusAdapterResult,
  OctopusDecision,
  OctopusMissionResponse,
  SpectrlOctopusEvent,
  SpectrlObservationContext,
  SpectrlEventType,
} from "./types";

const DEFAULT_TIMEOUT_MS = 2500;

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

async function responseError(response: Response): Promise<Error> {
  const body = await response.text().catch(() => "");
  const detail = body.trim().slice(0, 240);
  return new Error(`Octopus mission failed (${response.status})${detail ? `: ${detail}` : ""}`);
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

    const startedAt = performance.now();
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const endpoint = `${this.config.endpoint!.replace(/\/$/, "")}/mission`;
      const response = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
        },
        body: JSON.stringify({
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
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await responseError(response);
      }

      const mission = await response.json() as OctopusMissionResponse;
      return {
        status: "delivered",
        decision: inferDecision(mission),
        mission,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      return {
        status: "failed",
        error,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  private fallbackId(): string {
    return `spectrl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
