import { useEffect, useRef } from "react";

type WebKitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSpectralBeeps(active: boolean, progress: number, complete: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const humRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
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
      master.gain.value = 0.055;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      return ctx;
    };

    const playTone = (frequency: number, duration = 0.08, volume = 0.05, type: OscillatorType = "sine") => {
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
      filter.frequency.setValueAtTime(frequency * 1.32, now);
      filter.Q.value = 4.8;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    };

    const playAirCrackle = () => {
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.055), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1800;
      gain.gain.value = 0.018;
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start();
    };

    const startHum = () => {
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master || humRef.current) return;
      void ctx.resume().catch(() => undefined);
      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      const humFilter = ctx.createBiquadFilter();
      hum.type = "triangle";
      hum.frequency.value = 58;
      humGain.gain.value = 0.007;
      humFilter.type = "lowpass";
      humFilter.frequency.value = 460;
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(master);
      hum.start();
      humRef.current = hum;
      humGainRef.current = humGain;
    };

    const stopHum = () => {
      const ctx = ctxRef.current;
      if (ctx && humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      window.setTimeout(() => {
        try { humRef.current?.stop(); } catch {}
        humRef.current = null;
        humGainRef.current = null;
      }, 180);
    };

    if (active) {
      wasActiveRef.current = true;
      startHum();
      stopTimer();
      const interval = Math.max(360, 1120 - progress * 7);
      timerRef.current = window.setInterval(() => {
        const base = 300 + progress * 4.6;
        const offset = Math.random() > 0.62 ? 360 : Math.random() > 0.55 ? 180 : 0;
        const freq = base + offset + Math.random() * 160;
        const type: OscillatorType = Math.random() > 0.58 ? "triangle" : "sine";
        playTone(freq, 0.055 + Math.random() * 0.065, 0.025 + progress / 3500, type);
        if (Math.random() > 0.72) playTone(freq * 1.49, 0.045, 0.02, "sine");
        if (Math.random() > 0.78) playAirCrackle();
      }, interval);
    } else {
      stopTimer();
      stopHum();
      if (complete && wasActiveRef.current) {
        window.setTimeout(() => playTone(220, 0.11, 0.04, "triangle"), 50);
        window.setTimeout(() => playTone(540, 0.12, 0.045, "sine"), 160);
        window.setTimeout(() => playTone(880, 0.16, 0.04, "triangle"), 300);
        window.setTimeout(() => playAirCrackle(), 430);
      }
      wasActiveRef.current = false;
    }

    return () => stopTimer();
  }, [active, progress, complete]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    try { humRef.current?.stop(); } catch {}
    ctxRef.current?.close().catch(() => undefined);
  }, []);
}
