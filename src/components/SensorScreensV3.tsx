import { useEffect, useMemo, useRef, useState } from "react";
import type { AudioFeatures } from "../data/animals";

type SensorScreensV3Props = {
  active: boolean;
  audioFeatures: AudioFeatures | null;
  progress: number;
  detectedLabel?: string | null;
  compact?: boolean;
  radarOnly?: boolean;
};

type CameraStatus = "idle" | "loading" | "ready" | "denied";

type PhoneSensors = {
  motion: number;
  tilt: number;
  rotation: number;
  available: boolean;
  permission: "idle" | "granted" | "denied" | "unsupported";
};

const CYAN = "#7ee8ff";
const VIOLET = "#9b59ff";
const GHOST = "#c7fff0";
const DIM = "#7d8aa8";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function n(value: number | undefined, fallback = 0) {
  return Number.isFinite(value ?? NaN) ? Number(value) : fallback;
}

function MiniHeader({ label, status }: { label: string; status: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 8px ${CYAN}` }} />
        <span className="truncate text-[8px] font-mono uppercase tracking-[0.24em]" style={{ color: CYAN }}>{label}</span>
      </div>
      <span className="text-[7px] font-mono uppercase tracking-[0.18em]" style={{ color: status === "LIVE" || status === "CAM" ? GHOST : "#ffffff40" }}>{status}</span>
    </div>
  );
}

function MetricRow({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[7px] font-mono uppercase tracking-[0.12em]">
      <span className="truncate" style={{ color: DIM }}>{label}</span>
      <span className="truncate" style={{ color: hot ? GHOST : CYAN }}>{value}</span>
    </div>
  );
}

function Panel({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className={`rounded border backdrop-blur-sm ${compact ? "p-2" : "p-2.5"}`}
      style={{
        borderColor: "rgba(155,89,255,0.28)",
        background: "linear-gradient(180deg, rgba(3,7,18,0.82), rgba(4,10,25,0.72))",
        boxShadow: "inset 0 0 18px rgba(155,89,255,0.08), 0 0 14px rgba(0,212,255,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function usePhoneSensors(active: boolean): PhoneSensors {
  const [sensors, setSensors] = useState<PhoneSensors>({ motion: 0, tilt: 0, rotation: 0, available: false, permission: "idle" });

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    let lastMotion = 0;
    let lastTilt = 0;
    let lastRotation = 0;

    const apply = () => {
      if (!mounted) return;
      setSensors(prev => ({
        motion: clamp(prev.motion * 0.72 + lastMotion * 0.28),
        tilt: clamp(prev.tilt * 0.76 + lastTilt * 0.24),
        rotation: clamp(prev.rotation * 0.76 + lastRotation * 0.24),
        available: true,
        permission: "granted",
      }));
    };

    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      const rot = event.rotationRate;
      const accel = Math.sqrt(Math.pow(acc?.x || 0, 2) + Math.pow(acc?.y || 0, 2) + Math.pow(acc?.z || 0, 2));
      const rotation = Math.abs(rot?.alpha || 0) + Math.abs(rot?.beta || 0) + Math.abs(rot?.gamma || 0);
      lastMotion = clamp(Math.abs(accel - 9.8) * 18, 0, 100);
      lastRotation = clamp(rotation / 5, 0, 100);
      apply();
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      lastTilt = clamp((Math.abs(event.beta || 0) + Math.abs(event.gamma || 0)) / 1.8, 0, 100);
      apply();
    };

    const start = async () => {
      try {
        const motionPermission = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<PermissionState> }).requestPermission;
        if (typeof motionPermission === "function") {
          const result = await motionPermission();
          if (result !== "granted") {
            setSensors(prev => ({ ...prev, permission: "denied" }));
            return;
          }
        }
        window.addEventListener("devicemotion", onMotion);
        window.addEventListener("deviceorientation", onOrientation);
        setSensors(prev => ({ ...prev, available: true, permission: "granted" }));
      } catch {
        setSensors(prev => ({ ...prev, permission: "unsupported" }));
      }
    };

    void start();
    const id = window.setInterval(() => {
      setSensors(prev => ({ ...prev, motion: clamp(prev.motion * 0.86), rotation: clamp(prev.rotation * 0.9) }));
    }, 450);

    return () => {
      mounted = false;
      window.clearInterval(id);
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [active]);

  return sensors;
}

function SpectralRadar({ active, features, progress, sensors, compact = false }: { active: boolean; features: AudioFeatures | null; progress: number; sensors: PhoneSensors; compact?: boolean }) {
  const intensity = clamp(progress * 0.45 + n(features?.rms) * 450 + sensors.motion * 0.35 + sensors.rotation * 0.18, 4, 98);
  const blips = useMemo(() => {
    const seed = Math.floor(progress / 8) + Math.round(n(features?.spectralCentroid) / 400);
    return Array.from({ length: compact ? 4 : 7 }, (_, i) => {
      const angle = ((seed * 37 + i * 53) % 360) * Math.PI / 180;
      const radius = 18 + ((seed * 19 + i * 23) % 54);
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        opacity: active ? 0.12 + ((i + seed) % 5) * 0.14 : 0.12,
        size: 1.2 + ((i + seed) % 3) * 0.75,
      };
    });
  }, [features, progress, active, compact]);
  const sweep = active ? (progress * 4.2 + Date.now() / 45) % 360 : 35;

  return (
    <div className={`relative overflow-hidden rounded border border-cyan-200/10 bg-cyan-200/[0.015] ${compact ? "h-28 sm:h-32" : "h-40"}`}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(126,232,255,0.11), transparent 58%)" }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[38, 27, 16].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={CYAN} strokeWidth="0.35" opacity="0.24" />)}
        <path d="M50 12 V88 M12 50 H88" stroke={CYAN} strokeWidth="0.25" opacity="0.18" />
        <g transform={`rotate(${sweep} 50 50)`}>
          <path d="M50 50 L50 12 A38 38 0 0 1 66 15 Z" fill={CYAN} opacity={active ? 0.16 : 0.05} />
          <path d="M50 50 L50 12" stroke={GHOST} strokeWidth="0.9" opacity={active ? 0.72 : 0.18} style={{ filter: `drop-shadow(0 0 5px ${GHOST})` }} />
        </g>
        {blips.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.size} fill={i % 3 === 0 ? VIOLET : GHOST} opacity={b.opacity} />)}
        <circle cx="50" cy="50" r="2" fill={GHOST} opacity="0.55" />
      </svg>
      <div className="absolute left-2 top-2 text-[7px] font-mono uppercase tracking-[0.18em]" style={{ color: CYAN }}>radar</div>
      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-2 gap-x-3 gap-y-1">
        <MetricRow label="Rem" value={`${Math.round(intensity)}%`} hot={intensity > 45} />
        <MetricRow label="Mic" value={`${Math.round(clamp(n(features?.rms) * 420))}%`} />
        <MetricRow label="Trace" value={active ? "SWEEP" : "IDLE"} />
      </div>
    </div>
  );
}

function useSlsCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [motionLock, setMotionLock] = useState(0);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    previousFrameRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setMotionLock(0);
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
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 20 } },
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

  useEffect(() => {
    if (status !== "ready") return;
    const id = window.setInterval(() => {
      const video = videoRef.current;
      const sourceCanvas = sourceCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!video || !sourceCanvas || !overlayCanvas || video.readyState < 2) return;
      const w = 64;
      const h = 48;
      sourceCanvas.width = w;
      sourceCanvas.height = h;
      overlayCanvas.width = w;
      overlayCanvas.height = h;
      const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      const overlayCtx = overlayCanvas.getContext("2d");
      if (!sourceCtx || !overlayCtx) return;
      sourceCtx.drawImage(video, 0, 0, w, h);
      const frame = sourceCtx.getImageData(0, 0, w, h);
      const previous = previousFrameRef.current;
      const out = overlayCtx.createImageData(w, h);
      let activePixels = 0;

      for (let i = 0; i < frame.data.length; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];
        const lum = (r + g + b) / 3;
        const prevLum = previous ? (previous[i] + previous[i + 1] + previous[i + 2]) / 3 : lum;
        const motion = Math.abs(lum - prevLum);
        const hit = motion > 16 || (lum > 45 && lum < 210 && Math.abs(r - b) > 8);
        if (hit) {
          activePixels += 1;
          out.data[i] = 126;
          out.data[i + 1] = 232;
          out.data[i + 2] = 255;
          out.data[i + 3] = Math.min(230, 80 + motion * 5);
        } else {
          out.data[i + 3] = 0;
        }
      }

      overlayCtx.clearRect(0, 0, w, h);
      overlayCtx.putImageData(out, 0, 0);
      previousFrameRef.current = new Uint8ClampedArray(frame.data);
      setMotionLock(clamp((activePixels / (w * h)) * 420, 0, 100));
    }, 120);
    return () => window.clearInterval(id);
  }, [status]);

  return { videoRef, sourceCanvasRef, overlayCanvasRef, status, startCamera, stopCamera, motionLock };
}

function SlsCamera({ active, features, progress, sensors }: { active: boolean; features: AudioFeatures | null; progress: number; sensors: PhoneSensors }) {
  const { videoRef, sourceCanvasRef, overlayCanvasRef, status, startCamera, stopCamera, motionLock } = useSlsCamera();
  const lock = clamp(motionLock + progress * 0.08 + n(features?.rms) * 110 + sensors.motion * 0.16, 0, 100);
  const ready = status === "ready";

  return (
    <div className="relative aspect-video overflow-hidden rounded border border-purple-300/20 bg-black">
      <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" style={{ opacity: ready ? 0.7 : 0, filter: "grayscale(1) contrast(1.55) brightness(0.62) hue-rotate(190deg)" }} />
      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={overlayCanvasRef} className="absolute inset-0 h-full w-full object-cover mix-blend-screen" style={{ opacity: ready ? 0.95 : 0, imageRendering: "pixelated", filter: "drop-shadow(0 0 10px rgba(126,232,255,0.7))" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(1,4,12,0.08), rgba(1,4,12,0.56))" }} />
      <div className="absolute inset-0 pointer-events-none opacity-25" style={{ backgroundImage: "linear-gradient(rgba(126,232,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(155,89,255,0.10) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="absolute left-2 top-2 text-[7px] font-mono uppercase tracking-[0.18em]" style={{ color: CYAN }}>SLS caméra / contour réel</div>

      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-3 text-center">
          <button type="button" onClick={startCamera} className="rounded border px-3 py-2 text-[9px] font-mono uppercase tracking-[0.16em]" style={{ borderColor: "rgba(199,255,240,0.42)", color: GHOST, background: "rgba(126,232,255,0.08)", boxShadow: "0 0 16px rgba(126,232,255,0.18)" }}>
            {status === "loading" ? "Ouverture caméra..." : "Activer caméra SLS"}
          </button>
          {status === "denied" && <div className="text-[8px] font-mono uppercase tracking-[0.10em]" style={{ color: CYAN }}>caméra refusée / indisponible</div>}
          <div className="text-[7px] font-mono uppercase tracking-[0.12em] text-slate-500">analyse par mouvement/luminance, pas de silhouette fake</div>
        </div>
      )}

      {ready && <button type="button" onClick={stopCamera} className="absolute right-2 top-2 z-20 rounded border px-2 py-1 text-[7px] font-mono uppercase tracking-[0.14em]" style={{ borderColor: "rgba(126,232,255,0.25)", color: CYAN, background: "rgba(0,0,0,0.35)" }}>cam off</button>}
      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-2 pointer-events-none">
        <MetricRow label="Lock" value={`${Math.round(lock)}%`} hot={lock > 22} />
        <MetricRow label="Motion" value={`${Math.round(motionLock)}%`} hot={motionLock > 14} />
        <MetricRow label="Mode" value={ready ? "CAM" : active ? "WAIT" : "IDLE"} hot={ready} />
      </div>
    </div>
  );
}

function RealSensorGrid({ sensors, features, active, compact = false }: { sensors: PhoneSensors; features: AudioFeatures | null; active: boolean; compact?: boolean }) {
  const mic = clamp(n(features?.rms) * 420, 0, 100);
  const flat = clamp(n(features?.flatness, 0.1) * 100, 0, 100);
  const centroid = n(features?.spectralCentroid, 0);
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
      {compact ? (
        <>
          <MetricRow label="Mic" value={`${Math.round(mic)}%`} hot={mic > 18} />
          <MetricRow label="Move" value={sensors.permission === "denied" ? "REFUS" : `${Math.round(sensors.motion)}%`} hot={sensors.motion > 18} />
          <MetricRow label="State" value={active ? "LIVE" : "VEILLE"} hot={active} />
        </>
      ) : (
        <>
          <MetricRow label="Mic RMS" value={`${Math.round(mic)}%`} hot={mic > 18} />
          <MetricRow label="Noise" value={`${Math.round(flat)}%`} hot={flat > 35} />
          <MetricRow label="Motion" value={sensors.permission === "denied" ? "REFUS" : `${Math.round(sensors.motion)}%`} hot={sensors.motion > 18} />
          <MetricRow label="Gyro" value={sensors.permission === "unsupported" ? "---" : `${Math.round(sensors.rotation)}%`} hot={sensors.rotation > 18} />
          <MetricRow label="Tilt" value={`${Math.round(sensors.tilt)}%`} />
          <MetricRow label="Cent" value={centroid ? `${Math.round(centroid)} Hz` : "---"} />
          <MetricRow label="State" value={active ? "LIVE" : "VEILLE"} hot={active} />
          <MetricRow label="Src" value={sensors.available ? "PHONE" : "AUDIO"} />
        </>
      )}
    </div>
  );
}

export function SensorScreensV3({ active, audioFeatures, progress, detectedLabel, compact = false, radarOnly = false }: SensorScreensV3Props) {
  const sensors = usePhoneSensors(active);
  const [visionOpen, setVisionOpen] = useState(false);
  const centroid = n(audioFeatures?.spectralCentroid, 0);
  const envMode = active || progress > 10 ? (centroid > 1800 ? "RÉSONANT" : "MIXTE") : "VEILLE";

  return (
    <>
      <section className={radarOnly ? "grid grid-cols-1 gap-2" : compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2"}>
        <Panel compact={compact}>
          <MiniHeader label="RADAR SPECTRAL" status={active ? "LIVE" : "IDLE"} />
          <SpectralRadar active={active} features={audioFeatures} progress={progress} sensors={sensors} compact={compact} />
          {radarOnly && (
            <button type="button" onClick={() => setVisionOpen(true)} className="mt-2 w-full rounded border px-2 py-1.5 text-[8px] font-mono uppercase tracking-[0.18em]" style={{ borderColor: "rgba(155,89,255,0.38)", color: GHOST, background: "rgba(155,89,255,0.08)" }}>
              ouvrir fenêtre SLS caméra
            </button>
          )}
        </Panel>

        {!radarOnly && (
          <Panel compact={compact}>
            <MiniHeader label={compact ? "CAPTEURS" : "CAPTEURS TÉLÉPHONE"} status={envMode} />
            <RealSensorGrid sensors={sensors} features={audioFeatures} active={active} compact={compact} />
            <div className="mt-2 flex items-center justify-between gap-2 text-[7px] font-mono uppercase tracking-[0.14em]" style={{ color: DIM }}>
              {!compact && <span className="truncate">{detectedLabel ? `trace: ${detectedLabel}` : "trace: acquisition faible / attente"}</span>}
              <button type="button" onClick={() => setVisionOpen(true)} className="shrink-0 rounded border px-2 py-1 tracking-[0.16em]" style={{ borderColor: "rgba(155,89,255,0.36)", color: GHOST, background: "rgba(155,89,255,0.08)" }}>vision SLS</button>
            </div>
          </Panel>
        )}
      </section>

      {visionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-3 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded border p-3" style={{ borderColor: "rgba(155,89,255,0.42)", background: "linear-gradient(180deg, rgba(3,7,18,0.98), rgba(7,5,22,0.96))", boxShadow: "0 0 36px rgba(155,89,255,0.20)" }}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.32em]" style={{ color: VIOLET }}>Fenêtre SLS caméra</div>
                <div className="text-[8px] font-mono uppercase tracking-[0.12em] text-slate-500">contours/mouvement calculés depuis la caméra</div>
              </div>
              <button type="button" onClick={() => setVisionOpen(false)} className="rounded border px-2 py-1 text-[8px] font-mono uppercase tracking-[0.16em]" style={{ borderColor: "rgba(126,232,255,0.24)", color: CYAN }}>fermer</button>
            </div>
            <SlsCamera active={active} features={audioFeatures} progress={progress} sensors={sensors} />
          </div>
        </div>
      )}
    </>
  );
}
