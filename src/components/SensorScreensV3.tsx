import { useEffect, useMemo, useRef, useState } from "react";
import type { AudioFeatures } from "../data/animals";

type SensorScreensV3Props = {
  active: boolean;
  audioFeatures: AudioFeatures | null;
  progress: number;
  detectedLabel?: string | null;
};

type CameraStatus = "idle" | "loading" | "ready" | "denied";

type PhoneSensors = {
  motion: number;
  tilt: number;
  rotation: number;
  luminance: number;
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
      <span className="text-[7px] font-mono uppercase tracking-[0.18em]" style={{ color: status === "LIVE" || status === "TRACK" || status === "CAM" ? GHOST : "#ffffff40" }}>{status}</span>
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

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded border p-2.5 backdrop-blur-sm ${className}`}
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
  const [sensors, setSensors] = useState<PhoneSensors>({
    motion: 0,
    tilt: 0,
    rotation: 0,
    luminance: 0,
    available: false,
    permission: "idle",
  });

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    let lastMotion = 0;
    let lastTilt = 0;
    let lastRotation = 0;

    const apply = () => {
      if (!mounted) return;
      setSensors(prev => ({
        motion: clamp(prev.motion * 0.7 + lastMotion * 0.3),
        tilt: clamp(prev.tilt * 0.75 + lastTilt * 0.25),
        rotation: clamp(prev.rotation * 0.75 + lastRotation * 0.25),
        luminance: prev.luminance,
        available: true,
        permission: "granted",
      }));
    };

    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      const rot = event.rotationRate;
      const accel = Math.sqrt(
        Math.pow(acc?.x || 0, 2) +
        Math.pow(acc?.y || 0, 2) +
        Math.pow(acc?.z || 0, 2)
      );
      const rotation = Math.abs(rot?.alpha || 0) + Math.abs(rot?.beta || 0) + Math.abs(rot?.gamma || 0);
      lastMotion = clamp(Math.abs(accel - 9.8) * 18, 0, 100);
      lastRotation = clamp(rotation / 5, 0, 100);
      apply();
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      const beta = Math.abs(event.beta || 0);
      const gamma = Math.abs(event.gamma || 0);
      lastTilt = clamp((beta + gamma) / 1.8, 0, 100);
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
      setSensors(prev => ({
        ...prev,
        motion: clamp(prev.motion * 0.86),
        rotation: clamp(prev.rotation * 0.9),
      }));
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

function SpectralRadar({ active, features, progress, sensors }: { active: boolean; features: AudioFeatures | null; progress: number; sensors: PhoneSensors }) {
  const intensity = clamp(progress * 0.45 + n(features?.rms) * 450 + sensors.motion * 0.35 + sensors.rotation * 0.18, 4, 98);
  const blips = useMemo(() => {
    const seed = Math.floor(progress / 8) + Math.round(n(features?.spectralCentroid) / 400);
    return Array.from({ length: 7 }, (_, i) => {
      const angle = ((seed * 37 + i * 53) % 360) * Math.PI / 180;
      const radius = 18 + ((seed * 19 + i * 23) % 54);
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        opacity: active ? 0.12 + ((i + seed) % 5) * 0.14 : 0.12,
        size: 1.2 + ((i + seed) % 3) * 0.75,
      };
    });
  }, [features, progress, active]);
  const sweep = active ? (progress * 4.2 + Date.now() / 45) % 360 : 35;

  return (
    <div className="relative h-40 overflow-hidden rounded border border-cyan-200/10 bg-cyan-200/[0.015]">
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(126,232,255,0.11), transparent 58%)" }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[38, 27, 16].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={CYAN} strokeWidth="0.35" opacity="0.24" />)}
        <path d="M50 12 V88 M12 50 H88" stroke={CYAN} strokeWidth="0.25" opacity="0.18" />
        <g transform={`rotate(${sweep} 50 50)`}>
          <path d="M50 50 L50 12 A38 38 0 0 1 66 15 Z" fill={CYAN} opacity={active ? 0.16 : 0.05} />
          <path d="M50 50 L50 12" stroke={GHOST} strokeWidth="0.9" opacity={active ? 0.72 : 0.18} style={{ filter: `drop-shadow(0 0 5px ${GHOST})` }} />
        </g>
        {blips.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.size} fill={i % 3 === 0 ? VIOLET : GHOST} opacity={b.opacity} style={{ filter: `drop-shadow(0 0 5px ${i % 3 === 0 ? VIOLET : GHOST})` }} />
        ))}
        <circle cx="50" cy="50" r="2" fill={GHOST} opacity="0.55" />
      </svg>
      <div className="absolute left-2 top-2 text-[7px] font-mono uppercase tracking-[0.18em]" style={{ color: CYAN }}>spectral radar</div>
      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-2 gap-x-3 gap-y-1">
        <MetricRow label="Rem" value={`${Math.round(intensity)}%`} hot={intensity > 45} />
        <MetricRow label="Mic" value={`${Math.round(clamp(n(features?.rms) * 420))}%`} />
        <MetricRow label="Motion" value={`${Math.round(sensors.motion)}%`} hot={sensors.motion > 20} />
        <MetricRow label="Trace" value={active ? "SWEEP" : "IDLE"} />
      </div>
    </div>
  );
}

function useSlsCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [luminance, setLuminance] = useState(0);

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
        video: { facingMode: { ideal: "environment" }, width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 20 } },
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
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = 24;
      canvas.height = 18;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      for (let i = 0; i < data.length; i += 4) total += (data[i] + data[i + 1] + data[i + 2]) / 3;
      setLuminance(clamp((total / (data.length / 4) / 255) * 100));
    }, 700);
    return () => window.clearInterval(id);
  }, [status]);

  return { videoRef, canvasRef, status, startCamera, stopCamera, luminance };
}

function TeslaLikeSilhouette({ visible, lock }: { visible: boolean; lock: number }) {
  const opacity = visible ? clamp(0.08 + lock / 135, 0.12, 0.62) : 0.07;
  const blur = visible ? "drop-shadow(0 0 12px rgba(199,255,240,0.46))" : "blur(0.5px)";
  return (
    <svg viewBox="0 0 120 160" className="absolute inset-0 mx-auto h-full w-auto pointer-events-none" style={{ opacity, filter: blur }} aria-hidden="true">
      <defs>
        <linearGradient id="spectrl-silhouette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#effff9" stopOpacity="0.62" />
          <stop offset="0.48" stopColor="#7ee8ff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#9b59ff" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="26" rx="13" ry="16" fill="url(#spectrl-silhouette)" stroke={GHOST} strokeWidth="1.2" />
      <path d="M45 48 C36 64 35 89 43 108 C48 119 49 135 43 152" fill="none" stroke={GHOST} strokeWidth="8" strokeLinecap="round" opacity="0.52" />
      <path d="M75 48 C84 64 85 89 77 108 C72 119 71 135 77 152" fill="none" stroke={GHOST} strokeWidth="8" strokeLinecap="round" opacity="0.52" />
      <path d="M43 48 C50 42 70 42 77 48 C83 69 82 93 75 112 C67 119 53 119 45 112 C38 93 37 69 43 48 Z" fill="url(#spectrl-silhouette)" stroke={GHOST} strokeWidth="1.4" />
      <path d="M45 64 C31 69 27 86 28 103" stroke={GHOST} strokeWidth="5" strokeLinecap="round" opacity="0.40" />
      <path d="M75 64 C89 69 93 86 92 103" stroke={GHOST} strokeWidth="5" strokeLinecap="round" opacity="0.40" />
      <path d="M51 113 C48 127 47 140 45 153" stroke={GHOST} strokeWidth="6" strokeLinecap="round" opacity="0.45" />
      <path d="M69 113 C72 127 73 140 75 153" stroke={GHOST} strokeWidth="6" strokeLinecap="round" opacity="0.45" />
      <path d="M32 121 C46 125 73 126 89 120" stroke={CYAN} strokeWidth="0.7" opacity="0.35" strokeDasharray="2 4" />
    </svg>
  );
}

function SlsCamera({ active, features, progress, sensors }: { active: boolean; features: AudioFeatures | null; progress: number; sensors: PhoneSensors }) {
  const { videoRef, canvasRef, status, startCamera, stopCamera, luminance } = useSlsCamera();
  const lock = clamp(progress * 0.62 + n(features?.periodicity, 0.2) * 30 + n(features?.rms) * 120 + sensors.motion * 0.12 + luminance * 0.12, 4, 96);
  const visible = active || progress > 20 || status === "ready";

  return (
    <div className="relative aspect-video overflow-hidden rounded border border-purple-300/15 bg-purple-300/[0.025]">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        style={{ opacity: status === "ready" ? 0.58 : 0, filter: "grayscale(1) contrast(1.34) brightness(0.72) hue-rotate(205deg)" }}
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: status === "ready" ? "linear-gradient(180deg, rgba(1,4,12,0.12), rgba(1,4,12,0.48))" : "radial-gradient(circle at 50% 38%, rgba(155,89,255,0.18), transparent 46%)" }} />
      <div className="absolute inset-0 opacity-24 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(126,232,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(155,89,255,0.10) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="absolute inset-0 opacity-18 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.38) 3px, rgba(0,0,0,0.38) 5px)" }} />
      <div className="absolute left-2 top-2 text-[7px] font-mono uppercase tracking-[0.18em] pointer-events-none" style={{ color: CYAN }}>vision layer</div>

      {status !== "ready" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-3 text-center">
          <button type="button" onClick={startCamera} className="rounded border px-3 py-2 text-[9px] font-mono uppercase tracking-[0.16em]" style={{ borderColor: "rgba(199,255,240,0.42)", color: GHOST, background: "rgba(126,232,255,0.08)", boxShadow: "0 0 16px rgba(126,232,255,0.18)" }}>
            {status === "loading" ? "Ouverture caméra..." : "Activer vision"}
          </button>
          {status === "denied" && <div className="text-[8px] font-mono uppercase tracking-[0.10em]" style={{ color: CYAN }}>caméra refusée / indisponible</div>}
          <div className="text-[7px] font-mono uppercase tracking-[0.12em] text-slate-500">silhouette interprétative basse consommation</div>
        </div>
      )}

      {status === "ready" && (
        <button type="button" onClick={stopCamera} className="absolute right-2 top-2 z-20 rounded border px-2 py-1 text-[7px] font-mono uppercase tracking-[0.14em]" style={{ borderColor: "rgba(126,232,255,0.25)", color: CYAN, background: "rgba(0,0,0,0.35)" }}>cam off</button>
      )}

      <TeslaLikeSilhouette visible={visible} lock={lock} />
      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-2 pointer-events-none">
        <MetricRow label="Form" value={`${Math.round(lock)}%`} hot={lock > 52} />
        <MetricRow label="Lum" value={status === "ready" ? `${Math.round(luminance)}%` : "---"} />
        <MetricRow label="Mode" value={visible ? "PART" : "IDLE"} />
      </div>
    </div>
  );
}

function RealSensorGrid({ sensors, features, active }: { sensors: PhoneSensors; features: AudioFeatures | null; active: boolean }) {
  const mic = clamp(n(features?.rms) * 420, 0, 100);
  const flat = clamp(n(features?.flatness, 0.1) * 100, 0, 100);
  const centroid = n(features?.spectralCentroid, 0);
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
      <MetricRow label="Mic RMS" value={`${Math.round(mic)}%`} hot={mic > 18} />
      <MetricRow label="Noise" value={`${Math.round(flat)}%`} hot={flat > 35} />
      <MetricRow label="Motion" value={sensors.permission === "denied" ? "REFUS" : `${Math.round(sensors.motion)}%`} hot={sensors.motion > 18} />
      <MetricRow label="Gyro" value={sensors.permission === "unsupported" ? "---" : `${Math.round(sensors.rotation)}%`} hot={sensors.rotation > 18} />
      <MetricRow label="Tilt" value={`${Math.round(sensors.tilt)}%`} />
      <MetricRow label="Cent" value={centroid ? `${Math.round(centroid)} Hz` : "---"} />
      <MetricRow label="State" value={active ? "LIVE" : "VEILLE"} hot={active} />
      <MetricRow label="Src" value={sensors.available ? "PHONE" : "AUDIO"} />
    </div>
  );
}

export function SensorScreensV3({ active, audioFeatures, progress, detectedLabel }: SensorScreensV3Props) {
  const sensors = usePhoneSensors(active);
  const centroid = n(audioFeatures?.spectralCentroid, 0);
  const envMode = active || progress > 10 ? (centroid > 1800 ? "RÉSONANT" : "MIXTE") : "VEILLE";

  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Panel>
        <MiniHeader label="RADAR SPECTRAL" status={active ? "LIVE" : "IDLE"} />
        <SpectralRadar active={active} features={audioFeatures} progress={progress} sensors={sensors} />
      </Panel>

      <Panel>
        <MiniHeader label="CAPTEURS TÉLÉPHONE" status={envMode} />
        <RealSensorGrid sensors={sensors} features={audioFeatures} active={active} />
        <div className="mt-2 text-[7px] font-mono uppercase tracking-[0.14em]" style={{ color: DIM }}>
          {detectedLabel ? `trace: ${detectedLabel}` : "trace: acquisition faible / attente"}
        </div>
      </Panel>

      <Panel className="sm:col-span-1">
        <MiniHeader label="VISION / SILHOUETTE" status={active ? "TRACK" : "IDLE"} />
        <SlsCamera active={active} features={audioFeatures} progress={progress} sensors={sensors} />
      </Panel>
    </section>
  );
}
