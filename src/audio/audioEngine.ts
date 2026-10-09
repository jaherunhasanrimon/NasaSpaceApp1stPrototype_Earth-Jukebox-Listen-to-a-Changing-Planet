import {
  anomalyToFrequency,
  anomalyToFilterCutoff,
  ATTACK_TIME,
  RELEASE_TIME,
  NOTE_DURATION,
} from './mapping';

/**
 * AudioEngine manages the singleton Web Audio API AudioContext,
 * master volume routing, voice synthesis, and scheduling.
 */

// Singleton instances
let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
const activeOscillators: Set<OscillatorNode> = new Set();

/**
 * Feature detection for Web Audio API support in the current browser.
 */
export function isAudioSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) !== 'undefined';
}

/**
 * Gets or initializes the singleton AudioContext and master gain node.
 * Must be called or resumed on user gesture to comply with autoplay policy.
 */
export function getAudioContext(): AudioContext | null {
  if (!isAudioSupported()) return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();

    // Create Master Gain Node
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.setValueAtTime(0.75, audioContext.currentTime);
    masterGainNode.connect(audioContext.destination);
  }

  return audioContext;
}

/**
 * Resumes the AudioContext if suspended (e.g. after user gesture or tab refocus).
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Sets the master playback volume.
 * @param volume Value between 0.0 (silent) and 1.0 (full)
 */
export function setMasterVolume(volume: number): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGainNode) return;
  const clamped = Math.max(0, Math.min(1, volume));
  masterGainNode.gain.setTargetAtTime(clamped, ctx.currentTime, 0.015);
}

/**
 * Schedules a single synthesizer voice (oscillator + lowpass filter + gain envelope)
 * for a specific temperature anomaly at an exact AudioContext time.
 * 
 * @param anomalyC Temperature anomaly value in °C
 * @param startTime Target start time relative to audioContext.currentTime
 */
export function scheduleVoice(anomalyC: number, startTime: number): { stop: () => void } {
  const ctx = getAudioContext();
  if (!ctx || !masterGainNode) {
    return { stop: () => {} };
  }

  const frequency = anomalyToFrequency(anomalyC);
  const cutoff = anomalyToFilterCutoff(anomalyC);

  // 1. Oscillator (Triangle wave for acoustic warmth and natural harmonics)
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, startTime);

  // 2. Lowpass Biquad Filter (timbre brightness tracking warmth)
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, startTime);
  filter.Q.setValueAtTime(1.2, startTime); // Gentle resonance

  // 3. Gain Envelope (10ms attack, 150ms release)
  const voiceGain = ctx.createGain();
  const safeStart = Math.max(ctx.currentTime, startTime);
  const attackEnd = safeStart + ATTACK_TIME;
  const releaseEnd = attackEnd + RELEASE_TIME;

  // Envelope curve to prevent clicks
  voiceGain.gain.setValueAtTime(0.0001, safeStart);
  voiceGain.gain.exponentialRampToValueAtTime(0.35, attackEnd);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

  // Connect Audio Graph: Osc -> Filter -> VoiceGain -> MasterGain -> Destination
  osc.connect(filter);
  filter.connect(voiceGain);
  voiceGain.connect(masterGainNode);

  // Track active oscillator for instant cancellation on stop/scrub
  activeOscillators.add(osc);

  const stopTime = safeStart + NOTE_DURATION;
  osc.start(safeStart);
  osc.stop(stopTime);

  const cleanup = () => {
    activeOscillators.delete(osc);
    try {
      osc.disconnect();
      filter.disconnect();
      voiceGain.disconnect();
    } catch {
      // Already disconnected
    }
  };

  osc.onended = cleanup;

  return {
    stop: () => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
      cleanup();
    },
  };
}

/**
 * Immediately stops all active sounds and silences the output.
 */
export function stopAllVoices(): void {
  for (const osc of activeOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignore if already stopped
    }
  }
  activeOscillators.clear();
}
