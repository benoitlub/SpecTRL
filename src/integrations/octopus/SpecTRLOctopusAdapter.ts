import type {
  OctopusAdapterConfig,
  OctopusAdapterResult,
  OctopusDecision,
  SpectrlOctopusEvent,
  SpectrlObservationContext,
  SpectrlEventType,
} from "./types";

const DEFAULT_TIMEOUT_MS = 2500;

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
      const response = await this.fetchImpl(this.config.endpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
        },
        body: JSON.stringify(event),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Octopus adapter request failed (${response.status})`);
      }

      const decision = (await response.json()) as OctopusDecision;
      return {
        status: "delivered",
        decision,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));

      // Fail-open by design: callers receive the failure, but SpecTRL keeps running.
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
