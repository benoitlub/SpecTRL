import { useEffect, useRef, useState } from "react";
import type { AudioFeatures } from "../data/animals";

type WebKitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type SoundMode = "off" | "low" | "high";

function readSoundMode(): SoundMode {
  const value = window.localStorage.getItem("spectrl-sound-mode");
  if (value === "off" || value === "low" || value === "high") return value;
  return "high";
}

function soundScale(mode: SoundMode) {
  if (mode === "off") return 0;
  if (mode === "low") return 0.65;
  return 1.55;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function useSpectralBeeps(active: boolean, progress: number, complete: boolean, audioFeatures?: AudioFeatures | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const humRef = useRef<OscillatorNode | null>(null);
  const subRef = useRef<OscillatorNode | null>(null);
  const shimmerRef = useRef<OscillatorNode | null>(null);
  const radioNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const radioGainRef = useRef<GainNode | null>(null);
  const radioFilterRef = useRef<BiquadFilterNode | null>(null);
  const radioNeedleRef = useRef<OscillatorNode | null>(null);
  const radioNeedleGainRef = useRef<GainNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const subGainRef = useRef<GainNode | null>(null);
  const shimmerGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const featuresRef = useRef<AudioFeatures | null>(audioFeatures || null);
  const [mode, setMode] = useState<SoundMode>(() => readSoundMode());

  useEffect(() => {
    featuresRef.current = audioFeatures || null;
  }, [audioFeatures]);

  useEffect(() => {
    const sync = () => setMode(readSoundMode());
    window.addEventListener("storage", sync);
    window.addEventListener("spectrl-sound-mode-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("spectrl-sound-mode-change", sync);
    };
  }, []);

  useEffect(() => {
    const scale = soundScale(mode);

    const micEnergy = () => {
      const f = featuresRef.current;
      if (!f) return 0.18;
      return clamp(f.rms * 9 + f.flatness * 0.38 + f.lowEnergyRatio * 0.12);
    };

    const spectralBias = () => {
      const f = featuresRef.current;
      if (!f) return 0.35;
      return clamp(f.spectralCentroid / 4200 + f.zcr * 0.75);
    };

    const stopTimer = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const stopHum = () => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.035);
      if (ctx && humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      if (ctx && subGainRef.current) subGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      if (ctx && shimmerGainRef.current) shimmerGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      if (ctx && radioGainRef.current) radioGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.025);
      if (ctx && radioNeedleGainRef.current) radioNeedleGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.025);
      window.setTimeout(() => {
        try { humRef.current?.stop(); } catch {}
        try { subRef.current?.stop(); } catch {}
        try { shimmerRef.current?.stop(); } catch {}
        try { radioNoiseRef.current?.stop(); } catch {}
        try { radioNeedleRef.current?.stop(); } catch {}
        humRef.current = null;
        subRef.current = null;
        shimmerRef.current = null;
        radioNoiseRef.current = null;
        radioNeedleRef.current = null;
        humGainRef.current = null;
        subGainRef.current = null;
        shimmerGainRef.current = null;
        radioGainRef.current = null;
        radioFilterRef.current = null;
        radioNeedleGainRef.current = null;
        if (ctxRef.current?.state === "running") ctxRef.current.suspend().catch(() => undefined);
      }, 90);
    };

    const ensureContext = () => {
      if (ctxRef.current) return ctxRef.current;
      const AudioCtor = window.AudioContext || (window as WebKitWindow).webkitAudioContext;
      if (!AudioCtor) return null;
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.24 * scale;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      return ctx;
    };

    const updateMaster = () => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      master.gain.setTargetAtTime(0.24 * scale * (1 + micEnergy() * 0.22), ctx.currentTime, 0.08);
    };

    const createRadioNoiseBuffer = (ctx: AudioContext) => {
      const length = Math.floor(ctx.sampleRate * 1.6);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.84 + white * 0.16;
        const crackle = Math.random() > 0.977 ? (Math.random() * 2 - 1) * 1.15 : 0;
        const tuningWarble = Math.sin(i * 0.004 + Math.sin(i * 0.0009) * 5) * 0.10;
        data[i] = Math.max(-1, Math.min(1, previous * 0.76 + white * 0.28 + crackle + tuningWarble));
      }
      return buffer;
    };

    const startRadioBed = () => {
      if (scale <= 0 || radioNoiseRef.current) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;

      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const notch = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      noise.buffer = createRadioNoiseBuffer(ctx);
      noise.loop = true;
      filter.type = "bandpass";
      filter.frequency.value = 930;
      filter.Q.value = 1.35;
      notch.type = "notch";
      notch.frequency.value = 1240;
      notch.Q.value = 6.5;
      gain.gain.value = 0.06 * scale;
      noise.connect(filter);
      filter.connect(notch);
      notch.connect(gain);
      gain.connect(master);
      noise.start();

      const needle = ctx.createOscillator();
      const needleGain = ctx.createGain();
      const needleFilter = ctx.createBiquadFilter();
      needle.type = "sawtooth";
      needle.frequency.value = 83;
      needleGain.gain.value = 0.014 * scale;
      needleFilter.type = "bandpass";
      needleFilter.frequency.value = 1660;
      needleFilter.Q.value = 12;
      needle.connect(needleFilter);
      needleFilter.connect(needleGain);
      needleGain.connect(master);
      needle.start();

      radioNoiseRef.current = noise;
      radioGainRef.current = gain;
      radioFilterRef.current = filter;
      radioNeedleRef.current = needle;
      radioNeedleGainRef.current = needleGain;
    };

    const wobbleRadio = () => {
      const ctx = ctxRef.current;
      if (!ctx || !radioFilterRef.current || !radioGainRef.current || scale <= 0) return;
      const now = ctx.currentTime;
      const energy = micEnergy();
      const centroid = spectralBias();
      const freq = 360 + centroid * 2300 + Math.random() * 880 + Math.sin(progress * 0.09) * 220;
      const volume = (0.05 + Math.random() * 0.07 + energy * 0.09 + progress / 3300) * scale;
      radioFilterRef.current.frequency.setTargetAtTime(freq, now, 0.12);
      radioFilterRef.current.Q.setTargetAtTime(1.1 + energy * 9.2 + Math.random() * 6.2, now, 0.14);
      radioGainRef.current.gain.setTargetAtTime(volume, now, 0.08);
      if (radioNeedleGainRef.current) radioNeedleGainRef.current.gain.setTargetAtTime((0.012 + energy * 0.018) * scale, now, 0.12);
    };

    const playTone = (frequency: number, duration = 0.08, volume = 0.08, type: OscillatorType = "sine") => {
      if (scale <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      void ctx.resume().catch(() => undefined);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const now = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(frequency * 1.25, now);
      filter.Q.value = 5.8 + spectralBias() * 3;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume * scale * (1 + micEnergy() * 0.45), now + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.04);
    };

    const playAirCrackle = (dark = false) => {
      if (scale <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const energy = micEnergy();
      const length = Math.floor(ctx.sampleRate * (dark ? 0.32 + energy * 0.12 : 0.12));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const fade = Math.pow(1 - i / data.length, dark ? 1.45 : 1.8);
        const burst = Math.random() > 0.94 - energy * 0.04 ? (Math.random() * 2 - 1) * 1.35 : 0;
        data[i] = ((Math.random() * 2 - 1) * fade + burst) * (dark ? 0.95 : 0.68);
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = dark ? "bandpass" : "highpass";
      filter.frequency.value = dark ? 520 + spectralBias() * 1700 : 1900 + spectralBias() * 3200;
      filter.Q.value = dark ? 8.5 : 3.2;
      gain.gain.value = (dark ? 0.145 : 0.082) * scale * (1 + energy * 0.5);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start();
    };

    const playPulse = () => {
      if (scale <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(32 + micEnergy() * 32 + Math.random() * 18, now);
      filter.type = "lowpass";
      filter.frequency.value = 180 + spectralBias() * 220;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.105 * scale * (1 + micEnergy() * 0.35), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.48);
    };

    const startHum = () => {
      if (scale <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      updateMaster();
      startRadioBed();
      if (humRef.current) return;
      void ctx.resume().catch(() => undefined);

      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      const humFilter = ctx.createBiquadFilter();
      hum.type = "triangle";
      hum.frequency.value = 43;
      humGain.gain.value = 0.031 * scale;
      humFilter.type = "lowpass";
      humFilter.frequency.value = 310;
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(master);
      hum.start();

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();
      sub.type = "sine";
      sub.frequency.value = 26;
      subGain.gain.value = 0.026 * scale;
      subFilter.type = "lowpass";
      subFilter.frequency.value = 100;
      sub.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(master);
      sub.start();

      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const shimmerFilter = ctx.createBiquadFilter();
      shimmer.type = "sawtooth";
      shimmer.frequency.value = 118;
      shimmerGain.gain.value = 0.012 * scale;
      shimmerFilter.type = "bandpass";
      shimmerFilter.frequency.value = 780;
      shimmerFilter.Q.value = 11;
      shimmer.connect(shimmerFilter);
      shimmerFilter.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start();

      humRef.current = hum;
      subRef.current = sub;
      shimmerRef.current = shimmer;
      humGainRef.current = humGain;
      subGainRef.current = subGain;
      shimmerGainRef.current = shimmerGain;
    };

    if (scale <= 0) {
      stopTimer();
      stopHum();
      return () => stopTimer();
    }

    if (active) {
      startHum();
      wobbleRadio();
      stopTimer();
      playTone(96 + micEnergy() * 90, 0.12, 0.072, "triangle");
      playAirCrackle(true);
      const interval = Math.max(220, 780 - progress * 4.8 - micEnergy() * 160);
      timerRef.current = window.setInterval(() => {
        updateMaster();
        wobbleRadio();
        const energy = micEnergy();
        const base = 160 + progress * 3.4 + spectralBias() * 210;
        const offset = Math.random() > 0.64 ? 470 : Math.random() > 0.48 ? 210 : 0;
        const freq = base + offset + Math.random() * (210 + energy * 240);
        const type: OscillatorType = Math.random() > 0.58 ? "triangle" : "sine";
        playTone(freq, 0.06 + Math.random() * 0.095, 0.045 + progress / 3600 + energy * 0.035, type);
        if (Math.random() > 0.65) playTone(freq * 1.71, 0.05, 0.038 + energy * 0.018, "sine");
        if (Math.random() > 0.36 - energy * 0.18) playAirCrackle(Math.random() > 0.18);
        if (Math.random() > 0.72 - energy * 0.14) playPulse();
      }, interval);
    } else {
      stopTimer();
      stopHum();
    }

    return () => stopTimer();
  }, [active, progress, complete, mode]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    try { humRef.current?.stop(); } catch {}
    try { subRef.current?.stop(); } catch {}
    try { shimmerRef.current?.stop(); } catch {}
    try { radioNoiseRef.current?.stop(); } catch {}
    try { radioNeedleRef.current?.stop(); } catch {}
    ctxRef.current?.close().catch(() => undefined);
  }, []);
}
