# Earth Jukebox — Listen to a Changing Planet

**NASA Space Apps Challenge 2026** · *Challenge Brief: "The Earth Information Jukebox"*

![Earth Jukebox Hero Screenshot](./public/earth-hero.jpg)

---

## 1. Overview & Vision

NASA’s Earth Information Center (EIC) communicates planetary change—sea level, temperature, greenhouse gases, wildfires, water, ice—almost entirely through visual dashboards and maps. That channel excludes anyone who cannot easily read a chart: blind and low-vision users, people in screen-limited contexts, and anyone for whom sound simply communicates change (a trend, a spike, a record) more viscerally than a line on a graph.

**Earth Jukebox** sonifies NASA's **GISTEMP v4** global surface temperature anomaly data (**1880–2025**; 146 annual observations) so people can **hear** a changing planet, not just see it. Press Play, and 146 years of global temperature data become a rising and falling melody, synchronized to a moving cursor on a vector chart.

---

## 2. Data-to-Sound Mapping System

| Data Dimension | Audio Parameter | Implementation Range | Perception |
|---|---|---|---|
| **Annual Temperature Anomaly** (`[-0.5, +1.3] °C`) | **Pitch** | 11-step C-major pentatonic scale (`130.81 Hz – 523.25 Hz`) from C3 to C5 | Higher pitch = warmer planet (musically pleasant, no dissonance) |
| **Annual Temperature Anomaly** (`[-0.5, +1.3] °C`) | **Timbre (Filter Cutoff)** | Linear lowpass filter cutoff (`400 Hz – 4000 Hz`) | Cool years sound muffled; record-warm years open bright harmonics |
| **Observation Year** (`1880–2025`) | **Rhythm & Tempo** | Fixed tempo at 4 years/second (250 ms per note; 10 ms attack, 150 ms release) | ~36.5-second complete sweep across 146 years |
| **Chart Value** (Visual) | **Colorway** | Blue (`#4A90D9`) → Neutral (`#CBD5E1`) → Warm Amber (`#F59E0B`) → Red (`#E85D4E`) | Visual reinforcement matching NASA anomaly convention |

---

## 3. Key Features

- **Browser-Native Web Audio Synthesis**: Zero external audio libraries; pure Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`).
- **Sample-Accurate Lookahead Scheduler**: Synchronized via `audioContext.currentTime` inside a `requestAnimationFrame` loop, immune to main-thread JavaScript jitter.
- **Full Player Deck**: Play, Pause, Stop, Volume slider (0–100%), continuous timeline scrubber, and quick-jump milestone chips (`1880`, `1940`, `1980 Baseline`, `2016`, `2024 Record`).
- **Universal Accessibility (WCAG AA)**: Full keyboard navigation (`Tab`, `Space`, `Enter`, Arrow keys), high-contrast observatory theme (>7:1 contrast ratio), and dynamic `aria-live="polite"` screen-reader announcements.
- **Zero Runtime API Calls**: All 146 verified GISTEMP v4 points are bundled locally in `src/data/gistempAnnual.ts` for instant offline reliability.
- **NASA Blue Marble Imagery**: Public domain hero background from NASA Visible Earth with atmospheric glow.

---

## 4. Dataset & Attribution

- **Dataset**: NASA Goddard Institute for Space Studies (GISS) Surface Temperature Analysis, version 4 (**GISTEMP v4**).
- **Time Range**: 1880–2025 (146 annual means, land-ocean temperature index).
- **Reference Baseline**: 1951–1980 (30-year climatological normal).
- **Official Source**: [https://data.giss.nasa.gov/gistemp/](https://data.giss.nasa.gov/gistemp/)
- **Attribution Citation**:
  > *GISTEMP Team, 2025: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed at https://data.giss.nasa.gov/gistemp/.*
- **Prototype Disclaimer**:
  > *Built as an illustrative prototype for the NASA Space Apps Challenge 2026. This is not an official NASA product. All data is bundled locally from historical published series for demonstration reliability without live feeds.*

---

## 5. Technology Stack & Project Structure

- **Framework**: React 19 + TypeScript + Vite 8
- **Audio**: Web Audio API
- **Styling**: Vanilla CSS with observatory console design tokens (`src/styles/tokens.css`)

```
earth-jukebox/
├── public/
│   ├── earth-hero.jpg           # NASA Blue Marble imagery (public domain)
│   ├── favicon.svg              # App icon
│   └── favicon.ico
├── src/
│   ├── audio/
│   │   ├── audioEngine.ts       # AudioContext singleton, master gain, voice synthesizer
│   │   └── mapping.ts           # Pure anomaly → frequency / cutoff mapping & tempo
│   ├── components/
│   │   ├── Header.tsx           # Sticky brand mark & challenge pill
│   │   ├── HeroSection.tsx      # Blue Marble imagery, mission framing & CTA
│   │   ├── PlayerSection.tsx    # Deck grouping readout, chart, and controls
│   │   ├── NowPlayingReadout.tsx# Large year & °C readout, climate tag, aria-live
│   │   ├── TemperatureChart.tsx # SVG vector line chart, gradient, cursor marker
│   │   ├── PlayerControls.tsx   # Play/Pause/Stop, volume slider, timeline scrubber
│   │   ├── LegendPanel.tsx      # Data-to-sound & visual color guide cards
│   │   ├── InfoPanel.tsx        # Dataset specs, anomaly explanation, citation
│   │   └── Footer.tsx           # NASA GISS attribution & hackathon disclaimer
│   ├── data/
│   │   └── gistempAnnual.ts     # Authoritative 1880–2025 dataset & metadata
│   ├── hooks/
│   │   └── useSonification.ts   # Lookahead scheduler & clock sync hook
│   ├── styles/
│   │   ├── tokens.css           # Observatory design system CSS variables
│   │   └── global.css           # Global resets, containers, responsive layout
│   ├── App.tsx
│   └── main.tsx
├── design.md                    # Core design & challenge specifications
├── phases.md                    # 4-phase implementation plan & smoke checklist
├── package.json
└── vite.config.ts
```

---

## 6. Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/jaherunhasanrimon/NasaSpaceApp1stPrototype_Earth-Jukebox-Listen-to-a-Changing-Planet.git
cd NasaSpaceApp1stPrototype_Earth-Jukebox-Listen-to-a-Changing-Planet

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build & Linting
```bash
# Build optimized production bundle
npm run build

# Run linter
npm run lint
```

---

## 7. License

Open Science prototype developed for the NASA Space Apps Challenge 2026. Public domain NASA imagery and public climate data used in accordance with NASA guidelines.
