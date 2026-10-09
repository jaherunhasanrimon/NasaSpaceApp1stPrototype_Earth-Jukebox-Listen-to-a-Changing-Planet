import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo-text">Earth Jukebox</span>
            <p className="footer-tagline">
              Sonifying NASA Earth Information Center climate time series for universal access.
            </p>
          </div>

          <div className="footer-credits">
            <h2 className="footer-heading">Attribution & Credits</h2>
            <ul className="footer-links-list">
              <li>
                <strong>Dataset:</strong> NASA Goddard Institute for Space Studies (GISS) Surface
                Temperature Analysis (GISTEMP v4).{' '}
                <a
                  href="https://data.giss.nasa.gov/gistemp/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  data.giss.nasa.gov/gistemp
                </a>
              </li>
              <li>
                <strong>Imagery:</strong> NASA Visible Earth & Blue Marble collection (public
                domain, NASA/Goddard Space Flight Center).
              </li>
              <li>
                <strong>Challenge:</strong> NASA Space Apps Challenge 2026 — “The Earth Information
                Jukebox”.
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="disclaimer-text">
            <strong>Disclaimer:</strong> Built as an illustrative prototype for the NASA Space Apps
            Challenge 2026. This is not an official NASA product. All data is bundled locally from
            historical published series for demonstration reliability without live feeds.
          </p>
          <p className="copyright-text">
            © 2026 Earth Jukebox Team · Open science for accessibility
          </p>
        </div>
      </div>
    </footer>
  );
};
