import { useEffect, useMemo, useState } from "react";
import { type AnalysisState, UI_LABELS, type Lang } from "../data/animals";

const ANALYSIS_STEPS: Record<Lang, string[]> = {
  fr: [
    "Capture de la trace acoustique",
    "Nettoyage du bruit humain inutile",
    "Isolement des rémanences suspectes",
    "Comparaison des signatures Marty",
    "Interprétation environnementale",
    "Reconstruction finale en attente",
  ],
  en: [
    "Capturing acoustic trace",
    "Removing unnecessary human noise",
    "Isolating suspicious remanences",
    "Comparing Marty signature patterns",
    "Reading environmental intent",
    "Waiting for final reconstruction",
  ],
  es: [
    "Captura de traza acústica",
    "Limpieza del ruido humano innecesario",
    "Aislamiento de remanencias sospechosas",
    "Comparación de firmas Marty",
    "Interpretación ambiental",
    "Esperando reconstrucción final",
  ],
};

const LIVE_LABEL: Record<Lang, string> = {
  fr: "MOT CAPTÉ // AIR FROID",
  en: "WORD CAUGHT // COLD AIR",
  es: "PALABRA CAPTADA // AIRE FRÍO",
};

const EMPTY_LABEL: Record<Lang, string> = {
  fr: "fragment isolé",
  en: "isolated fragment",
  es: "fragmento aislado",
};

type LivePhase = "hidden" | "in" | "hold" | "out";

function buildFragments(text: string, lang: Lang) {
  const cleaned = text.replace(/[“”".,!?¿¡:;()]/g, " ").replace(/\s+/g, " ").trim();
  const stopWords: Record<Lang, Set<string>> = {
    fr: new Set(["avec", "dans", "pour", "mais", "donc", "quand", "comme", "cette", "être", "avait", "avais", "plus", "moins", "très", "près", "tout", "tous", "toute", "leurs", "leur", "sans", "sous", "chez", "elle", "elles", "nous", "vous", "ils", "des", "les", "une", "que", "qui", "pas", "non", "j'ai", "c'est", "était", "avait", "commençait"]),
    en: new Set(["with", "that", "this", "there", "their", "they", "them", "from", "were", "where", "what", "when", "have", "should", "would", "could", "only", "just", "very", "into", "near", "here"]),
    es: new Set(["con", "para", "pero", "como", "esta", "este", "todo", "todos", "muy", "más", "menos", "donde", "cuando", "porque", "aquí", "ellas", "ellos", "una", "unos", "que", "por"]),
  };
  const words = cleaned.split(" ").map(word => word.trim()).filter(word => word.length >= 4).filter(word => !stopWords[lang].has(word.toLowerCase()));
  const unique = Array.from(new Set(words)).slice(0, 5);
  if (unique.length >= 2) return unique;
  const fallbacks: Record<Lang, string[]> = {
    fr: ["couloir", "fenêtre", "tiroir", "attente"],
    en: ["hallway", "window", "drawer", "waiting"],
    es: ["pasillo", "ventana", "cajón", "espera"],
  };
  return Array.from(new Set([...unique, ...fallbacks[lang]])).slice(0, 4);
}

function phaseStyle(phase: LivePhase) {
  if (phase === "in") {
    return {
      opacity: 0.68,
      transform: "scale(1.02) translateY(0px)",
      filter: "blur(0.35px) drop-shadow(0 0 7px rgba(155,89,255,0.42))",
      textShadow: "0 0 10px rgba(155,89,255,0.34)",
    };
  }
  if (phase === "hold") {
    return {
      opacity: 1,
      transform: "scale(1) translateY(0px)",
      filter: "blur(0px) drop-shadow(0 0 8px rgba(155,89,255,0.68)) drop-shadow(0 0 16px rgba(126,232,255,0.18))",
      textShadow: "0 0 12px rgba(155,89,255,0.62), 0 0 24px rgba(126,232,255,0.18)",
    };
  }
  if (phase === "out") {
    return {
      opacity: 0,
      transform: "scale(1.03) translateY(-3px)",
      filter: "blur(1.6px) drop-shadow(0 0 10px rgba(155,89,255,0.28))",
      textShadow: "0 0 16px rgba(155,89,255,0.20)",
    };
  }
  return {
    opacity: 0,
    transform: "scale(0.97) translateY(4px)",
    filter: "blur(1.8px)",
    textShadow: "none",
  };
}

export function TranslationCard({ state, lang }: { state: AnalysisState; lang: Lang }) {
  const t = UI_LABELS[lang];
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  const [liveIndex, setLiveIndex] = useState(0);
  const [phase, setPhase] = useState<LivePhase>("hidden");
  const steps = ANALYSIS_STEPS[lang];
  const hasTranslation = Boolean(state.translation);
  const isLive = state.isListening && hasTranslation;
  const isFinal = state.isComplete && hasTranslation;

  const activeStep = useMemo(() => {
    if (!state.isAnalyzing && !state.isListening) return -1;
    return Math.min(steps.length - 1, Math.floor((state.scanProgress / 100) * steps.length));
  }, [state.isAnalyzing, state.isListening, state.scanProgress, steps.length]);

  const fragments = useMemo(() => buildFragments(state.translation, lang), [state.translation, lang]);

  useEffect(() => {
    if (!isLive || fragments.length === 0) {
      setLiveIndex(0);
      setPhase("hidden");
      return;
    }

    let cancelled = false;
    let index = 0;
    const timers: number[] = [];

    const runCycle = () => {
      if (cancelled) return;
      setLiveIndex(index % fragments.length);
      setPhase("hidden");
      timers.push(window.setTimeout(() => { if (!cancelled) setPhase("in"); }, 160));
      timers.push(window.setTimeout(() => { if (!cancelled) setPhase("hold"); }, 720));
      timers.push(window.setTimeout(() => { if (!cancelled) setPhase("out"); }, 2200));
      timers.push(window.setTimeout(() => {
        if (cancelled) return;
        index += 1;
        runCycle();
      }, 3350));
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(id => window.clearTimeout(id));
    };
  }, [isLive, fragments.join("|")]);

  useEffect(() => {
    if (!hasTranslation || state.isListening || !state.isComplete) {
      setDisplayed("");
      return;
    }

    setDisplayed("");
    let i = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        if (i <= state.translation.length) {
          setDisplayed(state.translation.slice(0, i));
          i++;
        } else if (interval) {
          clearInterval(interval);
        }
      }, 34);
    }, 220);

    return () => {
      clearTimeout(delay);
      if (interval) clearInterval(interval);
    };
  }, [state.translation, state.isComplete, state.isListening, hasTranslation]);

  useEffect(() => {
    const interval = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

  const accentColor = state.isPoetic ? "#9b59ff" : isLive ? "#8f72ff" : "#00d4ff";
  const labelText = isLive ? LIVE_LABEL[lang] : state.isPoetic ? t.poetry : t.translation;
  const borderActive = isFinal || isLive;
  const currentFragment = fragments[liveIndex] || "";
  const ghostStyle = phaseStyle(phase);

  return (
    <div
      className="relative rounded border p-2.5 backdrop-blur-sm transition-all duration-500"
      style={{
        background: "rgba(2, 8, 20, 0.85)",
        borderColor: borderActive ? accentColor + "44" : state.isAnalyzing ? "#ff8c0044" : "#ffffff11",
        boxShadow: borderActive ? `0 0 18px ${accentColor}1f, inset 0 0 18px ${accentColor}08` : state.isAnalyzing ? "0 0 12px #ff8c0014, inset 0 0 12px #ff8c0008" : "none",
        minHeight: isLive ? "5.55rem" : isFinal ? "6rem" : "5.2rem",
      }}
    >
      <div className="absolute -top-px left-3 right-3 h-px transition-all duration-500" style={{ background: borderActive ? `linear-gradient(90deg, transparent, ${accentColor}aa, transparent)` : state.isAnalyzing || state.isListening ? "linear-gradient(90deg, transparent, #ff8c0088, transparent)" : "transparent" }} />
      <div className="mb-1.5 flex items-center gap-2 text-[8px] font-mono uppercase tracking-[0.22em]" style={{ color: borderActive ? accentColor : state.isAnalyzing || state.isListening ? "#ff8c00" : "#ffffff33" }}>
        <div className="h-1 w-1 rounded-full transition-all duration-500" style={{ background: borderActive ? accentColor : state.isAnalyzing || state.isListening ? "#ff8c00" : "#ffffff22", boxShadow: borderActive ? `0 0 4px ${accentColor}` : state.isAnalyzing || state.isListening ? "0 0 4px #ff8c00" : "none" }} />
        {state.isAnalyzing && !hasTranslation ? "TRACE RESONANCE REFLECTION" : labelText}
        {isLive && <span className="ml-auto text-[7px] tracking-wider text-purple-300/60">LIVE</span>}
        {state.isPoetic && isFinal && <span className="ml-auto text-[8px] tracking-wider text-purple-400/70">{t.rare}</span>}
      </div>

      {(state.isAnalyzing || (state.isListening && !hasTranslation)) && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="h-3 w-1 rounded-sm" style={{ background: "#ff8c00", boxShadow: "0 0 4px #ff8c00", animation: `pulse 0.8s ease-in-out ${i * 0.12}s infinite alternate`, opacity: 0.4 }} />)}
            </div>
            <span className="text-[10px] font-mono text-orange-400/70 tracking-wider">{t.decoding}</span>
          </div>
          <div className="grid grid-cols-1 gap-x-3 gap-y-1 pt-1 sm:grid-cols-2">
            {steps.map((step, index) => {
              const done = index < activeStep;
              const active = index === activeStep;
              return (
                <div key={step} className="flex items-center gap-2 text-[8px] font-mono tracking-[0.08em] transition-all duration-300" style={{ color: done ? "#9b59ff99" : active ? "#ff8c00dd" : "#ffffff26" }}>
                  <span style={{ width: "0.8rem", display: "inline-block" }}>{done ? "✓" : active ? "◆" : "·"}</span>
                  <span className="truncate">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLive && (
        <div className="space-y-0.5">
          <div className="text-center text-[7px] font-mono uppercase tracking-[0.24em] text-purple-200/34">{EMPTY_LABEL[lang]}</div>
          <div className="flex min-h-[44px] items-center justify-center">
            <div
              className="relative flex min-h-[32px] min-w-[104px] items-center justify-center rounded-lg border px-3 py-1 transition-all duration-500"
              style={{
                borderColor: "rgba(155,89,255,0.12)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.014), rgba(255,255,255,0.006))",
                boxShadow: "inset 0 0 14px rgba(155,89,255,0.035), 0 0 12px rgba(155,89,255,0.035)",
              }}
            >
              {currentFragment && (
                <span className="font-mono text-[15px] lowercase tracking-[0.08em] transition-all duration-700 sm:text-[17px]" style={{ color: "#e9ddff", opacity: ghostStyle.opacity, transform: ghostStyle.transform, filter: ghostStyle.filter, textShadow: ghostStyle.textShadow }}>
                  {currentFragment}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {isFinal && (
        <div className="font-mono text-sm leading-relaxed" style={{ color: state.isPoetic ? "#c4a8ff" : "#e2f5ff", textShadow: state.isPoetic ? "0 0 12px #9b59ff44" : "none", fontStyle: state.isPoetic ? "italic" : "normal", letterSpacing: state.isPoetic ? "0.02em" : "0.01em" }}>
          {!displayed && <span className="text-cyan-400/50 tracking-[0.22em] uppercase text-[10px]">⚠ Reconstruction de rémanence...</span>}
          {state.isPoetic && displayed && <span className="text-purple-400/60 mr-1">&ldquo;</span>}
          {displayed}
          {cursor && displayed.length < state.translation.length && <span style={{ color: accentColor }}>█</span>}
          {state.isPoetic && displayed.length === state.translation.length && <span className="text-purple-400/60 ml-1">&rdquo;</span>}
        </div>
      )}

      {!hasTranslation && !state.isAnalyzing && !state.isListening && <div className="pt-2 text-[10px] font-mono tracking-widest text-gray-600">{t.awaiting}</div>}

      {(isLive || isFinal) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-1.5">
          {state.species && <span className="text-[8px] font-mono tracking-wider text-gray-500">SRC: {state.species.name}</span>}
          <span className="text-[8px] font-mono tracking-wider text-gray-600">{t.confidence}: {state.confidence}%</span>
          <span className="ml-auto text-[8px] font-mono tracking-wider text-gray-600">{isLive ? "FONDU SPECTRAL" : t.institute + " // SPEC-TRL"}</span>
        </div>
      )}
    </div>
  );
}
