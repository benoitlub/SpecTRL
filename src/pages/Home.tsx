import { useEffect, useRef, useState } from "react";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { useSpectralBeeps } from "../hooks/useSpectralBeeps";
import { ParticleField } from "../components/ParticleField";
import { MicButton } from "../components/MicButton";
import { TranslationCard } from "../components/TranslationCard";
import { IntroOverlay } from "../components/IntroOverlay";
import { SensorScreensV3 } from "../components/SensorScreensV3";
import { SpectralJournal } from "../components/SpectralJournal";
import { UI_LABELS, type Lang } from "../data/animals";
import { createSpectralJournalEntry, saveSpectralJournalEntry, type SpectralJournalEntry } from "