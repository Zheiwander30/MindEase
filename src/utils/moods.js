/**
 * Single source of truth for the 5-point mood scale, shared by the Home
 * preview, the Mood Tracker screen, and (later) the AI emotion mapper.
 */
// Theme variables are stored as "R G B" triplets (see src/index.css), so
// any inline-style usage must wrap them in rgb(...) — Tailwind classes
// (e.g. bg-mood-great) handle this automatically via tailwind.config.js.
export const MOODS = [
  { id: 'great', label: 'Great', emoji: '😄', colorVar: 'rgb(var(--mood-great))' },
  { id: 'good', label: 'Good', emoji: '🙂', colorVar: 'rgb(var(--mood-good))' },
  { id: 'okay', label: 'Okay', emoji: '😐', colorVar: 'rgb(var(--mood-okay))' },
  { id: 'stressed', label: 'Stressed', emoji: '🙁', colorVar: 'rgb(var(--mood-stressed))' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😣', colorVar: 'rgb(var(--mood-overwhelmed))' },
];

export const MOOD_FACTORS = [
  { id: 'academic', label: 'Academic Pressure', icon: 'BookOpen' },
  { id: 'sleep', label: 'Sleep', icon: 'Moon' },
  { id: 'social', label: 'Social', icon: 'Users' },
  { id: 'time', label: 'Time Management', icon: 'Clock' },
  { id: 'personal', label: 'Personal', icon: 'Heart' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

export function getMoodById(id) {
  return MOODS.find((m) => m.id === id);
}
