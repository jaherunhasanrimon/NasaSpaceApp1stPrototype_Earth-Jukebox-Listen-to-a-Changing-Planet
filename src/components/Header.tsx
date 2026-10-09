import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="site-header" role="banner">
      <div className="container header-container">
        <a href="#hero" className="brand-logo" aria-label="Earth Jukebox home">
          <span className="logo-indicator" aria-hidden="true" />
          <span className="logo-title">Earth Jukebox</span>
        </a>
        <div className="header-meta">
          <span className="challenge-tag">NASA Space Apps Challenge 2026</span>
          <span className="dataset-tag">GISTEMP v4 (1880–2025)</span>
        </div>
      </div>
    </header>
  );
};
