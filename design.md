# Earth Jukebox — Listen to a Changing Planet
### Design Document — NASA Space Apps Challenge 2026, "The Earth Information Jukebox"

---

## 1. Vision, Problem, Solution, Challenge Alignment

**Problem.** NASA's Earth Information Center (EIC) communicates planetary change — sea level, temperature, greenhouse gases, wildfires, water, ice — almost entirely through visual dashboards and maps. That channel excludes anyone who can't easily read a chart: blind and low-vision users, people in low-bandwidth or screen-limited contexts, and anyone for whom sound simply communicates change (a trend, a spike, a record) more viscerally than a line on a graph.

**Solution.** Earth Jukebox takes one well-documented NASA Earth-science time series and lets a person *hear* it. Press Play, and 146 years of global temperature data become a rising and falling melody, perfectly synced to a moving cursor on a chart. A legend explains the mapping in plain language, so the sound is informative, not just decorative.

**Challenge alignment (verified).** The official challenge page confirms the brief: *"The Earth Information Jukebox … NASA Space Apps Challenge offers opportunities for anyone with an interest in space and science to address real-world challenges"* (spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/). The page could not be fully crawled (it blocks automated fetching), so its complete objectives/success-criteria text is not independently confirmed line-by-line. To corroborate intent, we cross-checked several independently published 2026 team write-ups of the same challenge; they consistently describe it as: *build an interface, script, or application that pairs an Earth Information Center visual/dataset with a dynamic, real-time sonification, to make NASA's visual-only climate evidence accessible through sound.* Earth Jukebox is built directly to that description.

**Source verification summary**

| Claim | Status |
|---|---|
| Challenge "The Earth Information Jukebox" exists in NASA Space Apps Challenge 2026 | ✅ Verified (official page title + intro, corroborated by multiple independent team repos citing the same challenge) |
| Challenge centers on sonifying NASA Earth Information Center (EIC) data/visuals for accessibility | ✅ Verified via consistent third-party descriptions (not the full official objectives text, which is not crawlable) |
| NASA EIC exists and covers temperature as one of its vital-sign indicators | ✅ Verified (science.nasa.gov/earth-science/earth-information-center; climate.nasa.gov "Vital Signs"; SVS Climate Vital Signs Dashboard gallery) |
| GISTEMP v4 dataset, values, and source URL | ✅ Verified directly against NASA GISS's published series (see §6) |
| 2026 global hackathon dates (Nov 14–15) | ✅ Verified via NASA Space Apps partner announcements |
| Dhaka, Bangladesh local event and an Oct 10 preliminary-submission step | ⚠️ Not independently verifiable from an official NASA calendar; taken as a **project assumption** from the brief, consistent with one independently published Dhaka-based 2026 team repo referencing an October local event |

---

## 2. MVP Scope & Primary User Journey

**In scope**
- One dataset (global surface temperature anomaly), one visualization, one sonification mode.
- Play / Pause / Stop / Volume / Timeline scrub.
- Browser-native Web Audio sonification, no backend, no auth, no paid services.
- Static, locally bundled data (fast, offline-safe, demo-reliable).

**Out of scope for Oct 10 prototype**
- Multiple datasets/tracks, live NASA API polling, 3D globes, AI narration, user accounts — all good "stretch" ideas, none required to prove the concept.

**Primary user journey**
1. Land on the page — see the planet, the title, and one clear call to action.
2. Read the one-sentence explanation of what they're about to hear.
3. Press **Play** — a melody starts, a cursor sweeps across the chart in sync.
4. Glance at the **legend** to understand why the pitch is rising.
5. **Scrub** to a specific decade (e.g., the 2020s) to hear it in isolation.
6. Adjust **volume**, **pause**, **stop** — confirm the controls all work.
7. Scroll to **credits** — see the dataset, source, and prototype disclaimer.

---

## 3. Page Layout, UI Sections, Visual Design System

**Single scrolling page, five sections:**

1. **Hero** — full-bleed NASA Earth imagery background, app title "Earth Jukebox," one-line subtitle ("Listen to a Changing Planet"), short framing sentence, scroll cue.
2. **Player** — the core experience: temperature chart with playback cursor, Play/Pause/Stop, volume slider, timeline scrubber, live readout of the current year + anomaly value.
3. **Legend** — compact panel: "pitch = temperature," "brighter tone = warmer year," color key for the chart.
4. **About the data** — dataset name, units, time range, official source link, one-paragraph plain-language explanation, "illustrative prototype" disclaimer.
5. **Footer** — NASA/GISS credit, Earth imagery credit, Space Apps Challenge disclaimer ("NASA Space Apps Challenge 2026 project — not an official NASA product").

**Visual design system**

| Token | Value / Direction |
|---|---|
| Background | Deep space navy `#070B14` → `#0B1324` subtle vertical gradient |
| Primary accent | Cyan/teal `#22D3EE` (controls, active states, cursor) |
| Secondary accent | Warm amber `#F59E0B` used sparingly (warm-anomaly highlights only) |
| Data-cool color | `#4A90D9` (below-baseline years) |
| Data-warm color | `#E85D4E` (above-baseline years) |
| Text primary | `#F1F5F9` on navy (contrast ratio ≥ 7:1) |
| Text secondary | `#94A3B8` |
| Headings | A geometric display sans (e.g., Space Grotesk) — confident, scientific, not corporate |
| Body | A high-legibility sans (e.g., Inter) |
| Motion | Subtle only: fade/slide-in on scroll, smooth cursor interpolation, gentle hover states. No parallax gimmicks, no heavy gradients/glow overload |
| Imagery | NASA Visible Earth "Blue Marble" imagery — public domain, credit required to NASA (visibleearth.nasa.gov terms: free of licensing fees, credit NASA as source) |

Design direction: restrained, observatory-console feel — closer to a mission-control dashboard than a generic AI-gradient SaaS landing page.

---

## 4. Technical Architecture

**Stack:** React + Vite + TypeScript, plain CSS (variables/modules — no CSS framework needed), native Web Audio API, zero runtime network calls.

**Component hierarchy**

```
App
├─ Header                (sticky brand mark, minimal)
├─ HeroSection            (Earth image, title, subtitle, scroll cue)
├─ PlayerSection
│   ├─ TemperatureChart   (SVG line, color gradient, playback cursor)
│   ├─ NowPlayingReadout  (year + °C anomaly, aria-live)
│   └─ PlayerControls     (Play/Pause/Stop, Volume, Timeline scrubber)
├─ LegendPanel            (pitch/brightness/color key)
├─ InfoPanel              (dataset, units, source, explanation, disclaimer)
└─ Footer                 (credits)
```

**Folder structure**

```
earth-jukebox/
├─ public/
│   └─ earth-hero.jpg            # NASA Blue Marble image, credited
├─ src/
│   ├─ audio/
│   │   ├─ audioEngine.ts        # AudioContext, scheduler, voice creation
│   │   └─ mapping.ts            # anomaly → frequency / filter cutoff / time
│   ├─ components/
│   │   ├─ Header.tsx
│   │   ├─ HeroSection.tsx
│   │   ├─ TemperatureChart.tsx
│   │   ├─ NowPlayingReadout.tsx
│   │   ├─ PlayerControls.tsx
│   │   ├─ LegendPanel.tsx
│   │   ├─ InfoPanel.tsx
│   │   └─ Footer.tsx
│   ├─ data/
│   │   └─ gistempAnnual.ts       # embedded verified GISTEMP v4 series + metadata
│   ├─ hooks/
│   │   └─ useSonification.ts    # play/pause/stop/seek/volume + playback clock
│   ├─ styles/
│   │   ├─ tokens.css            # design-system CSS variables
│   │   └─ global.css
│   ├─ App.tsx
│   └─ main.tsx
├─ index.html
├─ package.json
└─ vite.config.ts
```

**Data flow**
1. `data/gistempAnnual.ts` is imported once at startup — a typed array of `{ year, anomalyC }` plus a metadata object (source URL, units, base period, citation string).
2. `TemperatureChart` renders a static SVG path from that array immediately (visualization works even before any audio code runs).
3. On **Play**, `useSonification` creates/resumes the shared `AudioContext` (inside the click handler, to satisfy browser autoplay policy), then runs a lookahead scheduler in `audioEngine.ts` that, for each data point in order, computes frequency/filter/timing via `mapping.ts` and schedules an oscillator voice.
4. A `requestAnimationFrame` loop reads `audioContext.currentTime` (never `Date.now()`/`setInterval`, to avoid drift) to derive the current playback position, which drives both the chart cursor and the `NowPlayingReadout`.
5. **Pause** stops scheduling and freezes the position; **Stop** resets to year 0; the **volume slider** maps to a single master `GainNode`; the **timeline scrubber** seeks by recomputing the scheduler's start offset.
6. If `window.AudioContext`/`webkitAudioContext` is undefined, the app disables audio controls and shows an inline note — the chart and data remain fully visible and explorable.

---

## 5. Sonification Logic & Data-to-Sound Mapping

**Approach:** one data point (one year) = one note. A fixed tempo sweeps the full 1880–2025 series in a tidy, demo-friendly ~35–40 seconds. Two independent sound dimensions encode the same variable (anomaly) for a richer, more legible result, as the brief requires ("pitch or rhythm" — here: pitch + timbre, with a steady rhythm for clarity).

| Data dimension | Sound parameter | Mapping | Range |
|---|---|---|---|
| Annual temperature anomaly (°C vs. 1951–1980 baseline) | **Pitch** (oscillator frequency) | Linear map of anomaly ∈ `[-0.5, +1.3]` °C → position on an 11-step C-major pentatonic scale from C3 to C5 (musically pleasant, no "wrong notes") | ≈130 Hz – 523 Hz |
| Same anomaly value | **Timbre brightness** (lowpass filter cutoff) | Linear map of anomaly → cutoff `400 Hz` (cool, muffled) to `4000 Hz` (warm, bright) | 400–4000 Hz |
| Year index in sequence | **Playback time** | Fixed tempo, ≈4 years/second; each note ~250 ms with a 10 ms attack / 150 ms release envelope to avoid clicks | ~36 s for full 146-year sweep |
| Chart color (visual, not audio) | **Hue** | Same anomaly value mapped to a blue → white → red gradient, matching NASA's own anomaly-map convention | `#4A90D9` → `#E85D4E` |

**Scheduling pattern:** classic Web Audio "lookahead scheduler" — a short-interval JS timer stays a fraction of a second ahead of real playback and schedules exact-time audio events via `audioContext.currentTime`, so the visual cursor (driven by the same clock) never drifts out of sync with what's audible, even under JS main-thread jitter.

---

## 6. Dataset Strategy, Source, Attribution, Limitations

**Chosen dataset:** NASA GISS Surface Temperature Analysis, version 4 (**GISTEMP v4**) — annual global mean land-ocean temperature anomaly, °C, relative to the 1951–1980 base period, 1880–present.

- **Official source:** https://data.giss.nasa.gov/gistemp/ (NASA Goddard Institute for Space Studies)
- **Why this dataset:** it is one of NASA's four headline climate "Vital Signs" (climate.nasa.gov), it is directly featured in the Earth Information Center's own hyperwall gallery (the "NASA Climate Spiral 1880–Present" and "Global Temperature Graph 1880–2024," per the SVS Climate Vital Signs Dashboard), it is a single clean numeric series (ideal for sonification), and it is long enough (146 years) to produce an emotionally legible "the planet is warming" arc.
- **Attribution (use verbatim in the app's About section):** *"GISTEMP Team, 2025: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed at https://data.giss.nasa.gov/gistemp/."*
- **Sample of verified values** (full precision annual series — not fabricated, confirmed against NASA GISS's published numbers — must be embedded in full in `data/gistempAnnual.ts`; shown here as a decadal sample):

| Year | Anomaly (°C vs. 1951–1980) |
|---|---|
| 1880 | −0.18 |
| 1900 | −0.09 |
| 1920 | −0.28 |
| 1940 | +0.12 |
| 1960 | −0.03 |
| 1980 | +0.26 |
| 2000 | +0.39 |
| 2010 | +0.72 |
| 2016 | +1.01 |
| 2020 | +1.01 |
| 2023 | +1.17 |
| 2024 | +1.29 |
| 2025 | +1.19 |

**Limitations (state these explicitly in-app):**
- Annual resolution only — no sub-year detail, no live/real-time feed.
- This is historical, published data bundled locally for a reliable offline demo, **not** a live NASA API integration. The in-app disclaimer must say so plainly ("illustrative dataset snapshot, not a live feed").
- Anomaly, not absolute temperature — must be labeled as "difference from the 1951–1980 average," not "the temperature."
- For implementation, pull the authoritative full series directly from NASA GISS's own CSV/TXT export at data.giss.nasa.gov (not a third-party mirror) so the embedded numbers trace to the primary source.

---

## 7. Functional Acceptance Criteria & Demonstration Flow

**Acceptance criteria**
- [ ] Chart renders the full 1880–2025 series with correct shape (visually matches NASA's own published temperature graph trend).
- [ ] Play produces audible tones whose pitch rises and falls with the real data, starting only after a user gesture.
- [ ] Visual cursor stays synchronized with audio within one data point for a full, uninterrupted run.
- [ ] Pause preserves position and resumes correctly; Stop resets to the start and silences output.
- [ ] Volume slider audibly changes loudness across its range.
- [ ] Timeline scrubber seeks both audio and cursor to the chosen year.
- [ ] Legend text accurately matches the mapping table in §5.
- [ ] Page is usable at mobile (~360px), tablet, and desktop widths with no overlap or horizontal scroll.
- [ ] All controls are keyboard-operable with visible focus states and descriptive `aria-label`s.
- [ ] If Web Audio is unavailable, the app still loads and displays the chart/legend/info, with a visible non-blocking notice instead of a broken Play button.

**Short demonstration flow (fits inside the existing 240-second video)**
1. *(0:00–0:10)* Hero shot — "NASA's Earth Information Center shows us a changing planet. Earth Jukebox lets you hear it."
2. *(0:10–0:25)* Point at the chart and legend — explain the pitch/brightness mapping in one sentence.
3. *(0:25–1:00)* Press Play — let the 1880→2025 sweep play through, calling out audibly brighter/higher tones at 2016 and 2023–2024.
4. *(1:00–1:20)* Scrub to the 2020s to replay the recent record-warm years in isolation.
5. *(1:20–1:35)* Demonstrate Volume and Pause/Stop.
6. *(1:35–end)* Close on the About/credits panel — dataset, source, and "2026 Space Apps prototype" disclaimer.
