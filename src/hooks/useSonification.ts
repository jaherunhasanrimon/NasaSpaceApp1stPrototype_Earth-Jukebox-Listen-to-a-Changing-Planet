import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { TemperatureDataPoint } from '../data/gistempAnnual';
import { gistempAnnual } from '../data/gistempAnnual';
import { NOTE_DURATION } from '../audio/mapping';
import {
  isAudioSupported as checkAudioSupport,
  getAudioContext,
  resumeAudioContext,
  scheduleVoice,
  stopAllVoices,
  setMasterVolume,
} from '../audio/audioEngine';

export interface UseSonificationReturn {
  isPlaying: boolean;
  currentYear: number;
  currentAnomaly: number;
  progress: number; // 0 to 1
  volume: number; // 0 to 1
  isAudioSupported: boolean;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seekYear: (year: number) => void;
  seekProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
}

const SCHEDULE_AHEAD_TIME = 0.12; // Look ahead 120ms
const SCHEDULER_INTERVAL_MS = 25; // Check scheduler every 25ms

export function useSonification(
  data: TemperatureDataPoint[] = gistempAnnual
): UseSonificationReturn {
  const isAudioSupported = useMemo(() => checkAudioSupport(), []);

  const minYear = data[0]?.year ?? 1880;
  const maxYear = data[data.length - 1]?.year ?? 2025;
  const totalPoints = data.length;

  // Reactive State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<number>(minYear);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.75);

  // Playback Clock Refs
  const audioContextStartTimeRef = useRef<number>(0);
  const playbackStartIndexRef = useRef<number>(0);
  const nextNoteToScheduleRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const schedulerTimerRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Keep isPlayingRef in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Current anomaly value
  const currentAnomaly = useMemo(() => {
    const point = data.find((d) => d.year === currentYear);
    return point ? point.anomalyC : data[0]?.anomalyC ?? 0;
  }, [data, currentYear]);

  // Volume Controller
  const handleSetVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    setMasterVolume(clamped);
  }, []);

  // Stop scheduling and cancel animation loop
  const stopSchedulerAndLoop = useCallback(() => {
    if (schedulerTimerRef.current !== null) {
      window.clearInterval(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    stopAllVoices();
  }, []);

  // Audio lookahead scheduler
  const runSchedulerTick = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || !isPlayingRef.current) return;

    const currentTime = ctx.currentTime;
    const scheduleUntilTime = currentTime + SCHEDULE_AHEAD_TIME;

    while (nextNoteToScheduleRef.current < totalPoints) {
      const noteIdx = nextNoteToScheduleRef.current;
      const offsetIndex = noteIdx - playbackStartIndexRef.current;
      const noteTargetTime = audioContextStartTimeRef.current + offsetIndex * NOTE_DURATION;

      if (noteTargetTime > scheduleUntilTime) {
        break; // Wait for next tick
      }

      if (noteTargetTime >= currentTime - 0.05) {
        const point = data[noteIdx];
        if (point) {
          scheduleVoice(point.anomalyC, noteTargetTime);
        }
      }

      nextNoteToScheduleRef.current += 1;
    }
  }, [data, totalPoints]);

  // Animation frame loop driven strictly by audioContext.currentTime
  const runVisualSyncLoop = useCallback(() => {
    const loop = () => {
      const ctx = getAudioContext();
      if (!ctx || !isPlayingRef.current) return;

      const currentTime = ctx.currentTime;
      const elapsedAudioTime = Math.max(0, currentTime - audioContextStartTimeRef.current);
      const elapsedNotes = elapsedAudioTime / NOTE_DURATION;
      const visualFloatIndex = playbackStartIndexRef.current + elapsedNotes;

      if (visualFloatIndex >= totalPoints - 0.05) {
        // Reached the end of the series
        stopSchedulerAndLoop();
        setIsPlaying(false);
        const lastIndex = totalPoints - 1;
        setCurrentYear(data[lastIndex]?.year ?? maxYear);
        setProgress(1);
        return;
      }

      const activeIndex = Math.min(
        totalPoints - 1,
        Math.max(0, Math.floor(visualFloatIndex))
      );
      const activePoint = data[activeIndex];

      if (activePoint && activePoint.year !== currentYear) {
        setCurrentYear(activePoint.year);
      }

      const calculatedProgress = Math.max(
        0,
        Math.min(1, visualFloatIndex / (totalPoints - 1))
      );
      setProgress(calculatedProgress);

      rafIdRef.current = window.requestAnimationFrame(loop);
    };

    loop();
  }, [data, totalPoints, currentYear, maxYear, stopSchedulerAndLoop]);

  // Play handler (compliant with browser autoplay policy)
  const play = useCallback(async () => {
    if (!isAudioSupported) return;

    await resumeAudioContext();
    const ctx = getAudioContext();
    if (!ctx) return;

    // Determine starting index
    let startIndex = playbackStartIndexRef.current;
    if (startIndex >= totalPoints - 1) {
      // If at end, loop back to start
      startIndex = 0;
      playbackStartIndexRef.current = 0;
      setCurrentYear(minYear);
      setProgress(0);
    }

    stopSchedulerAndLoop();

    // Align clocks
    const now = ctx.currentTime + 0.02; // Small 20ms lead-in for pristine scheduling
    audioContextStartTimeRef.current = now;
    playbackStartIndexRef.current = startIndex;
    nextNoteToScheduleRef.current = startIndex;

    setIsPlaying(true);
    isPlayingRef.current = true;

    // Start lookahead scheduler
    runSchedulerTick();
    schedulerTimerRef.current = window.setInterval(
      runSchedulerTick,
      SCHEDULER_INTERVAL_MS
    );

    // Start visual animation loop
    rafIdRef.current = window.requestAnimationFrame(runVisualSyncLoop);
  }, [
    isAudioSupported,
    totalPoints,
    minYear,
    stopSchedulerAndLoop,
    runSchedulerTick,
    runVisualSyncLoop,
  ]);

  // Pause handler
  const pause = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && isPlayingRef.current) {
      const elapsedAudioTime = Math.max(0, ctx.currentTime - audioContextStartTimeRef.current);
      const elapsedNotes = elapsedAudioTime / NOTE_DURATION;
      const currentIndex = Math.min(
        totalPoints - 1,
        Math.max(0, Math.round(playbackStartIndexRef.current + elapsedNotes))
      );
      playbackStartIndexRef.current = currentIndex;
    }

    stopSchedulerAndLoop();
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [totalPoints, stopSchedulerAndLoop]);

  // Stop handler
  const stop = useCallback(() => {
    stopSchedulerAndLoop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    playbackStartIndexRef.current = 0;
    nextNoteToScheduleRef.current = 0;
    setCurrentYear(minYear);
    setProgress(0);
  }, [minYear, stopSchedulerAndLoop]);

  // Seek to specific year
  const seekYear = useCallback(
    (targetYear: number) => {
      const clampedYear = Math.max(minYear, Math.min(maxYear, targetYear));
      const targetIndex = data.findIndex((d) => d.year === clampedYear);
      if (targetIndex === -1) return;

      const wasPlaying = isPlayingRef.current;
      stopSchedulerAndLoop();

      playbackStartIndexRef.current = targetIndex;
      nextNoteToScheduleRef.current = targetIndex;
      setCurrentYear(clampedYear);
      setProgress(targetIndex / (totalPoints - 1));

      if (wasPlaying) {
        const ctx = getAudioContext();
        if (ctx) {
          audioContextStartTimeRef.current = ctx.currentTime + 0.02;
          setIsPlaying(true);
          isPlayingRef.current = true;
          runSchedulerTick();
          schedulerTimerRef.current = window.setInterval(
            runSchedulerTick,
            SCHEDULER_INTERVAL_MS
          );
          rafIdRef.current = window.requestAnimationFrame(runVisualSyncLoop);
        }
      }
    },
    [data, minYear, maxYear, totalPoints, stopSchedulerAndLoop, runSchedulerTick, runVisualSyncLoop]
  );

  // Seek by progress (0 to 1)
  const seekProgress = useCallback(
    (prog: number) => {
      const clampedProg = Math.max(0, Math.min(1, prog));
      const targetIndex = Math.min(
        totalPoints - 1,
        Math.max(0, Math.round(clampedProg * (totalPoints - 1)))
      );
      const targetPoint = data[targetIndex];
      if (targetPoint) {
        seekYear(targetPoint.year);
      }
    },
    [data, totalPoints, seekYear]
  );

  // Handle tab visibility and refocus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isPlayingRef.current) {
        await resumeAudioContext();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopSchedulerAndLoop();
    };
  }, [stopSchedulerAndLoop]);

  return {
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
    setVolume: handleSetVolume,
  };
}
