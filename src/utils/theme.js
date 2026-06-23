/**
 * Theme system.
 *
 * Modes a user can pick: 'auto' | 'light' | 'dark'.
 *   - 'light' and 'dark' are explicit, user-pinned choices.
 *   - 'auto' delegates to the system clock via getAutoTheme(), which
 *     returns 'day' between DAY_START and NIGHT_START, and 'night'
 *     otherwise. This is what gives the "soothing Night mode after
 *     6:00 PM" behavior described in the brief.
 *
 * The resolved value ('light' | 'day' | 'night' | 'dark') is written to
 * document.documentElement as data-theme="...", and src/index.css defines
 * the full color palette for each of the four values.
 */

export const DAY_START_HOUR = 6; // 6:00 AM
export const NIGHT_START_HOUR = 18; // 6:00 PM

/**
 * Returns 'day' or 'night' based on the current local time.
 * @param {Date} [date] - inject a Date for testing; defaults to now.
 */
export function getAutoTheme(date = new Date()) {
  const hour = date.getHours();
  const isDaytime = hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR;
  return isDaytime ? 'day' : 'night';
}

/**
 * Resolves a user-selected mode ('auto' | 'light' | 'dark') into the
 * concrete theme to render ('day' | 'night' | 'light' | 'dark').
 */
export function resolveTheme(mode, date = new Date()) {
  if (mode === 'auto') return getAutoTheme(date);
  return mode;
}

export function applyTheme(resolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolvedTheme);
}

export const THEME_MODES = [
  { value: 'auto', label: 'Auto (syncs to time of day)' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
