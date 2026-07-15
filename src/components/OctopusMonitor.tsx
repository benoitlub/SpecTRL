import { useEffect, useState } from "react";
import { OCTOPUS_MONITOR_EVENT, type OctopusMonitorState } from "../integrations/octopus/monitor";

const initialState: OctopusMonitorState = {
  status: "idle",
  message: "En attente d’une observation",
  updatedAt: new Date().toISOString(),
};

const LABELS: Record<OctopusMonitorState["status"], string> = {
  idle: "PRÊT",
  sending: "ENVOI",
  delivered: "CONNECTÉ",
  failed: "ERREUR",
  disabled: "OFF",
};

const DOTS: Record<OctopusMonitorState["status"], string> = {
  idle: "bg-white/35",
  sending: "bg-cyan-300 animate-pulse",
  delivered: "bg-emerald-300",
  failed: "bg-red-400",
  disabled: "bg-orange-300/60",
};

export function OctopusMonitor() {
  const [state, setState] = useState<OctopusMonitorState>(initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<OctopusMonitorState>).detail;
      if (detail) {
        setState(detail);
        if (detail.status === "failed") setOpen(true);
      }
    };
    window.addEventListener(OCTOPUS_MONITOR_EVENT, handle);
    return () => window.removeEventListener(OCTOPUS_MONITOR_EVENT, handle);
  }, []);

  return (
    <div className="fixed bottom-24 right-3 z-40 max-w-[calc(100vw-1.5rem)] font-mono">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="ml-auto flex items-center gap-2 rounded-full border border-cyan-300/30 bg-slate-950/92 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_20px_rgba(0,212,255,0.16)] backdrop-blur"
        aria-expanded={open}
      >
        <span aria-hidden="true">🐙</span>
        <span className={`h-2 w-2 rounded-full ${DOTS[state.status]}`} />
        <span>{LABELS[state.status]}</span>
      </button>

      {open && (
        <div className="mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-cyan-300/25 bg-slate-950/95 p-3 text-[9px] text-cyan-100 shadow-[0_0_28px_rgba(0,212,255,0.14)] backdrop-blur">
          <div className="mb-2 flex items-center justify-between uppercase tracking-[0.22em]">
            <span>Moniteur Octopus</span>
            <span className="text-white/40">{LABELS[state.status]}</span>
          </div>
          <div className="space-y-1 text-white/65">
            <div>Mission : <span className="text-cyan-100">{state.eventType || "—"}</span></div>
            <div>HTTP : <span className="text-cyan-100">{state.httpStatus ?? "—"}</span></div>
            <div>Statut : <span className="text-cyan-100">{state.responseStatus || "—"}</span></div>
            <div>Code : <span className="text-cyan-100">{state.responseCode || "—"}</span></div>
            <div>Décision : <span className="text-cyan-100">{state.decision || "—"}</span></div>
            <div>Temps : <span className="text-cyan-100">{state.latencyMs != null ? `${state.latencyMs} ms` : "—"}</span></div>
            <div className="break-all">URL : <span className="text-cyan-100">{state.endpoint || "—"}</span></div>
            {state.networkError && <div className="break-words">Réseau : <span className="text-red-300">{state.networkError}</span></div>}
            <div className="break-words">Info : <span className="text-cyan-100">{state.message || "—"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
