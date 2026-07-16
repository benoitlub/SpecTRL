export type DetectionSnapshot = {
  id: string;
  createdAt: string;
  signatureName: string;
  confidence: number;
  habitat: string;
  emotionalState: string;
  anomalyLevel: string;
  metrics: {
    dominantFreq?: number;
    spectralCentroid?: number;
    rms?: number;
    resonance?: number;
    clarity?: number;
  };
};

export type DetectionEnrichment = {
  version: "spectrl-enrichment-v1";
  novelty: "new" | "rare" | "recurring" | "persistent";
  recurrenceCount: number;
  similarDetectionIds: string[];
  nearestFrequencyDeltaHz?: number;
  confidenceTrend: "rising" | "stable" | "falling" | "unknown";
  averagePreviousConfidence?: number;
  contextTags: string[];
  summary: string;
};

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function average(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function enrichDetection(
  current: DetectionSnapshot,
  history: DetectionSnapshot[],
): DetectionEnrichment {
  const sameSignature = history.filter(item => normalized(item.signatureName) === normalized(current.signatureName));
  const sameHabitat = history.filter(item => normalized(item.habitat) === normalized(current.habitat));
  const similar = history.filter(item => {
    if (normalized(item.signatureName) === normalized(current.signatureName)) return true;
    const a = item.metrics.dominantFreq;
    const b = current.metrics.dominantFreq;
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(Number(a) - Number(b)) <= 120;
  });

  const deltas = history
    .map(item => {
      const a = item.metrics.dominantFreq;
      const b = current.metrics.dominantFreq;
      return Number.isFinite(a) && Number.isFinite(b) ? Math.abs(Number(a) - Number(b)) : undefined;
    })
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b);

  const previousConfidence = sameSignature.map(item => item.confidence).filter(Number.isFinite);
  const averagePreviousConfidence = average(previousConfidence);
  const confidenceTrend = averagePreviousConfidence == null
    ? "unknown"
    : current.confidence >= averagePreviousConfidence + 5
      ? "rising"
      : current.confidence <= averagePreviousConfidence - 5
        ? "falling"
        : "stable";

  const recurrenceCount = sameSignature.length;
  const novelty = recurrenceCount === 0
    ? "new"
    : recurrenceCount === 1
      ? "rare"
      : recurrenceCount <= 4
        ? "recurring"
        : "persistent";

  const contextTags = [
    novelty,
    confidenceTrend !== "unknown" ? `confidence:${confidenceTrend}` : "",
    sameHabitat.length ? "known-habitat" : "new-habitat",
    current.anomalyLevel ? `anomaly:${normalized(current.anomalyLevel)}` : "",
    current.emotionalState ? `state:${normalized(current.emotionalState)}` : "",
  ].filter(Boolean);

  const summaryParts = [
    novelty === "new" ? "Nouvelle signature" : `${recurrenceCount} occurrence${recurrenceCount > 1 ? "s" : ""} antérieure${recurrenceCount > 1 ? "s" : ""}`,
    confidenceTrend === "unknown" ? "sans tendance de confiance" : `confiance ${confidenceTrend}`,
    deltas[0] != null ? `écart fréquentiel minimal ${Math.round(deltas[0])} Hz` : "sans comparaison fréquentielle",
  ];

  return {
    version: "spectrl-enrichment-v1",
    novelty,
    recurrenceCount,
    similarDetectionIds: similar.slice(0, 5).map(item => item.id),
    ...(deltas[0] != null ? { nearestFrequencyDeltaHz: Math.round(deltas[0]) } : {}),
    confidenceTrend,
    ...(averagePreviousConfidence != null ? { averagePreviousConfidence } : {}),
    contextTags,
    summary: summaryParts.join(" · "),
  };
}
