import { useEffect, useRef, useState } from "react";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { useSpectralBeeps } from "../hooks/useSpectralBeeps";
import { MicButton } from "../components/MicButton";
import { TranslationCard } from "../components/TranslationCard";
import { SensorScreensV3 } from "../components/SensorScreensV3";
import { SpectralJournal } from "../components/SpectralJournal";
import { SpeciesPanel, SignalQualityPanel, NeuralPanel } from "../components/AnalysisPanels";
import { type Lang } from "../data/animals";
import { createSpectralJournalEntry, saveSpectralJournalEntry, type SpectralJournalEntry } from "../utils/spectralJournal";

function Header({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <header className="relative z-10 px-3 pt-3">
      <div className="mx-auto max-w-5xl rounded-2xl border border-cyan-300/25 bg-slate-950/85 px-4 py-3 shadow-[0_0_30px_rgba(0,212,255,0.10)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-mono text-2xl font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-3xl">SpecTRL</h1>
              <span className="rounded border border-purple-300/30 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.24em] text-purple-100/80">v0.2.1 RESTORED</span>
            </div>
            <div className="mt-1 text-[9px] font-mono uppercase tracking-[0.30em] text-orange-300/70">Feuch Institute // Marty trace resonance logger</div>
          </div>
          <div className="flex items-center gap-2">
            {(["fr", "en", "es"] as Lang[]).map(item => (
              <button key={item} type="button" onClick={() => setLang(item)} className="rounded border px-2 py-1 text-[9px] font-mono uppercase tracking-widest" style={{ borderColor: lang === item ? "#00d4ff" : "#ffffff22", color: lang === item ? "#7ee8ff" : "#ffffff66" }}>{item}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-5xl px-3 pb-44 pt-4">
      <div className="rounded-xl border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-center text-[8px] font-mono uppercase tracking-[0.22em] text-cyan-100/50">
        Feuch Institute // SpecTRL v0.2.1 RESTORED // Journal local // partage + appel Marty
      </div>
    </footer>
  );
}

export default function Home() {
  const { state, micPermission, audioFeatures, detectedLabel, lang, setLang, startListening, stopListening, reset } = useAudioAnalysis();
  const [latestEntry, setLatestEntry] = useState<SpectralJournalEntry | null>(null);
  const savedKey = useRef("");
  const active = state.isListening || state.isAnalyzing;

  useSpectralBeeps(active, state.scanProgress, state.isComplete);

  useEffect(() => {
    if (!state.isComplete || !state.translation) return;
    const key = `${state.translation}-${state.confidence}-${state.detectedSpecies}`;
    if (savedKey.current === key) return;
    const entry = createSpectralJournalEntry(state, audioFeatures || state.audioFeatures);
    if (!entry) return;
    saveSpectralJournalEntry(entry);
    setLatestEntry(entry);
    savedKey.current = key;
  }, [state, audioFeatures]);

  useEffect(() => {
    if (state.isListening) savedKey.current = "";
  }, [state.isListening]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#01040c] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,212,255,0.14),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(155,89,255,0.16),transparent_34%)]" />
      <Header lang={lang} setLang={setLang} />

      <main className="relative z-10 mx-auto max-w-5xl space-y-3 px-3 py-3 pb-44">
        {micPermission === "denied" && <div className="rounded border border-red-300/30 bg-red-500/10 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-red-200">Micro refusé ou indisponible.</div>}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.85fr_1.15fr]">
          <SpeciesPanel state={state} lang={lang} />
          <SensorScreensV3 active={active} audioFeatures={audioFeatures || state.audioFeatures} progress={state.scanProgress} detectedLabel={detectedLabel || state.detectedSpecies} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.85fr_1.2fr_0.95fr]">
          <SignalQualityPanel state={state} scanProgress={state.scanProgress} lang={lang} />
          <TranslationCard state={state} lang={lang} />
          <NeuralPanel state={state} lang={lang} />
        </div>

        <div className="rounded-2xl border border-purple-300/20 bg-slate-950/60 p-2">
          <div className="px-2 pb-2 text-[9px] font-mono uppercase tracking-[0.24em] text-purple-200/70">Journal spectral // partage // appel aux dons</div>
          <SpectralJournal latestEntry={latestEntry} />
        </div>
      </main>

      <MicButton isListening={state.isListening} isAnalyzing={state.isAnalyzing} isComplete={state.isComplete} onStart={startListening} onStop={stopListening} onReset={reset} lang={lang} signalQuality={state.signalQuality || state.scanProgress} habitat={state.environmentalScan || "TRACE"} />
      <Footer />
    </div>
  );
}
