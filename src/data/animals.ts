import type { Lang, AnalysisState, AudioFeatures } from "./translations";
import { ANIMAL_TEXTS } from "./animalTexts";
import {
  UI_LABELS as BASE_UI_LABELS,
  getThreatColor,
  getCrypticMessages,
  getRandomTranslation,
  extractAudioFeatures,
  classifySpecies,
  getWeightedSpecies,
} from "./translations";

export {
  getThreatColor,
  getCrypticMessages,
  getRandomTranslation,
  extractAudioFeatures,
  classifySpecies,
  getWeightedSpecies,
};

export const UI_LABELS: typeof BASE_UI_LABELS = {
  ...BASE_UI_LABELS,
  en: {
    ...BASE_UI_LABELS.en,
    title: "SpecTRL",
    subtitle: "// MARTY TRACE RESONANCE LOGGER",
    initiate: "INITIATE TRACE SCAN",
    stop: "STOP TRACE SCAN",
    analyzing: "ANALYZING RESONANCE...",
    complete: "TRACE SCAN COMPLETE — RESET",
    awaiting: "AWAITING ACOUSTIC TRACE — PRESS INITIATE SCAN",
    decoding: "DECODING ENVIRONMENTAL REMANENCE...",
    translation: "MARTY TRANSLATION PROTOCOL",
    poetry: "RESIDUAL POETRY DETECTED",
    species: "SIGNATURE CLASSIFICATION",
    emotional: "REMANENCE FREQUENCY",
    threat: "ANOMALY ASSESSMENT",
    biological: "RESIDUAL INTENT",
    neural: "TRACE RESONANCE",
    signal: "ACOUSTIC TRACE QUALITY",
    bioacoustic: "TRACE RESONANCE PATTERN RECOGNITION",
    footer1: "SpecTRL v0.2.1 // MARTY LABS EXPERIMENTAL",
    footer2: "CLASSIFICATION: UNSTABLE",
    institute: "MARTY LABS",
    station: "SPEC-TRL FIELD STATION — TRACE MODE",
    detected: "ACOUSTIC TRACE DETECTED",
    unknown: "UNCLASSIFIED REMANENCE",
  },
  fr: {
    ...BASE_UI_LABELS.fr,
    title: "SpecTRL V.0.2.1",
    subtitle: "// MARTY TRACE RESONANCE LOGGER",
    initiate: "LANCER LE SCAN",
    stop: "ARRÊTER LE SCAN",
    analyzing: "ANALYSE DE RÉMANENCE...",
    complete: "SCAN TERMINÉ — RÉINITIALISER",
    awaiting: "EN ATTENTE D'UNE TRACE ACOUSTIQUE — PRESSEZ LANCER",
    decoding: "DÉCODAGE DE LA RÉMANENCE ENVIRONNEMENTALE...",
    translation: "PROTOCOLE DE TRADUCTION MARTY",
    poetry: "POÉSIE RÉSIDUELLE DÉTECTÉE",
    species: "CLASSIFICATION DE SIGNATURE",
    emotional: "FRÉQUENCE DE RÉMANENCE",
    threat: "ÉVALUATION D'ANOMALIE",
    biological: "INTENTION RÉSIDUELLE",
    neural: "RÉSONANCE DE TRACE",
    signal: "QUALITÉ DE TRACE ACOUSTIQUE",
    bioacoustic: "RECONNAISSANCE DE RÉSONANCE DE TRACE",
    footer1: "SpecTRL v0.2.1 // MARTY LABS — EXPÉRIMENTAL",
    footer2: "CLASSIFICATION : INSTABLE",
    institute: "MARTY LABS",
    station: "STATION DE TERRAIN SPEC-TRL — MODE TRACE",
    detected: "TRACE ACOUSTIQUE DÉTECTÉE",
    unknown: "RÉMANENCE NON CLASSÉE",
  },
  es: {
    ...BASE_UI_LABELS.es,
    title: "SpecTRL",
    subtitle: "// MARTY TRACE RESONANCE LOGGER",
    initiate: "INICIAR ESCÁNER DE TRAZAS",
    stop: "DETENER ESCÁNER",
    analyzing: "ANALIZANDO RESONANCIA...",
    complete: "ESCÁNER COMPLETADO — REINICIAR",
    awaiting: "ESPERANDO TRAZA ACÚSTICA — PRESIONE INICIAR",
    decoding: "DECODIFICANDO REMANENCIA AMBIENTAL...",
    translation: "PROTOCOLO DE TRADUCCIÓN MARTY",
    poetry: "POESÍA RESIDUAL DETECTADA",
    species: "CLASIFICACIÓN DE FIRMA",
    emotional: "FRECUENCIA DE REMANENCIA",
    threat: "EVALUACIÓN DE ANOMALÍA",
    biological: "INTENCIÓN RESIDUAL",
    neural: "RESONANCIA DE TRAZA",
    signal: "CALIDAD DE TRAZA ACÚSTICA",
    bioacoustic: "RECONOCIMIENTO DE PATRONES DE TRAZA",
    footer1: "SpecTRL v0.2.1 // MARTY LABS EXPERIMENTAL",
    footer2: "CLASIFICACIÓN: INESTABLE",
    institute: "MARTY LABS",
    station: "ESTACIÓN DE CAMPO SPEC-TRL — MODO TRAZA",
    detected: "TRAZA ACÚSTICA DETECTADA",
    unknown: "REMANENCIA NO CLASIFICADA",
  },
};

export type { AnalysisState, AudioFeatures };
export type AnimalId = "crow" | "pigeon" | "duck" | "cat" | "dog" | "owl";
export type Animal = {
  id: AnimalId;
  name: string;
  scientificName: Record<Lang, string>;
  emoji: string;
  acousticProfile: {
    dominantFreqMin: number;
    dominantFreqMax: number;
    spectralCentroidMin: number;
    spectralCentroidMax: number;
    flatnessMin: number;
    flatnessMax: number;
    lowEnergyRatioMin: number;
    lowEnergyRatioMax: number;
    zcrMin: number;
    zcrMax: number;
    periodicityMin: number;
    periodicityMax: number;
    rmsMin: number;
    rmsMax: number;
    description: string;
  };
};

export const ANIMALS: Animal[] = [
  {
    id: "crow",
    name: "REMANENTIA CORVUS",
    scientificName: {
      en: "Cognitive Trace",
      fr: "Trace cognitive",
      es: "Traza cognitiva",
    },
    emoji: "📡",
    acousticProfile: {
      dominantFreqMin: 800,
      dominantFreqMax: 4000,
      spectralCentroidMin: 1200,
      spectralCentroidMax: 5000,
      flatnessMin: 0.15,
      flatnessMax: 0.45,
      lowEnergyRatioMin: 0.1,
      lowEnergyRatioMax: 0.4,
      zcrMin: 0.08,
      zcrMax: 0.25,
      periodicityMin: 0.1,
      periodicityMax: 0.5,
      rmsMin: 0.02,
      rmsMax: 0.25,
      description: "Irregular high-spectrum acoustic trace with suspicious memory-like bursts",
    },
  },
  {
    id: "pigeon",
    name: "ECHO DOMESTICA",
    scientificName: {
      en: "Domestic Remanence",
      fr: "Rémanence domestique",
      es: "Remanencia doméstica",
    },
    emoji: "🏚️",
    acousticProfile: {
      dominantFreqMin: 200,
      dominantFreqMax: 1200,
      spectralCentroidMin: 400,
      spectralCentroidMax: 2000,
      flatnessMin: 0.05,
      flatnessMax: 0.25,
      lowEnergyRatioMin: 0.3,
      lowEnergyRatioMax: 0.7,
      zcrMin: 0.02,
      zcrMax: 0.12,
      periodicityMin: 0.2,
      periodicityMax: 0.6,
      rmsMin: 0.01,
      rmsMax: 0.15,
      description: "Low-frequency domestic hums, pipes, floorboards and suspicious waiting",
    },
  },
  {
    id: "duck",
    name: "PARASITUS MINOR",
    scientificName: {
      en: "Minor Parasite Signal",
      fr: "Parasite spectral mineur",
      es: "Parásito espectral menor",
    },
    emoji: "〰️",
    acousticProfile: {
      dominantFreqMin: 300,
      dominantFreqMax: 1500,
      spectralCentroidMin: 500,
      spectralCentroidMax: 2500,
      flatnessMin: 0.05,
      flatnessMax: 0.3,
      lowEnergyRatioMin: 0.25,
      lowEnergyRatioMax: 0.65,
      zcrMin: 0.03,
      zcrMax: 0.15,
      periodicityMin: 0.15,
      periodicityMax: 0.55,
      rmsMin: 0.02,
      rmsMax: 0.2,
      description: "Bursty environmental interference with comedic confidence spikes",
    },
  },
  {
    id: "cat",
    name: "PRESENCIA POLITA",
    scientificName: {
      en: "Polite Presence",
      fr: "Présence polie",
      es: "Presencia educada",
    },
    emoji: "👻",
    acousticProfile: {
      dominantFreqMin: 500,
      dominantFreqMax: 3000,
      spectralCentroidMin: 800,
      spectralCentroidMax: 4000,
      flatnessMin: 0.08,
      flatnessMax: 0.3,
      lowEnergyRatioMin: 0.15,
      lowEnergyRatioMax: 0.5,
      zcrMin: 0.05,
      zcrMax: 0.18,
      periodicityMin: 0.1,
      periodicityMax: 0.6,
      rmsMin: 0.01,
      rmsMax: 0.2,
      description: "Soft tonal signature, possibly apologetic, possibly a fridge",
    },
  },
  {
    id: "dog",
    name: "STRUCTURA INSTABILIS",
    scientificName: {
      en: "Unstable Structure",
      fr: "Structure instable",
      es: "Estructura inestable",
    },
    emoji: "🦴",
    acousticProfile: {
      dominantFreqMin: 200,
      dominantFreqMax: 1500,
      spectralCentroidMin: 300,
      spectralCentroidMax: 2000,
      flatnessMin: 0.1,
      flatnessMax: 0.4,
      lowEnergyRatioMin: 0.2,
      lowEnergyRatioMax: 0.6,
      zcrMin: 0.06,
      zcrMax: 0.22,
      periodicityMin: 0.05,
      periodicityMax: 0.4,
      rmsMin: 0.03,
      rmsMax: 0.3,
      description: "Low-mid impact bursts, future Marty SLS candidate",
    },
  },
  {
    id: "owl",
    name: "ARCHIVUM NOCTURNA",
    scientificName: {
      en: "Nocturnal Archive",
      fr: "Archive nocturne",
      es: "Archivo nocturno",
    },
    emoji: "🌘",
    acousticProfile: {
      dominantFreqMin: 150,
      dominantFreqMax: 800,
      spectralCentroidMin: 200,
      spectralCentroidMax: 1200,
      flatnessMin: 0.03,
      flatnessMax: 0.2,
      lowEnergyRatioMin: 0.4,
      lowEnergyRatioMax: 0.8,
      zcrMin: 0.01,
      zcrMax: 0.08,
      periodicityMin: 0.3,
      periodicityMax: 0.8,
      rmsMin: 0.02,
      rmsMax: 0.2,
      description: "Low rhythmic trace, very tonal, probably judging the living",
    },
  },
];

export const SPECIES = ANIMALS.map((animal) => ({
  ...animal,
  ...ANIMAL_TEXTS[animal.id],
}));

export type Species = (typeof SPECIES)[number];
