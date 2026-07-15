export type OctopusClientConfig = {
  endpoint: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export type OctopusDiagnostic = {
  endpoint: string;
  httpStatus?: number;
  responseStatus?: string;
  responseCode?: string;
  summary?: string;
  latencyMs: number;
  networkError?: string;
  responseBody?: unknown;
};

export type OctopusClientResult<T> =
  | { ok: true; data: T; diagnostic: OctopusDiagnostic }
  | { ok: false; error: Error; diagnostic: OctopusDiagnostic };

const DEFAULT_TIMEOUT_MS = 30_000;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export class OctopusClient {
  constructor(
    private readonly config: OctopusClientConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async sendMission<T>(mission: Record<string, unknown>): Promise<OctopusClientResult<T>> {
    const endpoint = `${this.config.endpoint.replace(/\/$/, "")}/mission`;
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
        },
        body: JSON.stringify(mission),
        signal: controller.signal,
      });

      const raw = await response.text();
      let body: unknown = raw;
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        // Keep the raw response for diagnostics.
      }

      const record = asRecord(body);
      const diagnostic: OctopusDiagnostic = {
        endpoint,
        httpStatus: response.status,
        responseStatus: typeof record?.status === "string" ? record.status : undefined,
        responseCode: typeof record?.code === "string" ? record.code : undefined,
        summary: typeof record?.summary === "string"
          ? record.summary
          : typeof record?.message === "string"
            ? record.message
            : undefined,
        latencyMs: Math.round(performance.now() - startedAt),
        responseBody: body,
      };

      if (!response.ok) {
        const detail = diagnostic.summary ?? raw.trim().slice(0, 240) || `HTTP ${response.status}`;
        return { ok: false, error: new Error(detail), diagnostic };
      }

      return { ok: true, data: body as T, diagnostic };
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      const networkError = error.name === "AbortError" ? "Timeout" : error.message;
      return {
        ok: false,
        error,
        diagnostic: {
          endpoint,
          latencyMs: Math.round(performance.now() - startedAt),
          networkError,
        },
      };
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
