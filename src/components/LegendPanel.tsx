import React from 'react';
import './LegendPanel.css';

export const LegendPanel: React.FC = () => {
  return (
    <section className="legend-panel-section" aria-labelledby="legend-title" id="legend">
      <div className="legend-panel-card">
        <div className="legend-header">
          <div className="legend-title-wrap">
            <span className="legend-badge">Sonification Guide</span>
            <h2 id="legend-title" className="legend-title">
              Data-to-Sound Mapping Legend
            </h2>
            <p className="legend-subtitle">
              How NASA’s global temperature anomaly translates into pitch, timbre, and visual color.
            </p>
          </div>
        </div>

        <div className="legend-grid">
          {/* Mapping Card 1: Pitch */}
          <div className="legend-card">
            <div className="card-icon-header">
              <span className="mapping-icon" aria-hidden="true">🎵</span>
              <h3 className="card-dimension-title">Pitch (Oscillator Frequency)</h3>
            </div>
            <p className="card-description">
              Annual temperature anomaly ∈ <code>[-0.5, +1.3] °C</code> maps to an 11-step C-major
              pentatonic scale from <strong>C3 to C5</strong>.
            </p>
            <div className="card-metric-box">
              <div className="metric-row">
                <span className="metric-label">Frequency Range</span>
                <span className="metric-value">≈130 Hz (C3) – 523 Hz (C5)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Perception</span>
                <span className="metric-highlight">Higher pitch = warmer year</span>
              </div>
            </div>
          </div>

          {/* Mapping Card 2: Timbre */}
          <div className="legend-card">
            <div className="card-icon-header">
              <span className="mapping-icon" aria-hidden="true">✨</span>
              <h3 className="card-dimension-title">Timbre (Filter Cutoff)</h3>
            </div>
            <p className="card-description">
              The same anomaly linearly modulates a lowpass filter cutoff: cool years sound
              muffled and gentle, while warm anomalies open harmonics.
            </p>
            <div className="card-metric-box">
              <div className="metric-row">
                <span className="metric-label">Cutoff Range</span>
                <span className="metric-value">400 Hz (muffled) – 4000 Hz (bright)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Perception</span>
                <span className="metric-highlight">Brighter tone = warmer anomaly</span>
              </div>
            </div>
          </div>

          {/* Mapping Card 3: Tempo */}
          <div className="legend-card">
            <div className="card-icon-header">
              <span className="mapping-icon" aria-hidden="true">⏱️</span>
              <h3 className="card-dimension-title">Playback Time (Tempo)</h3>
            </div>
            <p className="card-description">
              Fixed tempo at <strong>4 years per second</strong>. Each annual data point is a 250 ms
              note with 10 ms attack / 150 ms release envelope to prevent clicks.
            </p>
            <div className="card-metric-box">
              <div className="metric-row">
                <span className="metric-label">Sweep Duration</span>
                <span className="metric-value">~36.5 seconds (1880–2025)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Cadence</span>
                <span className="metric-highlight">1 year = 1 discrete note</span>
              </div>
            </div>
          </div>

          {/* Mapping Card 4: Visual Color */}
          <div className="legend-card">
            <div className="card-icon-header">
              <span className="mapping-icon" aria-hidden="true">🎨</span>
              <h3 className="card-dimension-title">Chart Hue (Visual Spectrum)</h3>
            </div>
            <p className="card-description">
              Visual line and area gradient follows NASA’s standard temperature anomaly colorway:
              cool blue below baseline to vivid crimson for extreme positive anomalies.
            </p>
            <div className="color-spectrum-bar" aria-hidden="true">
              <div className="spectrum-gradient" />
              <div className="spectrum-labels">
                <span>Cool (&lt;0°C)</span>
                <span>Baseline (0°C)</span>
                <span>Warm (&gt;+1°C)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
