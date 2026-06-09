import { useEffect, useRef } from "react";

type WebKitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSpectralBeeps(active: boolean, progress: number, complete: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const humRef = useRef<OscillatorNode | null>(null);
  const subRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const subGainRef = useRef<GainNode | null>(null);
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
      master.gain.value = 0.062;
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
      filter.frequency.setValueAtTime(frequency * 1.28, now);
      filter.Q.value = 6.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.04);
    };

    const playAirCrackle = (dark = false) => {
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const length = Math.floor(ctx.sampleRate * (dark ? 0.14 : 0.06));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const fade = Math.pow(1 - i / data.length, dark ? 3 : 2);
        data[i] = (Math.random() * 2 - 1) * fade;
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = dark ? "bandpass" : "highpass";
      filter.frequency.value = dark ? 620 : 1800;
      filter.Q.value = dark ? 3.4 : 1.2;
      gain.gain.value = dark ? 0.026 : 0.018;
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start();
    };

    const playPulse = () => {
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(42 + Math.random() * 16, now);
      filter.type = "lowpass";
      filter.frequency.value = 180;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.42);
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
      hum.frequency.value = 51;
      humGain.gain.value = 0.009;
      humFilter.type = "lowpass";
      humFilter.frequency.value = 390;
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(master);
      hum.start();

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();
      sub.type = "sine";
      sub.frequency.value = 31;
      subGain.gain.value = 0.006;
      subFilter.type = "lowpass";
      subFilter.frequency.value = 120;
      sub.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(master);
      sub.start();

      humRef.current = hum;
      subRef.current = sub;
      humGainRef.current = humGain;
      subGainRef.current = subGain;
    };

    const stopHum = () => {
      const ctx = ctxRef.current;
      if (ctx && humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      if (ctx && subGainRef.current) subGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.18);
      window.setTimeout(() => {
        try { humRef.current?.stop(); } catch {}
        try { subRef.current?.stop(); } catch {}
        humRef.current = null;
        subRef.current = null;
        humGainRef.current = null;
        subGainRef.current = null;
      }, 260);
    };

    if (active) {
      wasActiveRef.current = true;
      startHum();
      stopTimer();
      const interval = Math.max(420, 1280 - progress * 7);
      timerRef.current = window.setInterval(() => {
        const base = 240 + progress * 4.2;
        const offset = Math.random() > 0.62 ? 340 : Math.random() > 0.52 ? 140 : 0;
        const freq = base + offset + Math.random() * 120;
        const type: OscillatorType = Math.random() > 0.54 ? "triangle" : "sine";
        playTone(freq, 0.06 + Math.random() * 0.085, 0.026 + progress / 3600, type);
        if (Math.random() > 0.74) playTone(freq * 1.47, 0.05, 0.021, "sine");
        if (Math.random() > 0.76) playAirCrackle(Math.random() > 0.5);
        if (Math.random() > 0.83) playPulse();
      }, interval);
    } else {
      stopTimer();
      stopHum();
      if (complete && wasActiveRef.current) {
        window.setTimeout(() => playPulse(), 30);
        window.setTimeout(() => playTone(180, 0.16, 0.045, "triangle"), 90);
        window.setTimeout(() => playTone(420, 0.15, 0.048, "sine"), 230);
        window.setTimeout(() => playTone(720, 0.18, 0.044, "triangle"), 390);
        window.setTimeout(() => playAirCrackle(true), 560);
      }
      wasActiveRef.current = false;
    }

    return () => stopTimer();
  }, [active, progress, complete]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    try { humRef.current?.stop(); } catch {}
    try { subRef.current?.stop(); } catch {}
    ctxRef.current?.close().catch(() => undefined);
  }, []);
}
