import React from 'react';
import type { TemperatureDataPoint } from '../data/gistempAnnual';
import { TemperatureChart } from './TemperatureChart';
import { NowPlayingReadout } from './NowPlayingReadout';
import { PlayerControls } from './PlayerControls';
import './PlayerSection.css';

interface PlayerSectionProps {
  data: TemperatureDataPoint[];
  currentYear: number;
  anomalyC: number;
  progress: number;
  volume: number;
  isPlaying: boolean;
  isAudioSupported: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (vol: number) => void;
  onSeekYear: (year: number) => void;
  onSeekProgress: (progress: number) => void;
}

export const PlayerSection: React.FC<PlayerSectionProps> = ({
  data,
  currentYear,
  anomalyC,
  progress,
  volume,
  isPlaying,
  isAudioSupported,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onSeekYear,
  onSeekProgress,
}) => {
  return (
    <section id="player-section" className="player-section" aria-label="Earth Jukebox Audio and Visual Player">
      <div className="player-deck">
        <NowPlayingReadout
          year={currentYear}
          anomalyC={anomalyC}
          isPlaying={isPlaying}
        />

        <TemperatureChart
          data={data}
          progress={progress}
          onSeek={onSeekProgress}
        />

        <PlayerControls
          isPlaying={isPlaying}
          currentYear={currentYear}
          volume={volume}
          minYear={data[0]?.year ?? 1880}
          maxYear={data[data.length - 1]?.year ?? 2025}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onVolumeChange={onVolumeChange}
          onSeek={onSeekYear}
          isAudioSupported={isAudioSupported}
        />
      </div>
    </section>
  );
};
