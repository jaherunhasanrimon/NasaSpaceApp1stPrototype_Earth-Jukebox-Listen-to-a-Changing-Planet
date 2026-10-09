import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PlayerSection } from './components/PlayerSection';
import { LegendPanel } from './components/LegendPanel';
import { InfoPanel } from './components/InfoPanel';
import { Footer } from './components/Footer';
import { gistempAnnual } from './data/gistempAnnual';
import { useSonification } from './hooks/useSonification';

export const App: React.FC = () => {
  const {
    isPlaying,
    currentYear,
    currentAnomaly,
    progress,
    volume,
    isAudioSupported,
    play,
    pause,
    stop,
    seekYear,
    seekProgress,
    setVolume,
  } = useSonification(gistempAnnual);

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content" id="main-content">
        <HeroSection />

        <div className="container app-content-container">
          <PlayerSection
            data={gistempAnnual}
            currentYear={currentYear}
            anomalyC={currentAnomaly}
            progress={progress}
            volume={volume}
            isPlaying={isPlaying}
            isAudioSupported={isAudioSupported}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onVolumeChange={setVolume}
            onSeekYear={seekYear}
            onSeekProgress={seekProgress}
          />

          <LegendPanel />

          <InfoPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
