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
  fr: { title: "Captation", mic: "Micro", noise: "Fond", spectrum: "Spectre", motion: "Mouvement", archive: "Archives", octopus: "Octopus", fingerprint: "Empreinte", capture: "Capture", compare: "Comparaison", transmit: "Transmission", recorded: "Archivée" },
  en: { title: "Capture", mic: "Microphone", noise: "Noise", spectrum: "Spectrum", motion: "Motion", archive: "Archive", octopus: "Octopus", fingerprint: "Fingerprint", capture: "Capture", compare: "Compare", transmit: "Transmit", recorded: "Recorded" },
  es: { title: "Captura", mic: "Micrófono", noise: "Fondo", spectrum: "Espectro", motion: "Movimiento", archive: "Archivo", octopus: "Octopus", fingerprint: "Huella", capture: "Captura", compare: "Comparación", transmit: "Transmisión", recorded: "Archivada" },
} satisfies Record<Lang, Record<string, string>>;

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
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
  return Array.from({ length: 16 }, (_, index) => {
    const source = values[index % values.length] || index * 7;
    return 18 + Math.abs(Math.sin(source * 0.017 + index * 1.73)) * 64;
  });
}

export function CaptureWitnessPanel({ lang, active, complete, progress, micPermission, motionLevel, audioFeatures, latestEntry }: Props) {
  const copy = COPY[lang];
  const mic = micPermission === "denied" ? 0 : clamp((audioFeatures?.rms ?? 0) * 14);
  const noise = clamp((audioFeatures?.flatness ?? 0) * 1.25);
  const spectrum = clamp((audioFeatures?.spectralCentroid ?? 0) / 6000);
  const recurrence = latestEntry?.enrichment?.recurrenceCount ?? 0;
  const bars = fingerprint(latestEntry, audioFeatures);
  const stages = [
    { label: copy.capture, done: active || complete },
    { label: copy.spectrum, done: progress >= 35 || complete },
    { label: copy.compare, done: progress >= 68 || complete },
    { label: copy.transmit, done: complete },
    { label: copy.recorded, done: complete },
  ];

  const sensors = [
    [copy.mic, micPermission === "denied" ? "OFF" : `${Math.round(mic * 100)}%`, mic],
    [copy.noise, `${Math.round(noise * 100)}%`, noise],
    [copy.spectrum, audioFeatures?.dominantFreq ? `${Math.round(audioFeatures.dominantFreq)} Hz` : "—", spectrum],
    [copy.motion, `${Math.round(motionLevel * 100)}%`, motionLevel],
    [copy.archive, latestEntry?.enrichment ? `${recurrence}×` : "—", clamp((recurrence + 1) / 8)],
    [copy.octopus, complete ? "REC" : active && progress > 82 ? "TX" : "—", complete ? 1 : active && progress > 82 ? 0.65 : 0],
  ] as const;

  return (
    <section className="rounded-xl border border-cyan-300/18 bg-slate-950/62 px-3 py-2 shadow-[0_0_18px_rgba(0,212,255,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0 text-[8px] font-mono uppercase tracking-[0.22em] text-cyan-200/65">● {copy.title}</div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden text-[7px] font-mono uppercase tracking-[0.08em]">
          {stages.map((stage, index) => (
            <span key={stage.label} className={`flex min-w-0 items-center gap-1 ${stage.done ? "text-cyan-100/70" : "text-white/22"}`}>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.done ? "bg-emerald-300" : active && index === stages.findIndex(item => !item.done) ? "animate-pulse bg-cyan-300" : "bg-white/15"}`} />
              <span className="hidden truncate sm:inline">{stage.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[7px] font-mono uppercase tracking-[0.08em] text-white/42 sm:grid-cols-6">
        {sensors.map(([label, readout, value]) => (
          <div key={label} className="min-w-0">
            <div className="flex items-center justify-between gap-1"><span className="truncate">{label}</span><span className="shrink-0 text-cyan-100/75">{readout}</span></div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-cyan-300/70 transition-all duration-200" style={{ width: `${Math.round(clamp(Number(value)) * 100)}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-white/7 pt-2">
        <span className="shrink-0 text-[7px] font-mono uppercase tracking-[0.16em] text-purple-200/55">{copy.fingerprint}</span>
        <div className="flex h-5 min-w-0 flex-1 items-end gap-0.5 overflow-hidden" aria-label={copy.fingerprint}>
          {bars.map((height, index) => <span key={index} className="min-w-0 flex-1 rounded-t-sm bg-cyan-300/45" style={{ height: `${height}%`, opacity: 0.35 + (index % 5) * 0.1 }} />)}
        </div>
      </div>
    </section>
  );
}
