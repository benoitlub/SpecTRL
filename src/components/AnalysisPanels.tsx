import { type AnalysisState, type Lang, UI_LABELS, getThreatColor } from "../data/animals";

type PanelProps = { className?: string; children: React.ReactNode; label: string; accent?: string };

export function Panel({ className = "", children, label, accent = "#00d4ff" }: PanelProps) {
  return (
    <div
      className={`relative rounded border p-3 backdrop-blur-sm ${className}`}
      style={{ background: "rgba(2, 8, 20, 0.75)", borderColor: accent + "33", boxShadow: `0 0 12px ${accent}11, inset 0 0 12px ${accent}08` }}
    >
      <div className="absolute -top-px left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />
      <div className="mb-2 flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: accent }}>
        <div className="h-1 w-1 rounded-full" style={{ background: accent, boxShadow: `0 0 4px ${accent}` }} />
        {label}
      </div>
      {children}
    </div>
  );
}

function DiodeBar({ value, color, label, sublabel, count = 18 }: { value: number; color: string; label: string; sublabel?: string; count?: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value || 0)));
  const active = Math.round((safeValue / 100) * count);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400">{label}</span>
        {sublabel && <span className="text-[9px] font-mono" style={{ color }}>{sublabel}</span>}
      </div>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: count }).map((_, index) => {
          const on = index < active;
          const hot = on && index >= count * 0.72;
          return (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={{
                background: on ? color : "rgba(255,255,255,0.09)",
                boxShadow: on ? `0 0 ${hot ? 8 : 5}px ${color}` : "none",
                opacity: on ? 1 : 0.38,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Placeholder({ text = "AWAITING SIGNAL" }: { text?: string }) {
  return <div className="py-1 text-[10px] font-mono tracking-widest text-gray-600">{text}</div>;
}

function isActive(state: AnalysisState) {
  return Boolean(state.isComplete || state.isListening || state.isAnalyzing || state.species || state.detectedSpecies);
}

function liveProgress(state: AnalysisState, fallback = 24) {
  if (state.isComplete) return state.confidence || state.signalQuality || 80;
  return Math.max(fallback, Math.min(96, state.scanProgress || fallback));
}

function getPhaseLabel(state: AnalysisState, lang: Lang) {
  const p = state.scanProgress || 0;
  if (state.isComplete) return lang === "fr" ? "CONFIRMÉ" : "CONFIRMED";
  if (p < 25) return lang === "fr" ? "SIGNAL" : "SIGNAL";
  if (p < 55) return lang === "fr" ? "PROBABLE" : "LIKELY";
  return lang === "fr" ? "EN COURS" : "IN PROGRESS";
}

function pendingSignature(lang: Lang) {
  if (lang === "en") return "Trace signature";
  if (lang === "es") return "Firma de traza";
  return "Signature de trace";
}

function pendingClassification(lang: Lang) {
  if (lang === "en") return "Resonance pending";
  if (lang === "es") return "Resonancia pendiente";
  return "Résonance en attente";
}

export function SpeciesPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state);
  const commonName = state.species?.scientificName?.[lang] || state.detectedSpecies || (state.isListening ? pendingSignature(lang) : "");
  const latinName = state.species?.name || (state.isListening ? pendingClassification(lang) : "");
  const confidence = state.isComplete ? state.confidence : liveProgress(state, state.speciesConfidence || 34);

  return (
    <Panel label={t.species} accent="#00d4ff">
      {active && commonName ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-base font-mono font-bold leading-tight tracking-wider text-white">{commonName}</div>
            {!state.isComplete && <span className="text-[8px] tracking-widest text-cyan-300/70">{getPhaseLabel(state, lang)}</span>}
          </div>
          <div className="text-[10px] font-mono uppercase italic text-cyan-400/70">{latinName}</div>
          {state.species && (
            <div className="mt-2 flex flex-wrap gap-1">
              {state.species.personality[lang].slice(0, state.isComplete ? 4 : 2).map(p => (
                <span key={p} className="rounded border border-cyan-400/20 px-1.5 py-0.5 text-[8px] font-mono tracking-wider text-cyan-300/70">{p}</span>
              ))}
            </div>
          )}
          <div className="mt-2">
            <DiodeBar value={confidence} color="#00d4ff" label={t.confidence} sublabel={`${Math.round(confidence)}%`} count={22} />
          </div>
        </div>
      ) : <Placeholder text={state.isListening || state.isAnalyzing ? t.scanning : t.noSignal} />}
    </Panel>
  );
}

export function EmotionalPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state) && (state.emotionalState || state.isListening || state.isAnalyzing);
  const resonance = state.isComplete ? state.neuralResonance : liveProgress(state, 28);
  const clarity = state.isComplete ? state.signalQuality : Math.max(18, Math.min(92, resonance + 12));
  return (
    <Panel label={t.emotional} accent="#ff8c00">
      {active ? (
        <div className="space-y-2">
          <div className="text-[11px] font-mono leading-relaxed tracking-wider text-orange-400">{state.emotionalState || (lang === "fr" ? "CALIBRAGE ÉMOTIONNEL" : "EMOTIONAL CALIBRATION")}</div>
          <DiodeBar value={resonance} color="#ff8c00" label={t.resonance} sublabel={`${Math.round(resonance)}%`} />
          <DiodeBar value={clarity} color="#ffcc00" label={t.clarity} sublabel={`${Math.round(clarity)}%`} />
        </div>
      ) : <Placeholder text={state.isListening || state.isAnalyzing ? t.calibrating : t.offline} />}
    </Panel>
  );
}

export function ThreatPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state);
  const liveLevel: AnalysisState["threatLevel"] = state.threatLevel || "LOW";
  const color = getThreatColor(liveLevel);
  const levels: AnalysisState["threatLevel"][] = ["MINIMAL", "LOW", "MODERATE", "ELEVATED", "CRITICAL"];
  const idx = Math.max(0, levels.indexOf(liveLevel));
  return (
    <Panel label={t.threat} accent="#ff4444">
      {active ? (
        <div className="space-y-2">
          <div className="text-lg font-mono font-bold tracking-[0.2em]" style={{ color, textShadow: `0 0 10px ${color}` }}>{state.isComplete ? liveLevel : getPhaseLabel(state, lang)}</div>
          <div className="flex gap-1">
            {levels.map((l, i) => <div key={l} className="h-2 flex-1 rounded-full transition-all duration-500" style={{ background: i <= idx ? color : "#ffffff11", boxShadow: i <= idx ? `0 0 6px ${color}` : "none" }} />)}
          </div>
        </div>
      ) : <Placeholder text={state.isListening || state.isAnalyzing ? t.assessing : t.offline} />}
    </Panel>
  );
}

export function BiologicalPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state) && (state.biologicalIntent || state.isListening || state.isAnalyzing);
  return <Panel label={t.biological} accent="#00ff88">{active ? <div className="text-[11px] font-mono leading-relaxed tracking-wider text-green-400">{state.biologicalIntent || (lang === "fr" ? "DÉCODAGE DU COMPORTEMENT" : "BEHAVIOR DECODING")}</div> : <Placeholder text={state.isListening || state.isAnalyzing ? t.decoding2 : t.offline} />}</Panel>;
}

export function NeuralPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state);
  const patterns = state.species?.neuralPatterns || ["SIGNAL_LOCK", "SPECTRAL_SYNC", "FIELD_BUFFER"];
  return (
    <Panel label={t.neural} accent="#9b59ff">
      {active ? <div className="space-y-1.5">{patterns.slice(0, state.isComplete ? 3 : 2).map(p => <div key={p} className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-400" style={{ boxShadow: "0 0 5px #9b59ff" }} /><span className="text-[9px] font-mono tracking-wider text-purple-300/80">{p}</span></div>)}</div> : <Placeholder text={state.isListening || state.isAnalyzing ? t.resonating : t.offline} />}
    </Panel>
  );
}

export function EnvironmentPanel({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = isActive(state);
  const scans = state.isComplete && state.species ? state.species.environmentalScans[lang] : [state.environmentalScan || (lang === "fr" ? "AMBIANCE : ÉCOUTE EN COURS" : "AMBIENCE: LISTENING")];
  return (
    <Panel label={t.environment} accent="#ffcc00">
      {active ? <div className="space-y-1.5">{scans.slice(0, state.isComplete ? 3 : 2).map(s => <div key={s} className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-yellow-400" style={{ boxShadow: "0 0 5px #ffcc00" }} /><span className="text-[9px] font-mono leading-relaxed tracking-wider text-yellow-300/80">{s}</span></div>)}</div> : <Placeholder text={state.isListening || state.isAnalyzing ? t.envScan : t.offline} />}
    </Panel>
  );
}

export function SignalQualityPanel({ state, scanProgress, lang }: { state: AnalysisState; scanProgress: number; lang: Lang }) {
  const t = UI_LABELS[lang];
  const active = state.isListening || state.isAnalyzing || state.isComplete;
  const signal = state.isComplete ? state.signalQuality : active ? Math.max(scanProgress, state.signalQuality || 18) : 0;
  return (
    <Panel label={t.signal} accent="#00d4ff">
      <div className="space-y-2">
        <DiodeBar value={signal} color="#00d4ff" label={t.strength} sublabel={`${Math.floor(signal)}%`} count={24} />
        <div className="flex justify-between text-[8px] font-mono tracking-wider text-gray-600">
          <span>{t.freq}: {active ? "0.2–10 kHz" : "---"}</span>
          <span>{t.codec}: SPECTRL/v3</span>
        </div>
      </div>
    </Panel>
  );
}
