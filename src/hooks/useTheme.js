import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getAutoTheme, resolveTheme } from '../utils/theme';
import { getThemeMode, setThemeMode } from '../utils/storage';

/**
 * Manages theme mode state, persists the user's choice, and re-checks
 * the system clock every minute so 'auto' mode flips to Night mode the
 * moment 6:00 PM arrives without needing a page refresh.
 */
export function useTheme() {
  const [mode, setMode] = useState(() => getThemeMode());
  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  useEffect(() => {
    const update = () => setResolved(resolveTheme(mode));
    update();

    if (mode !== 'auto') return;

    // Re-evaluate every 60s so the day/night boundary applies live.
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const changeMode = useCallback((nextMode) => {
    setMode(nextMode);
    setThemeMode(nextMode);
  }, []);

  return {
    mode, // 'auto' | 'light' | 'dark'
    resolved, // 'day' | 'night' | 'light' | 'dark'
    changeMode,
    isAutoNight: mode === 'auto' && getAutoTheme() === 'night',
  };
}
