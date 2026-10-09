# Earth Jukebox — Implementation Phases
### For Google Antigravity · companion to `design.md` · target: Oct 10 preliminary submission

> Before Phase 1: if a project scaffold already exists in the workspace, inspect its current stack and file layout first, and adapt the tasks below to it instead of reinitializing. Otherwise, start from Phase 1.
> All four phases reference `design.md` for exact values (palette, mapping table, folder structure, attribution text) — do not re-derive them, just implement them.

---

## Phase 1 — Foundation

**Tasks**
1. Scaffold a Vite + React + TypeScript project.
2. Create the folder structure exactly as specified in `design.md` §4 (`src/audio`, `src/components`, `src/data`, `src/hooks`, `src/styles`).
3. Add `src/styles/tokens.css` with the CSS variables from the visual design system table in `design.md` §3 (colors, fonts).
4. Create `src/data/gistempAnnual.ts`: a typed array of `{ year: number; anomalyC: number }` for the full 1880–2025 GISTEMP v4 annual series (146 points), sourced from NASA GISS's own export at `https://data.giss.nasa.gov/gistemp/` — plus an exported metadata object (`sourceUrl`, `units`, `basePeriod: "1951–1980"`, `citation`). Spot-check at least the decadal values listed in `design.md` §6 to confirm correctness.
5. Build a static, unstyled-to-minimally-styled page shell: `Header`, `HeroSection` (with a placeholder/credit line for the Earth image — the real image can be added in Phase 4), `Footer`. No audio or chart logic yet.
6. Wire `App.tsx` to render the shell sections in order.

**Relevant files:** `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/data/gistempAnnual.ts`, `src/components/Header.tsx`, `src/components/HeroSection.tsx`, `src/components/Footer.tsx`

**Completion criteria**
- `npm run dev` runs with zero console errors and renders a styled (navy/cyan) page shell.
- `gistempAnnual.ts` exports 146 entries; the 2024 entry equals +1.29 (±0.01); the metadata object includes a working `sourceUrl`.

**Copy-ready Antigravity instruction:**
> Scaffold a Vite + React + TypeScript app called "earth-jukebox". Create this folder structure: `src/audio/`, `src/components/`, `src/data/`, `src/hooks/`, `src/styles/`. In `src/styles/tokens.css` define CSS variables for a deep-space-navy background (`#070B14`→`#0B1324`), cyan accent `#22D3EE`, amber accent `#F59E0B`, cool-data color `#4A90D9`, warm-data color `#E85D4E`, text colors `#F1F5F9`/`#94A3B8`. In `src/data/gistempAnnual.ts`, create a typed `{year, anomalyC}[]` array with NASA GISTEMP v4 annual global temperature anomaly data for 1880–2025 (source: data.giss.nasa.gov/gistemp), plus a metadata export with sourceUrl, units "°C vs 1951–1980 baseline", and a citation string. Build minimal `Header`, `HeroSection`, and `Footer` components and wire them into `App.tsx`. No audio or charting yet — just a clean, styled static shell that runs with `npm run dev` with no console errors.

---

## Phase 2 — UI: Visualization, Legend, Controls Shell

**Tasks**
1. Build `TemperatureChart.tsx`: an SVG line chart of the full `gistempAnnual` series — x-axis = year, y-axis = °C anomaly, line/fill colored on the blue→white→red gradient from `design.md` §5. Accept a `progress: number (0–1)` prop and render a cursor line/marker at that position (static for now — no audio wiring).
2. Build `LegendPanel.tsx` with the static copy explaining pitch/brightness/color, matching `design.md` §5's mapping table.
3. Build `InfoPanel.tsx`: dataset name, units, base period, source link, one-paragraph explanation, and the "illustrative dataset snapshot, not a live feed" disclaimer from `design.md` §6.
4. Build `PlayerControls.tsx` as a UI shell only: Play/Pause/Stop buttons, a volume slider, a timeline scrubber — local component state, emitting callback props (`onPlay`, `onPause`, `onStop`, `onVolumeChange`, `onSeek`) with no real audio behind them yet.
5. Build `NowPlayingReadout.tsx` showing a static placeholder year/value (wired for real data in Phase 3).
6. Full responsive pass across mobile/tablet/desktop breakpoints.
7. Apply the restrained motion spec from `design.md` §3 (fade/slide-in on scroll, smooth states, no heavy effects).

**Relevant files:** `src/components/TemperatureChart.tsx`, `LegendPanel.tsx`, `InfoPanel.tsx`, `PlayerControls.tsx`, `NowPlayingReadout.tsx`, `src/styles/global.css`

**Completion criteria**
- Dragging the (not-yet-audio-wired) timeline scrubber visibly moves the cursor on the chart.
- Legend and InfoPanel copy match `design.md` §5–6 exactly.
- Layout holds with no overlap/horizontal scroll at ~360px, ~768px, and ≥1280px widths.
- All text/background pairs pass a manual WCAG AA contrast check.

**Copy-ready Antigravity instruction:**
> Build the visual (non-audio) UI for Earth Jukebox using the data from `src/data/gistempAnnual.ts`. Create `TemperatureChart.tsx`: an SVG line chart (x = year 1880–2025, y = °C anomaly), colored on a blue (`#4A90D9`) to red (`#E85D4E`) gradient by value, accepting a `progress` prop (0–1) that positions a cursor marker. Create `LegendPanel.tsx` explaining that pitch tracks temperature and brightness tracks warmth, with a color key. Create `InfoPanel.tsx` with the dataset name "NASA GISTEMP v4," units "°C vs 1951–1980 baseline," a link to data.giss.nasa.gov/gistemp, a one-paragraph explanation, and a disclaimer that this is a bundled historical snapshot, not a live feed. Create `PlayerControls.tsx` with Play/Pause/Stop buttons, a volume slider, and a timeline scrubber, wired to local state and callback props only (no audio yet). Make the whole layout responsive from 360px to desktop, with AA-contrast text and smooth hover/focus states.

---

## Phase 3 — Functional Sonification

**Tasks**
1. Implement `src/audio/mapping.ts`: pure functions `anomalyToFrequency(anomalyC): number` (linear-to-pentatonic-step mapping per `design.md` §5), `anomalyToFilterCutoff(anomalyC): number`, and a tempo constant (`YEARS_PER_SECOND = 4`).
2. Implement `src/audio/audioEngine.ts`: a singleton `AudioContext`, a master `GainNode` (volume), and a lookahead scheduler function that, given a start year and the current `audioContext.currentTime`, schedules one oscillator+filter+gain "voice" per remaining data point at its exact computed time (10 ms attack / 150 ms release envelope per note).
3. Implement `src/hooks/useSonification.ts`: exposes `play()`, `pause()`, `stop()`, `seek(year)`, `setVolume(v)`, and reactive `isPlaying` / `currentYear` / `progress` state, driven by a `requestAnimationFrame` loop reading `audioContext.currentTime` (not wall-clock timers).
4. Wire `PlayerControls`, `TemperatureChart`'s `progress` prop, and `NowPlayingReadout` to this hook's live state.
5. Ensure the `AudioContext` is only created/resumed inside the Play button's click handler (autoplay-policy compliant); handle tab-backgrounding by resuming the context on refocus if needed.
6. Add an `aria-live="polite"` region that announces "{year}: {anomaly} °C vs the 1951–1980 average" as playback advances.
7. Feature-detect `window.AudioContext ?? window.webkitAudioContext`; if absent, disable Play/volume, show an inline fallback notice, and leave the chart/legend/info fully visible and explorable.

**Relevant files:** `src/audio/mapping.ts`, `src/audio/audioEngine.ts`, `src/hooks/useSonification.ts`, `src/components/PlayerControls.tsx`, `TemperatureChart.tsx`, `NowPlayingReadout.tsx`

**Completion criteria**
- Play produces audible tones whose pitch and brightness track the real 1880–2025 anomaly curve.
- Cursor and audio stay in sync within ~1 data point across a full, uninterrupted run (~36 s).
- Pause/resume preserves position exactly; Stop resets to year 1880 and silences output immediately.
- Volume slider audibly changes loudness across its full range, including near-silence at 0.
- Dragging the scrubber mid-playback seeks both audio and cursor without glitching.

**Copy-ready Antigravity instruction:**
> Implement real Web Audio sonification for Earth Jukebox. In `src/audio/mapping.ts`, write `anomalyToFrequency()` mapping the anomaly range [-0.5, +1.3]°C onto an 11-step C-major pentatonic scale from C3 (130.81Hz) to C5 (523.25Hz), and `anomalyToFilterCutoff()` mapping the same range linearly to a 400–4000Hz lowpass cutoff. In `src/audio/audioEngine.ts`, build a singleton AudioContext with a master GainNode for volume, and a lookahead scheduler that plays one short oscillator+filter note per year at 4 years/second (10ms attack, 150ms release), using `audioContext.currentTime` as the only clock. In `src/hooks/useSonification.ts`, expose play/pause/stop/seek/setVolume plus live isPlaying/currentYear/progress state via requestAnimationFrame. Wire this into PlayerControls, the chart's cursor, and NowPlayingReadout (including an aria-live announcement of the current year and value). Only create/resume the AudioContext inside the Play click handler. If the Web Audio API isn't available, disable audio controls and show a visible fallback message while keeping the chart and data panels fully usable.

---

## Phase 4 — Testing & Polish

**Tasks**
1. Add the real NASA Visible Earth Blue Marble hero image (credited per `design.md` §3) and finalize spacing/typography.
2. Cross-browser smoke pass (Chrome + at least one of Firefox/Safari) focused on Web Audio behavior and autoplay policy.
3. Responsive smoke pass at ~360px, ~768px, ≥1280px.
4. Keyboard-only pass: confirm Tab order, Space/Enter triggers Play, arrow keys operate the volume slider and scrubber.
5. Contrast check on every text/control state (default, hover, focus, disabled).
6. Edge-case hardening: rapid repeated Play/Pause/Stop clicks, seeking while playing, seeking to the final year, resizing mid-playback, backgrounding/refocusing the tab.
7. Respect `prefers-reduced-motion` for all transitions.
8. Finalize the "About this prototype" disclaimer copy (illustrative dataset snapshot, not live, not an official NASA product, 2026 Space Apps Challenge entry) in `InfoPanel`/`Footer`.
9. Run through the full Final Smoke Tests checklist below and fix anything that fails.

**Relevant files:** `src/components/HeroSection.tsx`, `src/styles/global.css`, all interactive components, `public/earth-hero.jpg`

**Completion criteria:** every item in the Final Smoke Tests checklist passes.

**Copy-ready Antigravity instruction:**
> Polish and harden Earth Jukebox for submission. Add the NASA Visible Earth Blue Marble hero image with a visible NASA credit line. Do a full responsive pass at 360px/768px/1280px+, a keyboard-only pass (Tab order, Space/Enter on Play, arrow keys on sliders), and a contrast check on every control state. Harden against rapid Play/Pause/Stop clicking, seeking while playing, seeking to the last year, and resizing or backgrounding the tab mid-playback — none of these should desync audio from the visual cursor or crash the app. Respect `prefers-reduced-motion`. Finalize the in-app disclaimer: this is an illustrative historical dataset snapshot (not a live feed) built as a NASA Space Apps Challenge 2026 prototype, not an official NASA product. Then run through every item in the Final Smoke Tests checklist in `phases.md` and fix any failures.

---

## Final Smoke Tests

- [ ] **Audio playback** — Play starts sound on the first click; Pause stops sound without resetting position; Stop resets to 1880 and silences output.
- [ ] **Timeline synchronization** — the visual cursor matches the currently audible year within ~1 data point across a full, uninterrupted playback.
- [ ] **Controls** — volume slider audibly changes loudness across its full range (including near-mute at 0); scrubbing seeks both audio and cursor to the chosen year, during playback and while paused.
- [ ] **Responsiveness** — no horizontal scroll or overlapping elements at ~360px, ~768px, or ≥1280px.
- [ ] **Error handling** — app loads and shows the chart/legend/info panel even where Web Audio is blocked or unsupported, with a visible non-blocking notice; rapid repeated Play/Pause/Stop clicks don't crash the app or desync audio from the cursor.
- [ ] **Accessibility** — every control is reachable and operable by keyboard alone; Play/Pause/Stop/Volume/Timeline all have descriptive `aria-label`s; text/background contrast meets WCAG AA; the aria-live readout announces year/value changes during playback.
- [ ] **Data integrity** — spot-checked values (1880, 1998, 2016, 2024) in the chart and readout match the sourced GISTEMP v4 annual means in `design.md` §6.
