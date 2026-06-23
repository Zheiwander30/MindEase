import { MOODS } from '../utils/moods';

/**
 * size: 'sm' for the compact Home dashboard preview, 'lg' for the full
 * Mood Tracker selector.
 * selected: currently selected mood id (or null).
 * onSelect: optional — omit to render a read-only/disabled preview.
 */
export default function MoodEmojiPicker({ size = 'lg', selected, onSelect }) {
  const isInteractive = typeof onSelect === 'function';
  const circleSize = size === 'sm' ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl';

  return (
    <div className="grid grid-cols-5 gap-2">
      {MOODS.map((mood) => {
        const isSelected = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            disabled={!isInteractive}
            onClick={() => onSelect?.(mood.id)}
            className="flex flex-col items-center gap-1.5 focus-visible:outline-none"
            aria-pressed={isSelected}
            aria-label={mood.label}
          >
            <span
              className={`flex items-center justify-center rounded-full ${circleSize} transition-transform ${
                isInteractive ? 'active:scale-95' : ''
              }`}
              style={{
                backgroundColor: `${mood.colorVar}`,
                opacity: isSelected || !isInteractive ? 1 : 0.55,
                boxShadow: isSelected
                  ? '0 0 0 3px rgb(var(--card)), 0 0 0 5px rgb(var(--primary))'
                  : 'none',
              }}
            >
              {mood.emoji}
            </span>
            <span
              className={`text-xs font-medium ${
                isSelected ? 'text-app-text' : 'text-app-muted'
              }`}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
