import { useEffect, useMemo, useRef, useState } from "react";
import type { AudioFeatures } from "../data/animals";

type SensorScreensProps = {
  active: boolean;
  audioFeatures: AudioFeatures | null;
  progress: number;
  detectedLabel?: string | null;
};

const CYAN = "#00d4ff";
const VIOLET = "#9b59ff";
const GREEN = "#00ff88";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function metric(value: number | undefined, fallback = 0) {
  return Number.isFinite(value ?? NaN) ? Number(value) : fallback;
}

function MiniHeader({ label, status, accent = CYAN }: { label: string; status: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span className="text-[9px] font-mono tracking-[0.28em] uppercase truncate" style={{ color: accent }}>{label}</span>
      </div>
      <span className="text-[8px] font-mono tracking-[0.18em] uppercase" style={{ color: status === "LIVE" || status === "CAM" || status === "TRACK" ? GREEN : "#ffffff3d" }}>{status}</span>
    </div>
  );
}

function SpectrumBars({ features, active, progress }: { features: AudioFeatures | null; active: boolean; progress: number }) {
  const bars = useMemo(() => {
    const rms = metric(features?.rms, 0) * 180;
    const centroid = metric(features?.spectralCentroid, 900) / 95;
    const flat = metric(features?.flatness, 0.14) * 70;
    const seed = active ? Date.now() / 290 : 12;

    return Array.from({ length: 24 }, (_, i) => {
      const wave = Math.sin(seed + i * 0.72) * 18;
      const comb = Math.cos(seed * 0.7 + i * 0.33) * 11;
      const base = active ? progress * 0.28 + rms + centroid + flat : 8;
      return clamp(base + wave + comb + (i % 5) * 3, 4, 96);
    });
  }, [features, active, progress]);

  return (
    <div className="h-20 rounded border border-cyan-400/15 bg-cyan-400/[0.025] px-2 py-2 overflow-hidden">
      <div className="flex h-full items-end gap-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-150"
            style={{
              height: `${h}%`,
              background: i % 4 === 0 ? `linear-gradient(180deg, ${GREEN}, ${CYAN}55)` : `linear-gradient(180deg, ${CYAN}, ${VIOLET}55)`,
              opacity: active ? 0.72 : 0.28,
              boxShadow: active && i % 6 === 0 ? `0 0 8px ${CYAN}66` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, value, color = CYAN }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[8px] font-mono tracking-[0.14em] uppercase">
      <span className="text-slate-500">{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

function StickFigure({ index, active, stability }: { index: number; active: boolean; stability: number }) {
  const opacity = active ? clamp(0.18 + stability / 130 + index * 0.08, 0.18, 0.92) : 0.12;
  const dx = index === 0 ? 0 : index === 1 ? -18 : 18;
  const scale = index === 0 ? 1 : 0.78;
  const color = index === 0 ? GREEN : index === 1 ? CYAN : VIOLET;

  return (
    <g transform={`translate(${dx} ${index === 0 ? 0 : 5}) scale(${scale})`} opacity={opacity}>
      <circle cx="50" cy="22" r="5" stroke={color} strokeWidth="2" fill="none" />
      <path d="M50 28 L50 48" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 35 L38 43" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 35 L62 42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 48 L41 64" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 48 L60 64" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="43" r="1.8" fill={color} />
      <circle cx="62" cy="42" r="1.8" fill={color} />
      <circle cx="41" cy="64" r="1.8" fill={color} />
      <circle cx="60" cy="64" r="1.8" fill={color} />
    </g>
  );
}

function useSlsCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "denied">("idle");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  };

  const startCamera = async () => {
    if (streamRef.current || status === "loading") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("denied");
      return;
    }

    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  };

  useEffect(() => stopCamera, []);

  return { videoRef, status, startCamera, stopCamera };
}

function SlsScreen({ active, features, progress }: { active: boolean; features: AudioFeatures | null; progress: number }) {
  const { videoRef, status, startCamera, stopCamera } = useSlsCamera();
  const formLock = clamp(progress * 0.62 + metric(features?.periodicity, 0.2) * 32 + metric(features?.rms, 0) * 120, 4, 96);
  const stability = clamp(100 - metric(features?.flatness, 0.2) * 110 + progress * 0.08, 8, 92);
  const hasExtra = active && formLock > 48;
  const showMain = active || progress > 20 || status === "ready";

  return (
    <div className="relative aspect-square rounded border border-purple-400/15 bg-purple-400/[0.025] overflow-hidden">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: status === "ready" ? 0.46 : 0, filter: "grayscale(1) contrast(1.35) brightness(0.72) hue-rotate(205deg)" }}
      />
      <div className="absolute inset-0" style={{ background: status === "ready" ? "linear-gradient(180deg, rgba(1,4,12,0.20), rgba(1,4,12,0.52))" : "radial-gradient(circle at 50% 40%, rgba(155,89,255,0.16), transparent 42%)" }} />
      <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(155,89,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.12) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.36) 3px, rgba(0,0,0,0.36) 5px)" }} />
      <div className="absolute left-2 top-2 text-[8px] font-mono tracking-[0.22em] text-purple-300/70 uppercase">SLS CAMERA LAYER</div>

      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
          <button
            onClick={startCamera}
            className="rounded border px-3 py-2 text-[9px] font-mono uppercase tracking-[0.18em]"
            style={{ borderColor: "#9b59ff55", color: "#cbb7ff", background: "rgba(155,89,255,0.10)", boxShadow: "0 0 14px #9b59ff22" }}
          >
            {status === "loading" ? "Ouverture caméra..." : "Activer caméra SLS"}
          </button>
          {status === "denied" && <div className="text-[8px] font-mono text-cyan-300/60 uppercase tracking-[0.12em]">Caméra refusée / indisponible</div>}
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.12em]">Overlay disponible sans IA de pose</div>
        </div>
      )}

      {status === "ready" && (
        <button
          onClick={stopCamera}
          className="absolute right-2 top-2 rounded border px-2 py-1 text-[7px] font-mono uppercase tracking-[0.16em]"
          style={{ borderColor: "#00d4ff33", color: "#9eefff", background: "rgba(0,0,0,0.35)" }}
        >
          cam off
        </button>
      )}

      <svg viewBox="0 0 100 86" className="absolute inset-0 w-full h-full" style={{ filter: showMain ? "drop-shadow(0 0 8px rgba(155,89,255,0.45))" : "none", opacity: status === "ready" || showMain ? 1 : 0.28 }}>
        <StickFigure index={0} active={showMain} stability={formLock} />
        {hasExtra && <StickFigure index={1} active={active} stability={stability * 0.7} />}
        {formLock > 70 && <StickFigure index={2} active={active} stability={stability * 0.52} />}
      </svg>

      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-2 gap-2">
        <MetricRow label="FORM" value={`${Math.round(formLock)}%`} color={VIOLET} />
        <MetricRow label="JOINT" value={stability > 55 ? "PARTIAL" : "UNSTABLE"} color={stability > 55 ? GREEN : CYAN} />
      </div>
    </div>
  );
}

export function SensorScreens({ active, audioFeatures, progress, detectedLabel }: SensorScreensProps) {
  const dominant = metric(audioFeatures?.dominantFreq, 0);
  const centroid = metric(audioFeatures?.spectralCentroid, 0);
  const rms = clamp(metric(audioFeatures?.rms, 0) * 240, 0, 99);
  const envMode = active || progress > 10 ? (centroid > 1800 ? "RÉSONANT" : "MIXTE") : "VEILLE";
  const air = clamp(metric(audioFeatures?.flatness, 0.1) * 100, 2, 96);
  const low = clamp(metric(audioFeatures?.lowEnergyRatio, 0.3) * 100, 2, 96);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="rounded border p-3 backdrop-blur-sm" style={{ borderColor: "#00d4ff2f", background: "rgba(2,8,20,0.72)", boxShadow: "inset 0 0 18px #00d4ff08" }}>
        <MiniHeader label="FREQ / SPECTRUM" status={active ? "LIVE" : "IDLE"} accent={CYAN} />
        <SpectrumBars features={audioFeatures} active={active} progress={progress} />
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <MetricRow label="FREQ" value={dominant ? `${Math.round(dominant)} Hz` : "---"} color={CYAN} />
          <MetricRow label="RMS" value={`${Math.round(rms)}%`} color={GREEN} />
          <MetricRow label="CENT" value={centroid ? `${Math.round(centroid)} Hz` : "---"} color={VIOLET} />
          <MetricRow label="TRACE" value={detectedLabel ? "LOCK" : "SCAN"} color={detectedLabel ? GREEN : CYAN} />
        </div>
      </div>

      <div className="rounded border p-3 backdrop-blur-sm" style={{ borderColor: "#00ff8830", background: "rgba(2,8,20,0.72)", boxShadow: "inset 0 0 18px #00ff8808" }}>
        <MiniHeader label="ENV SCAN" status={envMode} accent={GREEN} />
        <div className="space-y-2 mt-3">
          <MetricRow label="PIÈCE" value={envMode} color={GREEN} />
          <MetricRow label="SURFACE" value={low > 50 ? "ACTIVE" : "FAIBLE"} color={low > 50 ? VIOLET : CYAN} />
          <MetricRow label="AIR" value={`${Math.round(air)}%`} color={CYAN} />
          <MetricRow label="COURANT" value={active ? "SUSPECT" : "CALME"} color={active ? VIOLET : GREEN} />
        </div>
        <div className="mt-3 h-12 rounded border border-green-400/10 bg-green-400/[0.025] flex items-center justify-center overflow-hidden">
          <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${GREEN}66, ${CYAN}55, ${VIOLET}55, transparent)`, boxShadow: `0 0 12px ${GREEN}33`, transform: `translateY(${active ? Math.sin(Date.now() / 500) * 8 : 0}px)` }} />
        </div>
      </div>

      <div className="rounded border p-3 backdrop-blur-sm" style={{ borderColor: "#9b59ff30", background: "rgba(2,8,20,0.72)", boxShadow: "inset 0 0 18px #9b59ff08" }}>
        <MiniHeader label="SLS / FORM" status={active ? "TRACK" : "IDLE"} accent={VIOLET} />
        <SlsScreen active={active} features={audioFeatures} progress={progress} />
      </div>
    </section>
  );
}
