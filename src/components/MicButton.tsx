import { useEffect, useState } from "react";
import { UI_LABELS, type Lang } from "../data/animals";

type Props = {
  isListening: boolean;
  isAnalyzing: boolean;
  isComplete: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  lang: Lang;
  signalQuality?: number;
  habitat?: string;
};

type SoundMode = "off" | "low" | "high";

const SOUND_LABELS: Record<SoundMode, string> = {
  off: "OFF",
  low: "BAS",
  high: "FORT",
};

function readSoundMode(): SoundMode {
  const value = window.localStorage.getItem("spectrl-sound-mode");
  if (value === "off" || value === "low" || value === "high") return value;
  return "high";
}

function DiodeMeter({ label, value, color, count = 14 }: { label: string; value: number; color: string; count?: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(value || 0)));
  const active = Math.round((safe / 100) * count);
  return (
    <div className="min-w-[5.5rem] space-y-0.5">
      <div className="flex items-center justify-between gap-2 text-[7px] font-mono uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span style={{ color }}>{safe}%</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, index) => {
          const on = index < active;
          return (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={{
                background: on ? color : "rgba(255,255,255,0.10)",
                boxShadow: on ? `0 0 5px ${color}` : "none",
                opacity: on ? 1 : 0.42,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function TextWitness({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1 text-[7px] font-mono tracking-widest uppercase text-gray-500">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      <span>{label}</span>
      <span className="truncate" style={{ color }}>{value}</span>
    </div>
  );
}

function SoundControl({ mode, setMode }: { mode: SoundMode; setMode: (mode: SoundMode) => void }) {
  const modes: SoundMode[] = ["off", "low", "high"];
  return (
    <div className="flex items-center gap-1 rounded border border-white/10 bg-white/[0.025] p-1">
      <span className="hidden text-[7px] font-mono uppercase tracking-[0.18em] text-gray-500 sm:inline">son</span>
      {modes.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => setMode(item)}
          className="rounded px-1.5 py-0.5 text-[7px] font-mono uppercase tracking-[0.14em] transition-all active:scale-95"
          style={{
            color: mode === item ? (item === "off" ? "#ff8c8c" : item === "low" ? "#7ee8ff" : "#c7fff0") : "rgba(148,163,184,0.62)",
            background: mode === item ? "rgba(255,255,255,0.08)" : "transparent",
            boxShadow: mode === item ? "0 0 10px rgba(126,232,255,0.10)" : "none",
          }}
        >
          {SOUND_LABELS[item]}
        </button>
      ))}
    </div>
  );
}

export function MicButton({ isListening, isAnalyzing, isComplete, onStart, onStop, onReset, lang, signalQuality = 0, habitat = "---" }: Props) {
  const t = UI_LABELS[lang];
  const [soundMode, setSoundModeState] = useState<SoundMode>(() => readSoundMode());
  const label = isAnalyzing
    ? t.analyzing
    : isComplete
    ? t.complete
    : isListening
    ? t.stop
    : t.initiate;

  useEffect(() => {
    const sync = () => setSoundModeState(readSoundMode());
    window.addEventListener("storage", sync);
    window.addEventListener("spectrl-sound-mode-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("spectrl-sound-mode-change", sync);
    };
  }, []);

  const setSoundMode = (mode: SoundMode) => {
    window.localStorage.setItem("spectrl-sound-mode", mode);
    setSoundModeState(mode);
    window.dispatchEvent(new Event("spectrl-sound-mode-change"));
  };

  const handleClick = () => {
    if (isComplete) onReset();
    else if (isListening) onStop();
    else onStart();
  };

  const accent = isAnalyzing ? "#9b59ff" : isComplete ? "#00ff88" : isListening ? "#9b59ff" : "#00d4ff";
  const status = isListening
    ? "CANAL OUVERT // STOP POUR FIGER"
    : isComplete
    ? "RAPPORT FIGÉ // TOUCHER POUR RELANCER"
    : "STATION BLACKLACE — PRÊTE";

  return (
    <div
      className="fixed left-0 right-0 z-[999] px-3"
      style={{ bottom: "env(safe-area-inset-bottom, 0px)", pointerEvents: "none" }}
    >
      <div
        className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-t-xl rounded-b-none border border-b-0 px-3 py-2 backdrop-blur-md"
        style={{
          pointerEvents: "auto",
          borderColor: `${accent}55`,
          background: "linear-gradient(180deg, rgba(2,8,20,0.97), rgba(0,10,25,0.94))",
          boxShadow: `0 -10px 28px rgba(0,0,0,0.55), 0 0 22px ${accent}26, inset 0 0 18px ${accent}08`,
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="truncate text-[9px] font-mono uppercase tracking-[0.28em] sm:text-[10px]" style={{ color: accent }}>
              {label}
            </div>
            <SoundControl mode={soundMode} setMode={setSoundMode} />
          </div>
          <div className="mt-0.5 truncate text-[7px] font-mono uppercase tracking-widest text-gray-600 sm:text-[8px]">
            {status}
          </div>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <DiodeMeter label="SIG" value={signalQuality} color="#00d4ff" count={16} />
            <TextWitness label="ENV" value={habitat} color="#9b59ff" />
          </div>
        </div>

        <div className="relative flex shrink-0 items-center justify-center">
          {(isListening || isAnalyzing) && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 animate-ping rounded-full border border-cyan-400/25" style={{ animationDuration: "1.5s" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 animate-ping rounded-full border border-purple-400/20" style={{ animationDuration: "2s" }} />
              </div>
            </>
          )}

          <button
            onClick={handleClick}
            disabled={isAnalyzing}
            className={`
              relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2
              transition-all duration-300 focus:outline-none active:scale-95
              ${isAnalyzing
                ? "border-purple-400 bg-purple-400/10 cursor-wait"
                : isComplete
                ? "border-green-400 bg-green-400/10 hover:bg-green-400/20 cursor-pointer"
                : isListening
                ? "border-purple-400 bg-purple-400/10 hover:bg-purple-400/20 cursor-pointer"
                : "border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 cursor-pointer"
              }
            `}
            style={{
              boxShadow: isAnalyzing
                ? "0 0 20px #9b59ff66, inset 0 0 20px #9b59ff22"
                : isComplete
                ? "0 0 20px #00ff8866, inset 0 0 20px #00ff8822"
                : isListening
                ? "0 0 20px #9b59ff66, inset 0 0 20px #9b59ff22"
                : "0 0 20px #00d4ff44, inset 0 0 20px #00d4ff11",
            }}
          >
            {isAnalyzing ? (
              <svg className="h-6 w-6 animate-spin text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : isComplete ? (
              <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : isListening ? (
              <div className="h-5 w-5 rounded-sm bg-purple-400" />
            ) : (
              <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
