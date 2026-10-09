import React from 'react';
import './NowPlayingReadout.css';

interface NowPlayingReadoutProps {
  year: number;
  anomalyC: number;
  isPlaying?: boolean;
}

export const NowPlayingReadout: React.FC<NowPlayingReadoutProps> = ({
  year,
  anomalyC,
  isPlaying = false,
}) => {
  const isAboveBaseline = anomalyC >= 0;
  const formattedAnomaly = `${isAboveBaseline ? '+' : ''}${anomalyC.toFixed(2)} °C`;

  // Status classification
  let statusText = 'Near 1951–1980 baseline';
  let statusClass = 'status-neutral';

  if (anomalyC > 1.0) {
    statusText = 'Extreme Warming Anomaly';
    statusClass = 'status-extreme';
  } else if (anomalyC > 0.4) {
    statusText = 'Significant Warming Trend';
    statusClass = 'status-warm';
  } else if (anomalyC > 0.05) {
    statusText = 'Above Baseline';
    statusClass = 'status-moderate-warm';
  } else if (anomalyC < -0.2) {
    statusText = 'Cooler Global Mean';
    statusClass = 'status-cool';
  } else if (anomalyC < -0.05) {
    statusText = 'Below Baseline';
    statusClass = 'status-moderate-cool';
  }

  return (
    <div className="now-playing-container" role="region" aria-label="Now Playing Readout">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Year ${year}: ${formattedAnomaly} relative to the 1951 to 1980 average baseline.`}
      </div>

      <div className="readout-card">
        <div className="readout-status-bar">
          <div className="readout-status-indicator">
            <span className={`status-dot ${isPlaying ? 'pulse-active' : ''}`} />
            <span className="readout-status-label">
              {isPlaying ? 'Sonification Active' : 'Timeline Selected'}
            </span>
          </div>
          <span className={`readout-climate-badge ${statusClass}`}>{statusText}</span>
        </div>

        <div className="readout-main-stats">
          <div className="stat-group stat-year">
            <span className="stat-label">Observation Year</span>
            <span className="stat-value year-value" id="readout-current-year">
              {year}
            </span>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="stat-group stat-anomaly">
            <span className="stat-label">Global Anomaly (vs 1951–1980)</span>
            <span
              className={`stat-value anomaly-value ${isAboveBaseline ? 'anomaly-warm' : 'anomaly-cool'}`}
              id="readout-current-anomaly"
            >
              {formattedAnomaly}
            </span>
          </div>
        </div>

        <div className="readout-footer-note">
          <span>
            {year >= 2015
              ? 'Among the warmest recorded years in NASA GISTEMP historical observation.'
              : year <= 1910
              ? 'Early industrial baseline era with modest natural temperature fluctuations.'
              : 'Mid-20th century reference period with moderate global variance.'}
          </span>
        </div>
      </div>
    </div>
  );
};
