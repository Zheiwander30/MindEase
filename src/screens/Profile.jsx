import { useState } from 'react';
import { Sun, Moon, MonitorSmartphone, Leaf, Info, Pencil, Check, X } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import { THEME_MODES } from '../utils/theme';
import { logMindfulnessMinutes, saveProfile, getProfile } from '../utils/storage';

const MODE_ICONS = {
  auto: MonitorSmartphone,
  light: Sun,
  dark: Moon,
};

const STATUS_PRESETS = [
  'Student 📚',
  'Feeling stressed 😟',
  'Taking it day by day 🌱',
  'Working on myself 💪',
  'Just exploring ✨',
];

export default function Profile({ onBack, profile = {}, themeState, onChanged }) {
  const [logged, setLogged] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [draftName, setDraftName] = useState(profile.name || '');
  const [draftStatus, setDraftStatus] = useState(profile.status || '');

  const saveName = () => {
    if (!draftName.trim()) return;
    saveProfile({ ...getProfile(), name: draftName.trim() });
    setEditingName(false);
    onChanged?.();
  };

  const saveStatus = () => {
    saveProfile({ ...getProfile(), status: draftStatus.trim() });
    setEditingStatus(false);
    onChanged?.();
  };

  const cancelName = () => {
    setDraftName(profile.name || '');
    setEditingName(false);
  };

  const cancelStatus = () => {
    setDraftStatus(profile.status || '');
    setEditingStatus(false);
  };

  const handleLog = (minutes) => {
    logMindfulnessMinutes(minutes);
    setLogged(minutes);
    onChanged?.();
    setTimeout(() => setLogged(null), 1800);
  };

  const displayName = profile.name || 'Friend';
  const displayStatus = profile.status || 'Taking it one day at a time';

  return (
    <div className="px-5 pb-28 pt-2">
      <ScreenHeader title="Profile" onBack={onBack} />

      {/* Avatar + Name */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-xl font-bold text-brand shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelName(); }}
                maxLength={30}
                className="flex-1 rounded-lg border border-brand bg-app-surface px-2 py-1 text-sm text-app-text focus:outline-none"
              />
              <button type="button" onClick={saveName} aria-label="Save name" className="text-brand"><Check size={16} /></button>
              <button type="button" onClick={cancelName} aria-label="Cancel" className="text-app-muted"><X size={16} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-base font-bold text-app-text truncate">{displayName}</p>
              <button type="button" onClick={() => setEditingName(true)} aria-label="Edit name" className="text-app-muted shrink-0">
                <Pencil size={13} />
              </button>
            </div>
          )}

          {editingStatus ? (
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveStatus(); if (e.key === 'Escape') cancelStatus(); }}
                  maxLength={60}
                  placeholder="Your status…"
                  className="flex-1 rounded-lg border border-brand bg-app-surface px-2 py-1 text-xs text-app-text focus:outline-none"
                />
                <button type="button" onClick={saveStatus} aria-label="Save status" className="text-brand"><Check size={14} /></button>
                <button type="button" onClick={cancelStatus} aria-label="Cancel" className="text-app-muted"><X size={14} /></button>
              </div>
              {/* Presets */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STATUS_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraftStatus(p)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      draftStatus === p ? 'border-brand bg-brand text-white' : 'border-app-border bg-app-card text-app-text'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-app-muted truncate">{displayStatus}</p>
              <button type="button" onClick={() => setEditingStatus(true)} aria-label="Edit status" className="text-app-muted shrink-0">
                <Pencil size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Appearance */}
      <h2 className="mt-7 mb-3 text-sm font-bold text-app-text">Appearance</h2>
      <Card className="flex flex-col gap-1">
        {THEME_MODES.map(({ value, label }) => {
          const Icon = MODE_ICONS[value];
          const isActive = themeState.mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => themeState.changeMode(value)}
              aria-pressed={isActive}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-brand text-white' : 'bg-app-surface text-app-muted'}`}>
                <Icon size={16} />
              </span>
              <span className="flex-1 text-sm font-medium text-app-text">{label}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-brand' : 'bg-transparent'}`} />
            </button>
          );
        })}
        {themeState.mode === 'auto' && (
          <p className="px-2 pt-1 text-[11px] text-app-muted">
            Currently showing {themeState.resolved === 'night' ? 'Night' : 'Day'} mode based on your device clock.
          </p>
        )}
      </Card>

      {/* Mindfulness log */}
      <h2 className="mt-7 mb-3 text-sm font-bold text-app-text">Log mindfulness time</h2>
      <Card>
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-mood-great" />
          <p className="text-sm text-app-text">
            {logged ? `Logged ${logged} min — nice work.` : 'Add a session you just completed'}
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          {[5, 10, 15, 20].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => handleLog(min)}
              className="flex-1 rounded-xl border border-app-border bg-app-surface py-2 text-sm font-semibold text-app-text"
            >
              {min}m
            </button>
          ))}
        </div>
      </Card>

      {/* Info */}
      <Card className="mt-7 flex items-start gap-2.5">
        <Info size={16} className="mt-0.5 shrink-0 text-app-muted" />
        <p className="text-xs leading-relaxed text-app-muted">
          MindEase stores everything on this device only — mood logs, tasks, and mindfulness sessions live in your browser's local storage and are never sent to a server.
        </p>
      </Card>
    </div>
  );
}
