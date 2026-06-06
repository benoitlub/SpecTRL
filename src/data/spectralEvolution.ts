import type { Lang } from "./translations";

const STORE_KEY = "spectrl-evolution-count-v1";

type PhaseId = "indifferent" | "curious" | "petty" | "domestic_tyrant" | "attention_war" | "lucid_crack";

type Phase = {
  id: PhaseId;
  min: number;
  max: number;
  weight: number;
  lines: Record<Lang, string[]>;
};

const PHASES: Phase[] = [
  {
    id: "indifferent",
    min: 0,
    max: 4,
    weight: 1,
    lines: {
      fr: [
        "Je