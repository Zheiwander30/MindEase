import { useEffect, useState } from 'react';
import { BookHeart, Trash2, ChevronDown } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import { getMoodLogs, deleteMoodLog } from '../utils/storage';
import { getMoodById } from '../utils/moods';
import { MOOD_FACTORS } from '../utils/moods';

const FACTOR_LABEL = Object.fromEntries(MOOD_FACTORS.map((f) => [f.id, f.label]));

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

export default function Journal({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLogs(getMoodLogs());
  }, []);

  const handleDelete = (id) => {
    deleteMoodLog(id);
    setLogs(getMoodLogs());
    if (expanded === id) setExpanded(null);
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
          <div className="flex flex-col gap-2.5">
            {entries.map((log) => {
              const mood = getMoodById(log.mood);
              const isOpen = expanded === log.id;
              return (
                <Card key={log.id} className="p-0 overflow-hidden">
                  {/* Row */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    {/* Emoji */}
                    <span className="text-2xl leading-none">{mood?.emoji ?? '😶'}</span>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-app-text">{mood?.label ?? 'Unknown'}</p>
                      <p className="text-xs text-app-muted">
                        {formatDate(log.createdAt)} · {formatTime(log.updatedAt ?? log.createdAt)}
                      </p>
                    </div>
                    {/* Factor chips (collapsed preview) */}
                    {!isOpen && log.factors?.length > 0 && (
                      <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">
                        {log.factors.length} factor{log.factors.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-app-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-app-border px-4 pb-4 pt-3 space-y-3">
                      {/* Factors */}
                      {log.factors?.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-app-muted">Contributing factors</p>
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
                      {log.note ? (
                        <div>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-app-muted">Note</p>
                          <p className="text-sm leading-relaxed text-app-text">{log.note}</p>
                        </div>
                      ) : (
                        <p className="text-xs italic text-app-muted">No note added.</p>
                      )}

                      {/* Timestamps */}
                      <div className="text-[10px] text-app-muted space-y-0.5">
                        <p>Logged: {formatDate(log.createdAt)} at {formatTime(log.createdAt)}</p>
                        {log.updatedAt && log.updatedAt !== log.createdAt && (
                          <p>Last updated: {formatDate(log.updatedAt)} at {formatTime(log.updatedAt)}</p>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        className="flex items-center gap-1.5 text-xs text-mood-overwhelmed"
                      >
                        <Trash2 size={13} />
                        Delete this entry
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
