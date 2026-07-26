/**
 * Canonical definitions for the trackable factors.
 *
 * One source of truth for:
 *   - the measurement TYPE (how each factor is measured),
 *   - the MARKER shown in onboarding / settings,
 *   - the inputs rendered in the daily check-in.
 *
 * Onboarding/Settings store factors by their `label`. Resolve a label with
 * `trackerFor()` — unknown (custom) factors default to a 0–10 scale.
 */

export type MeasureType = 'scale' | 'emoji' | 'yesno' | 'counter';

export interface EmojiOption {
  emoji: string;
  label: string;
  value: number;
}

export interface TrackerDef {
  id: string;
  label: string;
  measure: MeasureType;
  marker: string; // human-readable "how it's measured"
  question: string; // prompt shown in the check-in
  min?: number;
  max?: number;
  unit?: string;
  emojiOptions?: EmojiOption[];
}

export const ENERGY_EMOJI: EmojiOption[] = [
  { emoji: '😴', label: 'Exhausted', value: 1 },
  { emoji: '😪', label: 'Tired', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '⚡', label: 'Energized', value: 5 },
];

export const MOOD_EMOJI: EmojiOption[] = [
  { emoji: '😢', label: 'Very Low', value: 1 },
  { emoji: '😞', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😄', label: 'Great', value: 5 },
];

// value maps to the DailyCheckIn.sleep string: 1→poor, 2→okay, 3→good
export const SLEEP_EMOJI: EmojiOption[] = [
  { emoji: '😫', label: 'Poor', value: 1 },
  { emoji: '😐', label: 'Okay', value: 2 },
  { emoji: '😊', label: 'Good', value: 3 },
];

export const TRACKERS: TrackerDef[] = [
  { id: 'pain', label: 'Pain', measure: 'scale', marker: '0–10 scale', question: 'What’s your pain level?', min: 0, max: 10 },
  { id: 'energy', label: 'Fatigue / Energy', measure: 'emoji', marker: '1–5 (😴 → ⚡)', question: 'How’s your energy?', emojiOptions: ENERGY_EMOJI },
  { id: 'sleep', label: 'Sleep', measure: 'emoji', marker: 'Poor / Okay / Good', question: 'How did you sleep?', emojiOptions: SLEEP_EMOJI },
  { id: 'mood', label: 'Mood', measure: 'emoji', marker: '1–5 (😢 → 😄)', question: 'How’s your mood?', emojiOptions: MOOD_EMOJI },
  { id: 'stress', label: 'Stress', measure: 'scale', marker: '0–10 scale', question: 'What’s your stress level?', min: 0, max: 10 },
  { id: 'water', label: 'Water intake', measure: 'counter', marker: 'glasses (0–16)', question: 'How many glasses of water?', min: 0, max: 16, unit: 'glasses' },
  { id: 'exercise', label: 'Exercise', measure: 'yesno', marker: 'Yes / No', question: 'Did you exercise today?' },
  { id: 'diet', label: 'Diet / Food', measure: 'yesno', marker: 'Yes / No', question: 'Did any food bother you today?' },
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'factor';
}

/** Resolve a stored factor label (or id) to its definition. */
export function trackerFor(label: string): TrackerDef {
  const found = TRACKERS.find((t) => t.label === label || t.id === label);
  if (found) return found;
  // Custom factor → default to a 0–10 scale
  return {
    id: slug(label),
    label,
    measure: 'scale',
    marker: '0–10 scale',
    question: `${label}?`,
    min: 0,
    max: 10,
  };
}

/** The marker text for a factor label (used by onboarding / settings). */
export function markerFor(label: string): string {
  return trackerFor(label).marker;
}
