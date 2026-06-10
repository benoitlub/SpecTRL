type VideoLayer = {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  source: HTMLCanvasElement;
  label: HTMLDivElement;
  lastFrame: Uint8ClampedArray | null;
  tick: number;
};

type ResonanceWindow = Window & typeof globalThis & {
  __spectrlSlsResonance?: { density: number; pulse: number };
};

const layers = new WeakMap<HTMLElement, VideoLayer>();
let raf = 0;
let resonancePulse = 0;

function clamp(value: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function publishResonance(density: number) {
  const normalized = Math.max(0, Math.min(1, density));
  resonancePulse = Math.max(resonancePulse * 0.92, normalized);
  (window as ResonanceWindow).__spectrlSlsResonance = {
    density: normalized,
    pulse: resonancePulse,
  };
}

function makeLayer(host: HTMLElement): VideoLayer {
  const canvas = document.createElement("canvas");
  const source = document.createElement("canvas");
  const label = document.createElement("div");
  canvas.className = "sls-resonance-trace";
  label.className = "sls-resonance-label";
  label.textContent = "RÉSONANCE // PERSISTENCE LENTE";
  host.appendChild(canvas);
  host.appendChild(label);
  const layer = { host, canvas, source, label, lastFrame: null, tick: 0 };
  layers.set(host, layer);
  return layer;
}

function findSlsHosts() {
  return Array.from(document.querySelectorAll<HTMLElement>(".fixed .aspect-video")).filter(host => host.querySelector("video"));
}

function drawLayer(layer: VideoLayer) {
  const video = layer.host.querySelector("video") as HTMLVideoElement | null;
  if (!video || video.readyState < 2) return;

  const rect = layer.host.getBoundingClientRect();
  const width = Math.max(96, Math.round(rect.width / 3));
  const height = Math.max(54, Math.round(rect.height / 3));
  if (layer.canvas.width !== width || layer.canvas.height !== height) {
    layer.canvas.width = width;
    layer.canvas.height = height;
    layer.source.width = width;
    layer.source.height = height;
    layer.lastFrame = null;
  }

  const src = layer.source.getContext("2d", { willReadFrequently: true });
  const out = layer.canvas.getContext("2d", { willReadFrequently: true });
  if (!src || !out) return;

  src.drawImage(video, 0, 0, width, height);
  const frame = src.getImageData(0, 0, width, height);
  const previous = layer.lastFrame;

  out.globalCompositeOperation = "source-over";
  out.fillStyle = "rgba(0, 3, 10, 0.085)";
  out.fillRect(0, 0, width, height);
  out.globalCompositeOperation = "lighter";

  const image = out.createImageData(width, height);
  let points = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    const r = frame.data[i];
    const g = frame.data[i + 1];
    const b = frame.data[i + 2];
    const lum = (r + g + b) / 3;
    const prevLum = previous ? (previous[i] + previous[i + 1] + previous[i + 2]) / 3 : lum;
    const drift = Math.abs(lum - prevLum);
    const chroma = Math.abs(r - b) + Math.abs(g - r) * 0.35;
    const slowTrace = drift > 7 || (lum > 34 && lum < 218 && chroma > 18);
    if (!slowTrace) continue;
    points += 1;
    image.data[i] = clamp(96 + chroma * 0.9);
    image.data[i + 1] = clamp(210 + drift * 1.6);
    image.data[i + 2] = clamp(255 - lum * 0.18);
    image.data[i + 3] = clamp(34 + drift * 3.5 + chroma * 0.95, 0, 220);
  }

  out.filter = "blur(0.35px) contrast(1.28) saturate(1.4)";
  out.putImageData(image, 0, 0);
  out.filter = "none";
  layer.lastFrame = new Uint8ClampedArray(frame.data);
  layer.tick += 1;

  const rawDensity = points / (width * height);
  const density = Math.max(0, Math.min(1, rawDensity * 3));
  publishResonance(density);

  if (layer.tick % 8 === 0) {
    const labelDensity = Math.round(density * 999);
    layer.label.textContent = `RÉSONANCE // TRACE ${labelDensity.toString().padStart(3, "0")} // LENTE`;
  }
}

function loop() {
  findSlsHosts().forEach(host => drawLayer(layers.get(host) || makeLayer(host)));
  raf = window.requestAnimationFrame(loop);
}

export function startSlsResonanceRuntime() {
  if (raf) return;
  raf = window.requestAnimationFrame(loop);
}
