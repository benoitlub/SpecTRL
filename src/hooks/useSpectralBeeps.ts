import { useEffect, useRef, useState } from "react";

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
  if (mode === "low") return 0.38;
  return 1;
}

export function useSpectralBeeps(active: boolean, progress: number, complete: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const humRef = useRef<OscillatorNode | null>(null);
  const subRef = useRef<OscillatorNode | null>(null);
  const shimmerRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const subGainRef = useRef<GainNode | null>(null);
  const shimmerGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const wasActiveRef = useRef(false);
  const [mode, setMode] = useState<SoundMode>(() => readSoundMode());

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

    const stopTimer = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const ensureContext = () => {
      if (ctxRef.current) return ctxRef.current;
      const AudioCtor = window.AudioContext || (window as WebKitWindow).webkitAudioContext;
      if (!AudioCtor) return null;
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.16 * scale;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      return ctx;
    };

    const updateMaster = () => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      master.gain.setTargetAtTime(0.16 * scale, ctx.currentTime, 0.08);
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
      filter.Q.value = 5.8;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume * scale, now + 0.016);
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
      const length = Math.floor(ctx.sampleRate * (dark ? 0.22 : 0.08));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const fade = Math.pow(1 - i / data.length, dark ? 2.4 : 2);
        data[i] = (Math.random() * 2 - 1) * fade;
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = dark ? "bandpass" : "highpass";
      filter.frequency.value = dark ? 430 : 1600;
      filter.Q.value = dark ? 4.4 : 1.4;
      gain.gain.value = (dark ? 0.075 : 0.04) * scale;
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
      osc.frequency.setValueAtTime(34 + Math.random() * 18, now);
      filter.type = "lowpass";
      filter.frequency.value = 160;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.085 * scale, now + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.54);
    };

    const startHum = () => {
      if (scale <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      updateMaster();
      if (humRef.current) return;
      void ctx.resume().catch(() => undefined);

      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      const humFilter = ctx.createBiquadFilter();
      hum.type = "triangle";
      hum.frequency.value = 47;
      humGain.gain.value = 0.028 * scale;
      humFilter.type = "lowpass";
      humFilter.frequency.value = 360;
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(master);
      hum.start();

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();
      sub.type = "sine";
      sub.frequency.value = 28;
      subGain.gain.value = 0.022 * scale;
      subFilter.type = "lowpass";
      subFilter.frequency.value = 105;
      sub.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(master);
      sub.start();

      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const shimmerFilter = ctx.createBiquadFilter();
      shimmer.type = "sawtooth";
      shimmer.frequency.value = 121;
      shimmerGain.gain.value = 0.009 * scale;
      shimmerFilter.type = "bandpass";
      shimmerFilter.frequency.value = 680;
      shimmerFilter.Q.value = 9;
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

    const stopHum = () => {
      const ctx = ctxRef.current;
      if (ctx && humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.14);
      if (ctx && subGainRef.current) subGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.18);
      if (ctx && shimmerGainRef.current) shimmerGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      window.setTimeout(() => {
        try { humRef.current?.stop(); } catch {}
        try { subRef.current?.stop(); } catch {}
        try { shimmerRef.current?.stop(); } catch {}
        humRef.current = null;
        subRef.current = null;
        shimmerRef.current = null;
        humGainRef.current = null;
        subGainRef.current = null;
        shimmerGainRef.current = null;
      }, 280);
    };

    if (scale <= 0) {
      stopTimer();
      stopHum();
      return () => stopTimer();
    }

    if (active) {
      wasActiveRef.current = true;
      startHum();
      stopTimer();
      playTone(96, 0.12, 0.07, "triangle");
      playAirCrackle(true);
      const interval = Math.max(360, 1060 - progress * 6.2);
      timerRef.current = window.setInterval(() => {
        const base = 210 + progress * 4.5;
        const offset = Math.random() > 0.62 ? 340 : Math.random() > 0.48 ? 150 : 0;
        const freq = base + offset + Math.random() * 130;
        const type: OscillatorType = Math.random() > 0.54 ? "triangle" : "sine";
        playTone(freq, 0.07 + Math.random() * 0.105, 0.048 + progress / 3000, type);
        if (Math.random() > 0.66) playTone(freq * 1.47, 0.055, 0.035, "sine");
        if (Math.random() > 0.62) playAirCrackle(Math.random() > 0.35);
        if (Math.random() > 0.70) playPulse();
      }, interval);
    } else {
      stopTimer();
      stopHum();
      if (complete && wasActiveRef.current) {
        window.setTimeout(() => playPulse(), 20);
        window.setTimeout(() => playTone(160, 0.20, 0.085, "triangle"), 90);
        window.setTimeout(() => playTone(390, 0.18, 0.075, "sine"), 230);
        window.setTimeout(() => playTone(690, 0.20, 0.068, "triangle"), 390);
        window.setTimeout(() => playAirCrackle(true), 560);
      }
      wasActiveRef.current = false;
    }

    return () => stopTimer();
  }, [active, progress, complete, mode]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    try { humRef.current?.stop(); } catch {}
    try { subRef.current?.stop(); } catch {}
    try { shimmerRef.current?.stop(); } catch {}
    ctxRef.current?.close().catch(() => undefined);
  }, []);
}
