import React from 'react';
import { gistempMetadata } from '../data/gistempAnnual';
import './InfoPanel.css';

export const InfoPanel: React.FC = () => {
  return (
    <section className="info-panel-section" aria-labelledby="info-panel-title" id="about-data">
      <div className="info-panel-card">
        <div className="info-header">
          <span className="info-badge">Data Provenance & Methodology</span>
          <h2 id="info-panel-title" className="info-title">
            About the Dataset
          </h2>
          <p className="info-subtitle">
            Authoritative Earth science observations from NASA Goddard Institute for Space Studies.
          </p>
        </div>

        {/* Quick Specs Grid */}
        <div className="info-specs-grid">
          <div className="spec-card">
            <span className="spec-label">Dataset Name</span>
            <strong className="spec-value">{gistempMetadata.name}</strong>
          </div>
          <div className="spec-card">
            <span className="spec-label">Observation Period</span>
            <strong className="spec-value">{gistempMetadata.startYear}–{gistempMetadata.endYear} (146 years)</strong>
          </div>
          <div className="spec-card">
            <span className="spec-label">Measurement Units</span>
            <strong className="spec-value">{gistempMetadata.units}</strong>
          </div>
          <div className="spec-card">
            <span className="spec-label">Reference Baseline</span>
            <strong className="spec-value">{gistempMetadata.basePeriod}</strong>
          </div>
          <div className="spec-card spec-card-link">
            <span className="spec-label">Official NASA Source</span>
            <a
              href={gistempMetadata.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="spec-source-link"
              aria-label="Visit NASA GISS GISTEMP v4 dataset portal (opens in new tab)"
            >
              data.giss.nasa.gov/gistemp ↗
            </a>
          </div>
        </div>

        {/* Narrative Description & Methodology */}
        <div className="info-body-content">
          <div className="info-text-block">
            <h3 className="info-block-heading">Why This Dataset?</h3>
            <p>
              NASA’s Earth Information Center communicates planetary change—sea level, temperature,
              greenhouse gases, wildfires, water, ice—predominantly through visual dashboards,
              hyperwalls, and maps. GISTEMP v4 is one of NASA’s four headline climate “Vital Signs”
              featured across the Earth Information Center and NASA’s Scientific Visualization
              Studio (including the famous <em>Climate Spiral</em>). A continuous 146-year annual time
              series provides a verified, emotionally resonant narrative of planetary warming.
            </p>
          </div>

          <div className="info-text-block">
            <h3 className="info-block-heading">Understanding Temperature Anomaly</h3>
            <p>
              This dataset records a temperature <strong>anomaly</strong>, not absolute temperature.
              An anomaly measures the departure from a long-term reference average—specifically the
              1951–1980 baseline. Calculating anomalies eliminates local terrain and seasonal biases,
              providing a statistically rigorous measure of global climate change over land and ocean.
            </p>
          </div>

          {/* Prototype Disclaimer Box */}
          <div className="info-disclaimer-box" role="note">
            <h4 className="disclaimer-heading">
              <span className="disclaimer-icon" aria-hidden="true">ℹ️</span>
              Illustrative Dataset Snapshot (Not a Live Feed)
            </h4>
            <p className="disclaimer-body">
              This prototype bundles verified historical NASA GISTEMP v4 annual records (1880–2025)
              locally for fast, offline-safe, and demo-reliable performance without runtime API
              dependencies or external network calls. Built for the NASA Space Apps Challenge 2026
              under the challenge “The Earth Information Jukebox”—not an official NASA product.
            </p>
          </div>

          {/* Formal Citation Box */}
          <div className="citation-container">
            <span className="citation-title">Formal Scientific Citation:</span>
            <blockquote className="citation-quote">
              <code>{gistempMetadata.citation}</code>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};
