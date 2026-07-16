import type { Lang } from "../../data/animals";

export type UniversalKnowledge = {
  contract?: string;
  observationId?: string;
  recordedAt?: string;
  relations?: Array<{ targetId?: string; relationType?: string; strength?: number }>;
  aggregates?: {
    relatedCount?: number;
    observedCount?: number;
    firstRelatedAt?: string;
    lastRelatedAt?: string;
  };
  trend?: { direction?: string; window?: string };
};

export type SpectrlKnowledgeInsight = {
  coherenceScore: number;
  noveltyScore: number;
  narrativeLevel: "new" | "emerging" | "familiar" | "persistent";
  relatedCount: number;
  strongestRelation: number;
  trend: string;
  message: Record<Lang, string>;
  sourceContract?: string;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function readUniversalKnowledge(output: Record<string, unknown> | undefined): UniversalKnowledge | undefined {
  const value = output?.knowledge;
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UniversalKnowledge
    : undefined;
}

export function translateUniversalKnowledge(knowledge: UniversalKnowledge): SpectrlKnowledgeInsight {
  const relations = Array.isArray(knowledge.relations) ? knowledge.relations : [];
  const relatedCount = Number(knowledge.aggregates?.relatedCount ?? relations.length ?? 0);
  const observedCount = Math.max(1, Number(knowledge.aggregates?.observedCount ?? relatedCount + 1));
  const strongestRelation = relations.reduce((max, relation) => {
    const strength = typeof relation.strength === "number" ? relation.strength : 0;
    return Math.max(max, strength);
  }, 0);
  const recurrenceRatio = Math.min(1, relatedCount / Math.max(1, observedCount - 1));
  const trend = knowledge.trend?.direction ?? "unknown";
  const trendBonus = trend === "increasing" ? 10 : trend === "stable" ? 5 : 0;

  const coherenceScore = clampScore(strongestRelation * 62 + recurrenceRatio * 28 + trendBonus);
  const noveltyScore = clampScore(100 - strongestRelation * 72 - Math.min(24, relatedCount * 6));
  const narrativeLevel: SpectrlKnowledgeInsight["narrativeLevel"] = relatedCount >= 8 && coherenceScore >= 75
    ? "persistent"
    : relatedCount >= 3 && coherenceScore >= 55
      ? "familiar"
      : relatedCount >= 1
        ? "emerging"
        : "new";

  const messages: Record<SpectrlKnowledgeInsight["narrativeLevel"], Record<Lang, string>> = {
    new: {
      fr: "Marty n’a encore aucun écho fiable pour cette trace.",
      en: "Marty has no reliable echo for this trace yet.",
      es: "Marty todavía no encuentra un eco fiable para esta traza.",
    },
    emerging: {
      fr: "Un premier écho apparaît dans les archives.",
      en: "A first echo is appearing in the archive.",
      es: "Aparece un primer eco en el archivo.",
    },
    familiar: {
      fr: "Cette trace devient familière. Marty reconnaît sa famille.",
      en: "This trace is becoming familiar. Marty recognizes its family.",
      es: "Esta traza se vuelve familiar. Marty reconoce su familia.",
    },
    persistent: {
      fr: "Cette signature persiste dans la mémoire. Marty la reconnaît clairement.",
      en: "This signature persists in memory. Marty clearly recognizes it.",
      es: "Esta firma persiste en la memoria. Marty la reconoce claramente.",
    },
  };

  return {
    coherenceScore,
    noveltyScore,
    narrativeLevel,
    relatedCount,
    strongestRelation: Math.round(strongestRelation * 100) / 100,
    trend,
    message: messages[narrativeLevel],
    sourceContract: knowledge.contract,
  };
}
