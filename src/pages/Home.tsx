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

const PAYPAL_URL = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=benoitlubert@gmail.com&currency_code=EUR&item_name=Support+SpecTRL";

const ACTION_COPY: Record<Lang, { actions: string; share: string; hideJournal: string; journal: string; support: string; journalTitle: string; footer: string }> = {
  fr: {
    actions: "Actions",
    share: "Partager",
    hideJournal: "Masquer journal",
    journal: "Journal",
    support: "Soutenir",
    journalTitle: "Journal spectral compact",
    footer: "Feuch Institute // SpecTRL v1.1 COMPACT SILENCE // protocole compact // son modulable",
  },
  en: {
    actions: "Actions",
    share: "Share",
    hideJournal: "Hide journal",
    journal: "Journal",
    support: "Support",
    journalTitle: "Compact spectral journal",
    footer: "Feuch Institute // SpecTRL v1.1 COMPACT SILENCE // compact protocol // sound control",
  },
  es: {
    actions: "Acciones",
    share: "Compartir",
    hideJournal: "Ocultar diario",
    journal: "Diario",
    support: "Apoyar",
    journalTitle: "Diario espectral compacto",
    footer: "Feuch Institute // SpecTRL v1.1 COMPACT SILENCE // protocolo compacto // sonido ajustable",
  },
};

function Header({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <header className="relative z-10 px-3 pt-3">
      <div className="mx-auto max-w-5xl rounded-2xl border border-cyan-300/25 bg-slate-950/85 px-4 py-3 shadow-[0_0_30px_rgba(0,212,255,0.10)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-mono text-2xl font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-3xl">SpecTRL</h1>
              <span className="rounded border border-purple-300/30 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.24em] text-purple-100/80">v1.1 COMPACT SILENCE</span>
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

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="relative z-10 mx-auto max-w-5xl px-3 pb-44 pt-4">
      <div className="rounded-xl border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-center text-[8px] font-mono uppercase tracking-[0.22em] text-cyan-100/50">
        {ACTION_COPY[lang].footer}
      </div>
    </footer>
  );
}

function ActionPanel({ lang, showJournal, setShowJournal, latestEntry }: { lang: Lang; showJournal: boolean; setShowJournal: (value: boolean) => void; latestEntry: SpectralJournalEntry | null }) {
  const copy = ACTION_COPY[lang];

  const handleShare = async () => {
    const title = latestEntry ? `SpecTRL — ${latestEntry.signatureName}` : "SpecTRL";
    const text = latestEntry
      ? `${latestEntry.signatureName} — ${latestEntry.confidence}%\n${latestEntry.translation}`
      : "SpecTRL — Marty Trace Resonance Logger";
    const url = "https://benoitlub.github.io/SpecTRL/";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      window.alert("Trace copiée avec le lien SpecTRL.");
    } catch {
      try {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      } catch {
        window.alert("Partage impossible ici, Marty garde la trace en mémoire.");
      }
    }
  };

  const handleDonate = () => {
    window.open(PAYPAL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-orange-300/25 bg-slate-950/70 p-3 shadow-[0_0_24px_rgba(255,140,0,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[9px] font-mono uppercase tracking-[0.30em] text-orange-200/75">{copy.actions}</div>
        <div className="text-[8px] font-mono uppercase tracking-[0.22em] text-white/30">Feuch Institute</div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={handleShare} className="rounded border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-100">{copy.share}</button>
        <button type="button" onClick={() => setShowJournal(!showJournal)} className="rounded border border-purple-300/35 bg-purple-300/10 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-purple-100">{showJournal ? copy.hideJournal : copy.journal}</button>
        <button type="button" onClick={handleDonate} className="rounded border border-orange-300/40 bg-orange-300/10 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-orange-100">{copy.support}</button>
      </div>
    </div>
  );
}

export default function Home() {
  const { state, micPermission, audioFeatures, detectedLabel, lang, setLang, startListening, stopListening, reset } = useAudioAnalysis();
  const [latestEntry, setLatestEntry] = useState<SpectralJournalEntry | null>(null);
  const [showJournal, setShowJournal] = useState(false);
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
    setShowJournal(true);
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

        <div className="grid grid-cols-[0.92fr_1.08fr] items-start gap-2 sm:gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <SpeciesPanel state={state} lang={lang} />
          <SensorScreensV3 radarOnly compact active={active} audioFeatures={audioFeatures || state.audioFeatures} progress={state.scanProgress} detectedLabel={detectedLabel || state.detectedSpecies} />
        </div>

        <div className="space-y-3">
          <TranslationCard state={state} lang={lang} />
          {showJournal && (
            <div className="rounded-2xl border border-purple-300/20 bg-slate-950/60 p-2">
              <div className="px-2 pb-2 text-[9px] font-mono uppercase tracking-[0.24em] text-purple-200/70">{ACTION_COPY[lang].journalTitle}</div>
              <SpectralJournal latestEntry={latestEntry} compact />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <SignalQualityPanel state={state} scanProgress={state.scanProgress} lang={lang} />
          <NeuralPanel state={state} lang={lang} />
        </div>

        <ActionPanel lang={lang} showJournal={showJournal} setShowJournal={setShowJournal} latestEntry={latestEntry} />
      </main>

      <MicButton isListening={state.isListening} isAnalyzing={state.isAnalyzing} isComplete={state.isComplete} onStart={startListening} onStop={stopListening} onReset={reset} lang={lang} signalQuality={state.signalQuality || state.scanProgress} habitat={state.environmentalScan || "TRACE"} />
      <Footer lang={lang} />
    </div>
  );
}
