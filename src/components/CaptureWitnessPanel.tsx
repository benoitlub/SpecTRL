import type { AudioFeatures, Lang } from "../data/animals";
import type { SpectralJournalEntry } from "../utils/spectralJournal";

type Props = {
  lang: Lang;
  active: boolean;
  complete: boolean;
  progress: number;
  micPermission: string;
  motionLevel: number;
  audioFeatures: AudioFeatures | null | undefined;
  latestEntry: SpectralJournalEntry | null;
};

const COPY = {
  fr: { title: "Témoins de captation", mic: "Micro", noise: "Fond", spectrum: "Spectre", motion: "Mouvement", archive: "Archives", octopus: "Octopus", fingerprint: "Empreinte spectrale", waiting: "En attente", capture: "Capture", compare: "Comparaison", transmit: "Transmission", recorded: "Enregistrée" },
  en: { title: "Capture witnesses", mic: "Microphone", noise: "Noise floor", spectrum: "Spectrum", motion: "Motion", archive: "Archive", octopus: "Octopus", fingerprint: "Spectral fingerprint", waiting: "Waiting", capture: "Capture", compare: "Comparison", transmit: "Transmission", recorded: "Recorded" },
  es: { title: "Testigos de captura", mic: "Micrófono", noise: "Fondo", spectrum: "Espectro", motion: "Movimiento", archive: "Archivo", octopus: "Octopus", fingerprint: "Huella espectral", waiting: "En espera", capture: "Captura", compare: "Comparación", transmit: "Transmisión", recorded: "Registrada" },
} satisfies Record<Lang, Record<string, string>>;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function meter(value: number) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full bg-cyan-300/80 transition-all duration-200" style={{ width: `${Math.round(clamp(value) * 100)}%` }} />
    </div>
  );
}

function fingerprint(entry: SpectralJournalEntry | null, features: AudioFeatures | null | undefined) {
  const values = [
    entry?.metrics.dominantFreq ?? features?.dominantFreq ?? 0,
    entry?.metrics.spectralCentroid ?? features?.spectralCentroid ?? 0,
    entry?.metrics.rms ?? ((features?.rms ?? 0) * 100),
    entry?.metrics.resonance ?? 0,
    entry?.metrics.clarity ?? 0,
    (features?.flatness ?? 0) * 100,
  ];
  return Array.from({ length: 18 }, (_, index) => {
    const source = values[index % values.length] || index * 7;
    return 14 + Math.abs(Math.sin(source * 0.017 + index * 1.73)) * 72;
  });
}

export function CaptureWitnessPanel({ lang, active, complete, progress, micPermission, motionLevel, audioFeatures, latestEntry }: Props) {
  const copy = COPY[lang];
  const mic = clamp((audioFeatures?.rms ?? 0) * 14);
  const noise = clamp((audioFeatures?.flatness ?? 0) * 1.25);
  const spectrum = clamp((audioFeatures?.spectralCentroid ?? 0) / 6000);
  const archive = latestEntry?.enrichment?.recurrenceCount ? clamp((latestEntry.enrichment.recurrenceCount + 1) / 8) : complete ? 0.2 : 0;
  const octopus = complete ? 1 : active && progress > 82 ? 0.65 : 0;
  const bars = fingerprint(latestEntry, audioFeatures);
  const stages = [
    { label: copy.capture, done: active || complete },
    { label: copy.spectrum, done: progress >= 35 || complete },
    { label: copy.compare, done: progress >= 68 || complete },
    { label: copy.transmit, done: complete },
    { label: copy.recorded, done: complete },
  ];

  return (
    <section className="rounded-xl border border-cyan-300/20 bg-slate-950/72 p-3 shadow-[0_0_24px_rgba(0,212,255,0.07)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.25em] text-cyan-200/75">● {copy.title}</h2>
        <span className="text-[8px] font-mono uppercase tracking-[0.16em] text-white/35">{active ? "LIVE" : complete ? "LOCK" : "IDLE"}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[8px] font-mono uppercase tracking-[0.12em] text-white/48 sm:grid-cols-3">
        {[
          [copy.mic, micPermission === "denied" ? 0 : mic, micPermission === "denied" ? "OFF" : `${Math.round(mic * 100)}%`],
          [copy.noise, noise, `${Math.round(noise * 100)}%`],
          [copy.spectrum, spectrum, audioFeatures?.dominantFreq ? `${Math.round(audioFeatures.dominantFreq)} Hz` : "—"],
          [copy.motion, motionLevel, `${Math.round(motionLevel * 100)}%`],
          [copy.archive, archive, latestEntry?.enrichment ? `${latestEntry.enrichment.recurrenceCount}×` : "—"],
          [copy.octopus, octopus, complete ? "REC" : active && progress > 82 ? "TX" : "—"],
        ].map(([label, value, readout]) => (
          <div key={String(label)} className="space-y-1">
            <div className="flex justify-between gap-2"><span>{label}</span><span className="text-cyan-100/80">{readout}</span></div>
            {meter(Number(value))}
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-white/8 pt-3">
        <div className="mb-2 text-[8px] font-mono uppercase tracking-[0.22em] text-purple-200/65">{copy.fingerprint}</div>
        <div className="flex h-12 items-end gap-1 rounded-lg border border-purple-300/15 bg-purple-400/5 px-2 py-2" aria-label={copy.fingerprint}>
          {bars.map((height, index) => (
            <span key={index} className="min-w-0 flex-1 rounded-t-sm bg-cyan-300/55 transition-all duration-300" style={{ height: `${height}%`, opacity: 0.35 + (index % 5) * 0.11 }} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1 overflow-hidden text-[7px] font-mono uppercase tracking-[0.10em]">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex min-w-0 flex-1 items-center gap-1">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.done ? "bg-emerald-300 shadow-[0_0_7px_rgba(110,231,183,0.8)]" : active && index === stages.findIndex(item => !item.done) ? "animate-pulse bg-cyan-300" : "bg-white/15"}`} />
            <span className={stage.done ? "truncate text-cyan-100/75" : "truncate text-white/25"}>{stage.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
