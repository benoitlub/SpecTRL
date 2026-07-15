import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const OCTOPUS_URL = (process.env.OCTOPUS_URL || "https://octopus-engine.onrender.com").replace(/\/$/, "");
const PUBLIC_URL = (process.env.RENDER_EXTERNAL_URL || process.env.SPECTRL_ADAPTER_PUBLIC_URL || "").replace(/\/$/, "");
const CAPABILITIES = ["observation.analyze"];

function json(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function analyzeMission(mission) {
  const event = mission?.context?.metadata?.event;
  const payload = event?.payload || {};
  const confidence = numberValue(payload.confidence);
  const frequencyPeakHz = numberValue(payload.frequencyPeakHz);

  let decision = "record";
  let reason = "Observation spectrale reçue et conservée pour comparaison.";
  const actions = ["store_observation"];

  if (confidence !== undefined && confidence < 0.35) {
    decision = "ignore";
    reason = "Confiance trop faible pour déclencher une analyse complémentaire.";
    actions.splice(0, actions.length, "keep_local_only");
  } else if (confidence !== undefined && confidence >= 0.75) {
    decision = "enrich";
    reason = "Confiance suffisante pour enrichir l’observation et la rapprocher de l’historique.";
    actions.push("compare_history", "prepare_enrichment");
  } else if (frequencyPeakHz !== undefined && (frequencyPeakHz < 40 || frequencyPeakHz > 18000)) {
    decision = "request_analysis";
    reason = "Fréquence atypique : une analyse complémentaire est recommandée.";
    actions.push("request_deeper_analysis");
  }

  return {
    status: "completed",
    summary: reason,
    output: {
      decision,
      reason,
      actions,
      diagnostics: { confidence, frequencyPeakHz },
    },
  };
}

async function register() {
  if (!PUBLIC_URL) {
    console.warn("SpecTRL adapter not registered: RENDER_EXTERNAL_URL or SPECTRL_ADAPTER_PUBLIC_URL is missing.");
    return;
  }
  const response = await fetch(`${OCTOPUS_URL}/adapters/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "spectrl",
      name: "SpecTRL adapter",
      version: "1",
      capabilities: CAPABILITIES,
      executeUrl: `${PUBLIC_URL}/execute`,
      healthUrl: `${PUBLIC_URL}/health`,
      metadata: { owner: "SpecTRL", contract: "octopus-adapter-execution-v1" },
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Octopus registration failed (${response.status}): ${text}`);
  console.log("SpecTRL adapter registered with Octopus.");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { status: "ok", service: "spectrl-octopus-adapter", capabilities: CAPABILITIES });
  }
  if (req.method === "POST" && req.url === "/execute") {
    try {
      const body = await readBody(req);
      if (body?.contract !== "octopus-adapter-execution-v1" || !body?.mission) {
        return json(res, 400, { status: "failed", summary: "Invalid Octopus adapter execution contract.", output: {} });
      }
      return json(res, 200, { operationId: body.mission.operationId, ...analyzeMission(body.mission) });
    } catch (error) {
      return json(res, 400, { status: "failed", summary: error instanceof Error ? error.message : "Invalid request.", output: {} });
    }
  }
  return json(res, 404, { status: "not-found" });
});

server.listen(PORT, () => {
  console.log(`SpecTRL Octopus adapter listening on ${PORT}`);
  register().catch((error) => console.error(error));
  setInterval(() => register().catch((error) => console.error(error)), 5 * 60 * 1000).unref();
});
