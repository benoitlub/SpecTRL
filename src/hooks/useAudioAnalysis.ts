import { useState, useEffect, useRef, useCallback } from "react";
import {
  SPECIES,
  getCrypticMessages,
  getRandomTranslation,
  extractAudioFeatures,
  type AnalysisState,
  type Lang,
  type AudioFeatures,
  type Species,
} from "../data/animals";
import { getSpectralHumorLine } from "../data/spectralHumor";

const PREFERRED_QUIET_IDS = new Set(["pigeon", "cat", "owl"]);
const LIVE_READING_INTERVAL_FRAMES = 32;
const MIN_TRACE_RMS = 0.0025;

type Habitat = "resonant" | "domestic" | "unstable" | "quiet";

function pickRandomSpecies(pool: Species[]): Species {
  return pool[Math.floor(Math.random() * pool.length)] || SPECIES[0];
}

function getAverageFeatures(samples: AudioFeatures[]): AudioFeatures | null {
  if (samples.length === 0) return null;
  return {
    dominantFreq: samples.reduce((sum, f) => sum + f.dominantFreq, 0) / samples.length,
    spectralCentroid: samples.reduce((sum, f) => sum + f.spectralCentroid, 0) / samples.length,
    flatness: samples.reduce((sum, f) => sum + f.flatness, 0) / samples.length,
    lowEnergyRatio: samples.reduce((sum, f) => sum + f.lowEnergyRatio, 0) / samples.length,
    zcr: samples.reduce((sum, f) => sum + f.zcr, 0) / samples.length,
    periodicity: samples.reduce((sum, f) => sum + f.periodicity, 0) / samples.length,
    rms: samples.reduce((sum, f) => sum + f.rms, 0) / samples.length,
    sampleDuration: samples[0].sampleDuration,
  };
}

function rangeScore(val: number, min: number, max: number): number {
  if (val >= min && val <= max) return 1;
  const mid = (min + max) / 2;
  const range = (max - min) / 2 || 1;
  return Math.max(0, 1 - Math.abs(val - mid) / range);
}

function inferHabitat(features: AudioFeatures | null): Habitat {
  if (!features || features.rms < 0.004) return "quiet";
  if (features.rms > 0.2 || features.flatness > 0.52) return "unstable";
  if (features.spectralCentroid > 1800 && features.lowEnergyRatio < 0.5) return "resonant";
  return "domestic";
}

function speciesScore(species: Species, features: AudioFeatures): number {
  const p = species.acousticProfile;
  let score = 0;
  let weight = 0;
  const add = (s: number, w: number) => { score += s * w; weight += w; };

  add(rangeScore(features.dominantFreq, p.dominantFreqMin, p.dominantFreqMax), 2);
  add(rangeScore(features.spectralCentroid, p.spectralCentroidMin, p.spectralCentroidMax), 1.5);
  add(rangeScore(features.flatness, p.flatnessMin, p.flatnessMax), 1);
  add(rangeScore(features.lowEnergyRatio, p.lowEnergyRatioMin, p.lowEnergyRatioMax), 1);
  add(rangeScore(features.zcr, p.zcrMin, p.zcrMax), 1);
  add(rangeScore(features.periodicity, p.periodicityMin, p.periodicityMax), 1);
  add(rangeScore(features.rms, p.rmsMin, p.rmsMax), 0.8);

  let normalized = score / weight;
  const habitat = inferHabitat(features);

  if (habitat === "quiet" && PREFERRED_QUIET_IDS.has(species.id)) normalized += 0.08;
  if (habitat === "domestic" && species.id === "pigeon") normalized += 0.1;
  if (habitat === "resonant" && ["crow", "cat", "owl"].includes(species.id)) normalized += 0.08;
  if (habitat === "unstable" && ["duck", "dog"].includes(species.id)) normalized += 0.12;

  if (species.id === "dog" && features.rms < 0.025) normalized -= 0.12;
  if (species.id === "owl" && features.spectralCentroid > 1600) normalized -= 0.08;

  return Math.max(0, Math.min(1, normalized));
}

function classifyLocalSpecies(features: AudioFeatures): { species: Species; score: number }[] {
  return SPECIES
    .map(species => ({ species, score: speciesScore(species, features) }))
    .sort((a, b) => b.score - a.score);
}

function getTraceSpecies(features: AudioFeatures | null): Species {
  if (!features || features.rms < 0.004) return pickRandomSpecies(SPECIES.filter(s => PREFERRED_QUIET_IDS.has(s.id)));
  const scores = classifyLocalSpecies(features);
  return scores[0]?.species || pickRandomSpecies(SPECIES);
}

function getHabitatScan(features: AudioFeatures | null, lang: Lang): string {
  const habitat = inferHabitat(features);
  const labels = {
    resonant: {
      fr: "AMBIANCE : ZONE RÉSONANTE — RÉMANENCES POSSIBLES",
      en: "AMBIENCE: RESONANT ZONE — REMANENCES POSSIBLE",
      es: "AMBIENTE: ZONA RESONANTE — REMANENCIAS POSIBLES",
    },
    domestic: {
      fr: "AMBIANCE : INTÉRIEUR / TRACE DOMESTIQUE — SIGNAUX MIXTES",
      en: "AMBIENCE: INTERIOR / DOMESTIC TRACE — MIXED SIGNALS",
      es: "AMBIENTE: INTERIOR / TRAZA DOMÉSTICA — SEÑALES MIXTAS",
    },
    unstable: {
      fr: "AMBIANCE : PARASITES / STRUCTURE INSTABLE — PRUDENCE MARTY",
      en: "AMBIENCE: INTERFERENCE / UNSTABLE STRUCTURE — MARTY CAUTION",
      es: "AMBIENTE: INTERFERENCIAS / ESTRUCTURA INESTABLE — CAUTELA MARTY",
    },
    quiet: {
      fr: "AMBIANCE : ÉCOUTE DE TRACE EN COURS",
      en: "AMBIENCE: TRACE LISTENING",
      es: "AMBIENTE: ESCUCHA DE TRAZA",
    },
  } as const;
  return labels[habitat][lang];
}

const INITIAL_STATE: AnalysisState = {
  isListening: false,
  isAnalyzing: false,
  isComplete: false,
  species: null,
  confidence: 0,
  emotionalState: "",
  threatLevel: "MINIMAL",
  biologicalIntent: "",
  neuralResonance: 0,
  signalQuality: 0,
  translation: "",
  environmentalScan: "",
  isPoetic: false,
  glitchActive: false,
  scanProgress: 0,
  detectedSpecies: null,
  speciesConfidence: 0,
  audioFeatures: null,
};

export function useAudioAnalysis() {
  const [lang, setLang] = useState<Lang>("fr");
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE);
  const [micPermission, setMicPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [crypticMessage, setCrypticMessage] = useState<string>("");
  const [waveformData, setWaveformData] = useState<number[]>(Array(64).fill(0));
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const glitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crypticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedFeaturesRef = useRef<AudioFeatures[]>([]);

  const generateFakeWaveform = useCallback((intensity: number) => {
    return Array.from({ length: 64 }, (_, i) => {
      const base = Math.sin(i * 0.3 + Date.now() * 0.002) * 0.3;
      const noise = (Math.random() - 0.5) * intensity;
      const spike = Math.random() < 0.05 ? Math.random() * 0.8 : 0;
      return Math.max(0, Math.min(1, base + noise + spike));
    });
  }, []);

  const animateWaveform = useCallback((intensity: number) => {
    if (analyserRef.current) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const normalized = Array.from(data.slice(0, 64)).map(v => v / 255);
      setWaveformData(normalized);
      setSpectrogramData(prev => {
        const next = [...prev, normalized.slice(0, 32)];
        return next.slice(-40);
      });
    } else {
      const fake = generateFakeWaveform(intensity);
      setWaveformData(fake);
      setSpectrogramData(prev => {
        const next = [...prev, fake.slice(0, 32)];
        return next.slice(-40);
      });
    }
    animFrameRef.current = requestAnimationFrame(() => animateWaveform(intensity));
  }, [generateFakeWaveform]);

  const triggerGlitch = useCallback(() => {
    setState(s => ({ ...s, glitchActive: true }));
    setTimeout(() => setState(s => ({ ...s, glitchActive: false })), 150 + Math.random() * 200);
    glitchTimerRef.current = setTimeout(triggerGlitch, 3000 + Math.random() * 8000);
  }, []);

  const rotateCrypticMessage = useCallback(() => {
    const msgs = getCrypticMessages(lang);
    const idx = Math.floor(Math.random() * msgs.length);
    setCrypticMessage(msgs[idx]);
    crypticTimerRef.current = setTimeout(rotateCrypticMessage, 6500 + Math.random() * 7000);
  }, [lang]);

  const buildReading = useCallback((species: Species, features: AudioFeatures | null, complete: boolean, confidence?: number) => {
    const base = getRandomTranslation(species, lang);
    const useDomesticTyrant = complete && Math.random() < 0.72;
    const text = useDomesticTyrant ? getSpectralHumorLine(lang) : base.text;
    const emotionalIdx = Math.floor(Math.random() * species.emotionalStates[lang].length);
    const threatIdx = Math.floor(Math.random() * species.threatLevels.length);
    const intentIdx = Math.floor(Math.random() * species.biologicalIntents[lang].length);
    const conf = confidence ?? Math.floor(48 + Math.random() * 35);
    return {
      species,
      confidence: conf,
      emotionalState: species.emotionalStates[lang][emotionalIdx],
      threatLevel: species.threatLevels[threatIdx],
      biologicalIntent: species.biologicalIntents[lang][intentIdx],
      neuralResonance: Math.floor(45 + Math.random() * 45),
      signalQuality: Math.floor(55 + Math.random() * 40),
      translation: text,
      environmentalScan: getHabitatScan(features, lang),
      isPoetic: useDomesticTyrant ? false : base.isPoetic,
      isComplete: complete,
      detectedSpecies: species.scientificName[lang] || species.name,
      speciesConfidence: conf,
      audioFeatures: features,
    };
  }, [lang]);

  const publishLiveReading = useCallback((features: AudioFeatures | null, progress: number) => {
    const species = getTraceSpecies(features);
    const confidence = Math.floor(Math.min(88, Math.max(34, progress * 0.75 + Math.random() * 16)));
    setDetectedLabel(species.scientificName[lang] || species.name);
    setState(s => ({ ...s, ...buildReading(species, features, false, confidence), isListening: true, isAnalyzing: false, scanProgress: Math.max(s.scanProgress, progress) }));
  }, [buildReading, lang]);

  const finalizeReading = useCallback((finalFeatures: AudioFeatures | null) => {
    const species = getTraceSpecies(finalFeatures);
    const topScore = finalFeatures ? (classifyLocalSpecies(finalFeatures)[0]?.score ?? 0.6) : 0.55;
    const confidence = Math.floor(Math.min(88, Math.max(48, topScore * 82 + Math.random() * 8)));
    setDetectedLabel(null);
    setState(s => ({ ...s, ...buildReading(species, finalFeatures, true, confidence), isListening: false, isAnalyzing: false, scanProgress: 100 }));
  }, [buildReading]);

  const startListening = useCallback(async () => {
    cancelAnimationFrame(animFrameRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    if (crypticTimerRef.current) clearTimeout(crypticTimerRef.current);

    accumulatedFeaturesRef.current = [];
    setState({ ...INITIAL_STATE, isListening: true, scanProgress: 0 });
    setWaveformData(Array(64).fill(0));
    setSpectrogramData([]);
    setAudioFeatures(null);
    setDetectedLabel(null);
    rotateCrypticMessage();
    glitchTimerRef.current = setTimeout(triggerGlitch, 2000 + Math.random() * 3000);

    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission("granted");
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    } catch {
      setMicPermission("denied");
    }

    animateWaveform(0.4);

    if (analyser && ctx) {
      let frames = 0;
      featureIntervalRef.current = setInterval(() => {
        if (!analyser || !ctx) return;
        const feats = extractAudioFeatures(analyser, ctx);
        setAudioFeatures(feats);
        frames++;

        if (feats.rms > MIN_TRACE_RMS || frames % 8 === 0) {
          accumulatedFeaturesRef.current.push(feats);
          if (accumulatedFeaturesRef.current.length > 180) accumulatedFeaturesRef.current = accumulatedFeaturesRef.current.slice(-180);
        }

        const signalBoost = Math.min(28, feats.rms * 520);
        const progress = Math.min(96, frames * 0.55 + accumulatedFeaturesRef.current.length * 1.1 + signalBoost + Math.random() * 1.5);
        const avg = getAverageFeatures(accumulatedFeaturesRef.current) || feats;
        setState(s => ({ ...s, scanProgress: Math.max(s.scanProgress, progress), audioFeatures: avg }));

        if (frames % LIVE_READING_INTERVAL_FRAMES === 0 && (accumulatedFeaturesRef.current.length > 0 || progress > 18)) {
          publishLiveReading(avg, progress);
        }
      }, 100);
    }
  }, [animateWaveform, rotateCrypticMessage, triggerGlitch, publishLiveReading]);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    if (crypticTimerRef.current) clearTimeout(crypticTimerRef.current);
    let finalFeatures = getAverageFeatures(accumulatedFeaturesRef.current);
    if (!finalFeatures && audioCtxRef.current && analyserRef.current) finalFeatures = extractAudioFeatures(analyserRef.current, audioCtxRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (finalFeatures) finalizeReading(finalFeatures);
    else {
      setState(s => ({ ...s, isListening: false, isAnalyzing: false, isComplete: false }));
      setDetectedLabel(null);
    }
  }, [finalizeReading]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    if (crypticTimerRef.current) clearTimeout(crypticTimerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    accumulatedFeaturesRef.current = [];
    setWaveformData(Array(64).fill(0));
    setSpectrogramData([]);
    setAudioFeatures(null);
    setDetectedLabel(null);
    setState(INITIAL_STATE);
    setCrypticMessage("");
  }, []);

  useEffect(() => () => {
    cancelAnimationFrame(animFrameRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    if (crypticTimerRef.current) clearTimeout(crypticTimerRef.current);
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
  }, []);

  return { state, micPermission, crypticMessage, waveformData, spectrogramData, audioFeatures, detectedLabel, lang, setLang, startListening, stopListening, reset };
}
