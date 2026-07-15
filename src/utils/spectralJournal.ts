import type { AnalysisState, AudioFeatures } from "../data/animals";
import { createSpecTRLOctopusAdapter } from "../integrations/octopus";

const STORAGE_KEY = "spectrl-session-journal-v1";
const MAX_ENTRIES = 30;
const octopusAdapter = createSpecTRLOctopusAdapter();

export type SpectralJournalEntry = {
  id: string;
  createdAt: string;
  signatureName: string;
  confidence: number;
  translation: string;
  habitat: string;
  emotionalState: string;
  anomalyLevel: string;
  residualIntent: string;
  favorite: boolean;
  locationNote: string;
  userNotes: string;
  metrics: {
    dominantFreq?: number;
    spectralCentroid?: number;
    rms?: number;
    resonance?: number;
    clarity?: number;
  };
};

function safeJsonParse(value: string | null): SpectralJournalEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function roundMetric(value: number | undefined | null) {
  if (!Number.isFinite(value ?? NaN)) return undefined;
  return Math.round(Number(value));
}

function read(): SpectralJournalEntry[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
}

function write(entries: SpectralJournalEntry[]) {
  if (typeof window === "undefined") return entries;
  const next = entries.slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function emitObservation(entry: SpectralJournalEntry): void {
  const event = octopusAdapter.createEvent("observation.created", {
    sessionId: entry.id,
    locationLabel: entry.locationNote || entry.habitat,
    confidence: entry.confidence,
    frequencyPeakHz: entry.metrics.dominantFreq,
    tags: [entry.signatureName, entry.anomalyLevel, entry.emotionalState].filter(Boolean),
    metadata: {
      translation: entry.translation,
      habitat: entry.habitat,
      residualIntent: entry.residualIntent,
      spectralCentroid: entry.metrics.spectralCentroid,
      rms: entry.metrics.rms,
      resonance: entry.metrics.resonance,
      clarity: entry.metrics.clarity,
    },
  });

  // Intentionally detached: Octopus must never delay or break SpecTRL.
  void octopusAdapter.emit(event).then(result => {
    if (import.meta.env.DEV && result.status === "failed") {
      console.debug("[SpecTRL Octopus adapter] Observation not delivered", result.error);
    }
  });
}

export function getSpectralJournal() {
  return read();
}

export function clearSpectralJournal() {
  return write([]);
}

export function deleteSpectralEntry(id: string) {
  return write(read().filter(entry => entry.id !== id));
}

export function updateSpectralEntry(id: string, patch: Partial<SpectralJournalEntry>) {
  return write(read().map(entry => entry.id === id ? { ...entry, ...patch } : entry));
}

export function createSpectralJournalEntry(state: AnalysisState, audioFeatures: AudioFeatures | null): SpectralJournalEntry | null {
  if (!state.isComplete || !state.translation) return null;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    signatureName: state.detectedSpecies || state.species?.scientificName?.fr || state.species?.name || "Trace non classée",
    confidence: Math.round(state.speciesConfidence || state.confidence || 0),
    translation: state.translation,
    habitat: state.environmentalScan || "Rémanence non localisée",
    emotionalState: state.emotionalState || "Résonance indéterminée",
    anomalyLevel: state.threatLevel || "LOW",
    residualIntent: state.biologicalIntent || "INTENTION RÉSIDUELLE NON CLASSÉE",
    favorite: false,
    locationNote: "",
    userNotes: "",
    metrics: {
      dominantFreq: roundMetric(audioFeatures?.dominantFreq ?? state.audioFeatures?.dominantFreq),
      spectralCentroid: roundMetric(audioFeatures?.spectralCentroid ?? state.audioFeatures?.spectralCentroid),
      rms: roundMetric((audioFeatures?.rms ?? state.audioFeatures?.rms ?? 0) * 100),
      resonance: roundMetric(state.neuralResonance),
      clarity: roundMetric(state.signalQuality),
    },
  };
}

export function saveSpectralJournalEntry(entry: SpectralJournalEntry) {
  const current = read();
  const withoutDuplicate = current.filter(item => item.translation !== entry.translation || item.createdAt !== entry.createdAt);
  const saved = write([entry, ...withoutDuplicate]);
  emitObservation(entry);
  return saved;
}
