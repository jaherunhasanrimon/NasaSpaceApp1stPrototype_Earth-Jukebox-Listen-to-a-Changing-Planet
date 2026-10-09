import React from 'react';
import './PlayerControls.css';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentYear: number;
  volume: number; // 0 to 1
  minYear?: number;
  maxYear?: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (year: number) => void;
  isAudioSupported?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentYear,
  volume,
  minYear = 1880,
  maxYear = 2025,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onSeek,
  isAudioSupported = true,
}) => {
  const progressRatio = Math.max(0, Math.min(1, (currentYear - minYear) / (maxYear - minYear)));
  const progressPercent = (progressRatio * 100).toFixed(1);
  const volumePercent = Math.round(volume * 100);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };

  return (
    <div className="player-controls-container" role="region" aria-label="Audio Playback Controls">
      {!isAudioSupported && (
        <div className="audio-unsupported-banner" role="alert">
          <span>Web Audio API is not supported in this browser. Visual timeline remains fully interactive.</span>
        </div>
      )}

      {/* Main Timeline Scrubber Bar */}
      <div className="timeline-scrubber-wrapper">
        <div className="scrubber-header">
          <label htmlFor="timeline-scrubber" className="scrubber-label">
            Timeline Scrubber
          </label>
          <span className="scrubber-current-year">
            Year <strong>{currentYear}</strong> ({minYear}–{maxYear})
          </span>
        </div>

        <div className="range-slider-container">
          <input
            type="range"
            id="timeline-scrubber"
            min={minYear}
            max={maxYear}
            step={1}
            value={currentYear}
            onChange={handleScrubberChange}
            aria-label={`Scrub timeline year, currently at ${currentYear}`}
            aria-valuemin={minYear}
            aria-valuemax={maxYear}
            aria-valuenow={currentYear}
            className="styled-range-input timeline-slider"
            style={{
              background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${progressPercent}%, rgba(148, 163, 184, 0.2) ${progressPercent}%, rgba(148, 163, 184, 0.2) 100%)`,
            }}
          />
        </div>

        {/* Milestone Quick Jump Buttons */}
        <div className="timeline-milestones" aria-label="Key Historical Milestones">
          <span className="milestones-label">Jump to:</span>
          <button
            type="button"
            className={`milestone-chip ${currentYear === 1880 ? 'active' : ''}`}
            onClick={() => onSeek(1880)}
            aria-label="Seek to start year 1880"
          >
            1880 (Start)
          </button>
          <button
            type="button"
            className={`milestone-chip ${currentYear === 1940 ? 'active' : ''}`}
            onClick={() => onSeek(1940)}
            aria-label="Seek to year 1940"
          >
            1940
          </button>
          <button
            type="button"
            className={`milestone-chip ${currentYear === 1980 ? 'active' : ''}`}
            onClick={() => onSeek(1980)}
            aria-label="Seek to baseline year 1980"
          >
            1980 (Baseline)
          </button>
          <button
            type="button"
            className={`milestone-chip ${currentYear === 2016 ? 'active' : ''}`}
            onClick={() => onSeek(2016)}
            aria-label="Seek to year 2016"
          >
            2016
          </button>
          <button
            type="button"
            className={`milestone-chip ${currentYear === 2024 ? 'active' : ''}`}
            onClick={() => onSeek(2024)}
            aria-label="Seek to record year 2024"
          >
            2024 (Record)
          </button>
        </div>
      </div>

      {/* Button Controls and Volume Bar */}
      <div className="controls-action-bar">
        {/* Play / Pause / Stop Buttons */}
        <div className="playback-button-group">
          <button
            type="button"
            id="play-button"
            className={`control-btn play-btn ${isPlaying ? 'active' : ''}`}
            onClick={onPlay}
            disabled={!isAudioSupported || isPlaying}
            aria-label="Play sonification"
          >
            <span className="btn-icon" aria-hidden="true">▶</span>
            <span>Play</span>
          </button>

          <button
            type="button"
            id="pause-button"
            className="control-btn pause-btn"
            onClick={onPause}
            disabled={!isAudioSupported || !isPlaying}
            aria-label="Pause sonification"
          >
            <span className="btn-icon" aria-hidden="true">⏸</span>
            <span>Pause</span>
          </button>

          <button
            type="button"
            id="stop-button"
            className="control-btn stop-btn"
            onClick={onStop}
            disabled={!isAudioSupported}
            aria-label="Stop sonification and reset to 1880"
          >
            <span className="btn-icon" aria-hidden="true">⏹</span>
            <span>Stop</span>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="volume-control-group">
          <label htmlFor="volume-slider" className="volume-label" aria-label={`Master Volume: ${volumePercent}%`}>
            <span className="volume-icon" aria-hidden="true">
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </span>
            <span className="volume-title">Volume</span>
          </label>
          <div className="volume-slider-wrapper">
            <input
              type="range"
              id="volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isAudioSupported}
              aria-label={`Master volume, currently at ${volumePercent} percent`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumePercent}
              className="styled-range-input volume-slider"
              style={{
                background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${volumePercent}%, rgba(148, 163, 184, 0.2) ${volumePercent}%, rgba(148, 163, 184, 0.2) 100%)`,
              }}
            />
            <span className="volume-readout-percent">{volumePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
