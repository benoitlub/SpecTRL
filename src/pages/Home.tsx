import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { useSpectralBeeps } from "../hooks/useSpectralBeeps";
import { ParticleField } from "../components/ParticleField";
import { MicButton } from "../components/MicButton";
import { TranslationCard } from "../components/TranslationCard";
import { IntroOverlay } from "../