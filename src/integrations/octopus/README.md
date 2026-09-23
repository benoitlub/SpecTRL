# SpecTRL → Octopus adapter

This folder contains the integration boundary between SpecTRL and the public Octopus Engine API.

## Architectural rule

- Octopus Engine is not modified for SpecTRL.
- SpecTRL remains fully functional when Octopus is unavailable.
- The adapter is enabled by default in production and can be disabled with `VITE_OCTOPUS_ADAPTER_ENABLED=false`.
- Network errors, invalid responses and timeouts are returned as adapter results; they must never block audio capture or the core SpecTRL UI.

## Environment variables

```env
VITE_OCTOPUS_ADAPTER_ENABLED=false
VITE_OCTOPUS_ADAPTER_ENDPOINT=https://octopus-engine-app.benoitlubert.workers.dev
VITE_OCTOPUS_ADAPTER_TIMEOUT_MS=2500
```

Enabling the flag without an endpoint still leaves the adapter disabled.

## Intended first integration

```ts
import { createSpecTRLOctopusAdapter } from "@/integrations/octopus";

const adapter = createSpecTRLOctopusAdapter();
const event = adapter.createEvent("audio.detected", {
  confidence: 0.82,
  frequencyPeakHz: 4200,
  durationMs: 1800,
});

void adapter.emit(event).then((result) => {
  // Observe/log the result without blocking SpecTRL.
});
```

The application emits stabilized observations from its existing integration boundary. The adapter posts to `/mission` on the configured base URL. A network error must leave the local scan functional.
