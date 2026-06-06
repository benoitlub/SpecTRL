import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { useSpectralBeeps } from "../hooks/useSpectralBeeps";
import { MicButton } from "../components/MicButton";
import { TranslationCard } from "../components/TranslationCard";
import { SensorScreensV3 } from "../components/SensorScreensV3";
import { SpectralJournal } from "../components/SpectralJournal";
import { createSpectralJournalEntry, saveSpect