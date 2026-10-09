import React from 'react';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-title">
      <div className="hero-backdrop" aria-hidden="true">
        <div className="hero-earth-image-wrapper">
          <img
            src="/earth-hero.jpg"
            alt=""
            className="hero-earth-image"
            width={720}
            height={720}
          />
          <div className="earth-atmosphere-glow" />
        </div>
        <div className="hero-gradient-overlay" />
      </div>

      <div className="container hero-content">
        <div className="hero-badge">
          <span className="badge-pulse" aria-hidden="true" />
          <span>NASA Earth Information Jukebox Challenge</span>
        </div>

        <h1 id="hero-title" className="hero-title">
          Earth Jukebox
        </h1>

        <p className="hero-subtitle">Listen to a Changing Planet</p>

        <p className="hero-description">
          NASA’s Earth Information Center communicates planetary change through visuals. Earth
          Jukebox transforms 146 years of NASA GISTEMP v4 global surface temperature anomalies
          (1880–2025) into sound—so you can hear our warming world unfold in real time.
        </p>

        <div className="hero-actions">
          <a href="#player-section" className="cta-button" id="start-listening-btn">
            <span>Begin Listening</span>
            <span className="arrow-down" aria-hidden="true">↓</span>
          </a>
          <span className="hero-image-credit">
            Background credit: NASA Visible Earth / Blue Marble (public domain)
          </span>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <a href="#player-section" tabIndex={-1} className="scroll-cue-link">
            <span>Scroll to player</span>
            <span className="scroll-indicator-dot" />
          </a>
        </div>
      </div>
    </section>
  );
};
