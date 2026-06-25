import { useEffect, useRef, useState } from 'react';
import { BookHeart, Trash2, X } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import { getMoodLogs, deleteMoodLog } from '../utils/storage';
import { getMoodById, MOOD_FACTORS } from '../utils/moods';

const FACTOR_LABEL = Object.fromEntries(MOOD_FACTORS.map((f) => [f.id, f.label]));

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function groupByMonth(logs) {
  const groups = {};
  logs.forEach((log) => {
    const d = new Date(log.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { label, entries: [] };
    groups[key].entries.push(log);
  });
  return Object.values(groups).sort((a, b) => b.entries[0].createdAt - a.entries[0].createdAt);
}

/* ── Modal ──────────────────────────────────────────────────── */
function EntryModal({ log, onClose, onDelete }) {
  const overlayRef = useRef(null);
  const mood = getMoodById(log.mood);

  // close on backdrop click
  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm animate-fade-in rounded-3xl bg-app-card shadow-soft overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{mood?.emoji ?? '😶'}</span>
            <div>
              <p className="text-base font-bold text-app-text">{mood?.label ?? 'Unknown'}</p>
              <p className="text-xs text-app-muted">{formatDate(log.createdAt)} · {formatTime(log.updatedAt ?? log.createdAt)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-app-surface text-app-muted">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Factors */}
          {log.factors?.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-app-muted">Contributing Factors</p>
              <div className="flex flex-wrap gap-1.5">
                {log.factors.map((f) => (
                  <span key={f} className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
                    {FACTOR_LABEL[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-app-muted">Note</p>
            {log.note
              ? <p className="text-sm leading-relaxed text-app-text">{log.note}</p>
              : <p className="text-xs italic text-app-muted">No note was added for this entry.</p>
            }
          </div>

          {/* Timestamps */}
          <div className="rounded-xl bg-app-surface px-3 py-2.5 text-[11px] text-app-muted space-y-0.5">
            <p>Logged: {formatDate(log.createdAt)} at {formatTime(log.createdAt)}</p>
            {log.updatedAt && log.updatedAt !== log.createdAt && (
              <p>Last updated: {formatDate(log.updatedAt)} at {formatTime(log.updatedAt)}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-app-border py-2.5 text-sm font-semibold text-app-text">
            Close
          </button>
          <button type="button" onClick={() => { onDelete(log.id); onClose(); }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-mood-overwhelmed/10 px-4 py-2.5 text-sm font-semibold text-mood-overwhelmed">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Screen ────────────────────────────────────────────── */
export default function Journal({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { setLogs(getMoodLogs()); }, []);

  const handleDelete = (id) => {
    deleteMoodLog(id);
    setLogs(getMoodLogs());
  };

  const groups = groupByMonth(logs);

  return (
    <div className="px-5 pb-28 pt-2">
      <ScreenHeader title="Journal" onBack={onBack} />

      {logs.length === 0 && (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <BookHeart size={48} className="text-app-muted opacity-40" />
          <p className="text-sm font-semibold text-app-muted">No mood entries yet.</p>
          <p className="text-xs text-app-muted">Log your first mood from the Mood tab or Home screen.</p>
        </div>
      )}

      {groups.map(({ label, entries }) => (
        <div key={label} className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-app-muted">{label}</p>
          <div className="flex flex-col gap-2">
            {entries.map((log) => {
              const mood = getMoodById(log.mood);
              return (
                <button key={log.id} type="button" onClick={() => setSelected(log)}
                  className="w-full text-left">
                  <Card className="flex items-center gap-3 hover:border-brand/40 transition-colors">
                    <span className="text-2xl leading-none shrink-0">{mood?.emoji ?? '😶'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-app-text">{mood?.label ?? 'Unknown'}</p>
                      <p className="text-xs text-app-muted truncate">
                        {formatDate(log.createdAt)} · {formatTime(log.updatedAt ?? log.createdAt)}
                        {log.factors?.length > 0 && ` · ${log.factors.length} factor${log.factors.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    {log.note && (
                      <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">Note</span>
                    )}
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal */}
      {selected && (
        <EntryModal
          log={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
