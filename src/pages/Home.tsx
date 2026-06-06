import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { MicButton } from "../components/MicButton";
import { TranslationCard } from "../components/TranslationCard";
import { SensorScreensV3 } from "../components/SensorScreensV3";
import { SpeciesPanel, EmotionalPanel, ThreatPanel, BiologicalPanel, NeuralPanel, EnvironmentPanel } from "../components/AnalysisPanels";
import { UI_LABELS } from "../data/animals";

function getSignalPercent(audioFeatures: any, progress: number) {
  const rawSignal = Math