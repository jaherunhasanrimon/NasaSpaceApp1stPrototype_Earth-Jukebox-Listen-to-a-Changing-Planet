/**
 * Earth Jukebox - Data-to-Sound Mapping Functions
 * 
 * Sourced from design.md §5:
 * - Pitch: Linear map of anomaly ∈ [-0.5, +1.3] °C → 11-step C-major pentatonic scale from C3 to C5
 * - Timbre: Linear map of anomaly → lowpass filter cutoff 400 Hz (cool/muffled) to 4000 Hz (warm/bright)
 * - Tempo: Fixed tempo, 4 years/second (250 ms note, 10 ms attack, 150 ms release)
 */

export const YEARS_PER_SECOND = 4;
export const NOTE_DURATION = 1 / YEARS_PER_SECOND; // 0.25s (250ms)
export const ATTACK_TIME = 0.01; // 10ms
export const RELEASE_TIME = 0.15; // 150ms

export const ANOMALY_MIN = -0.5;
export const ANOMALY_MAX = 1.3;

export const FILTER_CUTOFF_MIN = 400; // 400 Hz
export const FILTER_CUTOFF_MAX = 4000; // 4000 Hz

/**
 * 11-step C-major pentatonic scale spanning two octaves from C3 to C5:
 * C3 (130.81 Hz), D3 (146.83 Hz), E3 (164.81 Hz), G3 (196.00 Hz), A3 (220.00 Hz),
 * C4 (261.63 Hz), D4 (293.66 Hz), E4 (329.63 Hz), G4 (392.00 Hz), A4 (440.00 Hz),
 * C5 (523.25 Hz)
 */
export const PENTATONIC_SCALE_FREQUENCIES: readonly number[] = [
  130.81, // C3
  146.83, // D3
  164.81, // E3
  196.00, // G3
  220.00, // A3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
];

/**
 * Maps a temperature anomaly (°C) to an oscillator frequency on the 11-step
 * C-major pentatonic scale.
 * 
 * @param anomalyC Temperature anomaly in °C (typically -0.5 to +1.3)
 * @returns Oscillator frequency in Hz (130.81 Hz to 523.25 Hz)
 */
export function anomalyToFrequency(anomalyC: number): number {
  const normalized = Math.max(0, Math.min(1, (anomalyC - ANOMALY_MIN) / (ANOMALY_MAX - ANOMALY_MIN)));
  const stepIndex = Math.round(normalized * (PENTATONIC_SCALE_FREQUENCIES.length - 1));
  return PENTATONIC_SCALE_FREQUENCIES[stepIndex];
}

/**
 * Maps a temperature anomaly (°C) to a lowpass filter cutoff frequency.
 * Cool anomalies produce a muffled, darker tone; warm anomalies open harmonics up to 4000 Hz.
 * 
 * @param anomalyC Temperature anomaly in °C
 * @returns Filter cutoff frequency in Hz (400 Hz to 4000 Hz)
 */
export function anomalyToFilterCutoff(anomalyC: number): number {
  const normalized = Math.max(0, Math.min(1, (anomalyC - ANOMALY_MIN) / (ANOMALY_MAX - ANOMALY_MIN)));
  return FILTER_CUTOFF_MIN + normalized * (FILTER_CUTOFF_MAX - FILTER_CUTOFF_MIN);
}
