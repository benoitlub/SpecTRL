# SpecTRL - Codex task: SLS resonance audio

Goal: make the sound react to the SLS camera traces.

Current state:
- `src/slsResonanceRuntime.ts` creates slow visual traces over the SLS camera window.
- `src/slsAuto.ts` starts that runtime.
- `src/sls-resonance.css` styles the trace canvas and label.
- `src/main.tsx` imports `./sls-resonance.css` and `./slsAuto`.
- `src/hooks/useSpectralBeeps.ts` currently controls scan audio.

What to build:
1. In `slsResonanceRuntime.ts`, expose a tiny global state:
   - `window.__spectrlSlsResonance = { density: number, pulse: number }`
   - `density` comes from the trace pixel density.
   - `pulse` rises when density rises, then decays slowly.

2. In `useSpectralBeeps.ts`, read that global state and use it to shape sound:
   - more low resonance when SLS density is high;
   - fewer bright UI/game beeps;
   - slower low pulses around 24-90 Hz;
   - narrow filters and longer fades;
   - radio bed should feel unstable, not playful.

3. Keep the sound button logic working:
   - off = no sound;
   - low = restrained;
   - high = present but not painful.

4. Desired feel:
   - a quiet room;
   - low radio pressure;
   - traces that seem to hum when they persist;
   - no arcade beep.

Manual test:
- open `https://benoitlub.github.io/SpecTRL/?v=sls-resonance-audio`
- enable sound high
- start listening
- open SLS camera
- move a hand slowly in front of the camera
- verify that visual traces persist and the audio becomes lower, slower, and more tense.
