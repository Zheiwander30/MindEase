import { useEffect, useState } from 'react';
import { BookOpen, Moon, Users, Clock, Heart, MoreHorizontal, Camera, Check } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import MoodEmojiPicker from '../components/MoodEmojiPicker';
import EmotionCameraCapture, { detectedMoodLabel } from '../components/EmotionCameraCapture';
import { MOOD_FACTORS } from '../utils/moods';
import { getTodayMoodLog, saveMoodLog } from '../utils/storage';

const ICONS = { BookOpen, Moon, Users, Clock, Heart, MoreHorizontal };
const NOTE_LIMIT = 200;

export default function MoodTracker({ onBack, onSaved }) {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [factors, setFactors] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanNotice, setScanNotice] = useState('');

  useEffect(() => {
    const existing = getTodayMoodLog();
    if (existing) {
      setMood(existing.mood);
      setNote(existing.note || '');
      setFactors(existing.factors || []);
    }
  }, []);

  const toggleFactor = (id) => {
    setFactors((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleSave = () => {
    if (!mood) return;
    saveMoodLog({ mood, note, factors });
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDetectedMood = (moodId) => {
    setMood(moodId);
    setShowCamera(false);
    setScanNotice(`AI scan suggested "${detectedMoodLabel(moodId)}" — adjust if that's not quite right.`);
  };

  return (
    <div className="px-5 pb-32 pt-2">
      <ScreenHeader title="Mood Tracker" onBack={onBack} />

      <p className="mt-2 text-sm font-semibold text-app-text">How are you feeling?</p>
      <p className="text-xs text-app-muted">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      <div className="mt-4">
        <MoodEmojiPicker selected={mood} onSelect={setMood} />
      </div>

      <button
        type="button"
        onClick={() => {
          setScanNotice('');
          setShowCamera(true);
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-app-border py-2.5 text-xs font-semibold text-brand"
      >
        <Camera size={15} />
        Try AI mood scan (beta)
      </button>
      {scanNotice && <p className="mt-2 text-center text-[11px] text-app-muted">{scanNotice}</p>}

      <Card className="mt-5">
        <p className="mb-2 text-sm font-bold text-app-text">Add a note (optional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_LIMIT))}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full resize-none rounded-xl border border-app-border bg-app-surface p-3 text-sm text-app-text placeholder:text-app-muted focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-app-muted">
          {note.length}/{NOTE_LIMIT}
        </p>
      </Card>

      <Card className="mt-4">
        <p className="mb-3 text-sm font-bold text-app-text">What's contributing to your mood?</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_FACTORS.map((factor) => {
            const Icon = ICONS[factor.icon];
            const isActive = factors.includes(factor.id);
            return (
              <button
                key={factor.id}
                type="button"
                onClick={() => toggleFactor(factor.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-brand bg-brand text-white'
                    : 'border-app-border bg-app-surface text-app-text'
                }`}
              >
                <Icon size={14} />
                {factor.label}
              </button>
            );
          })}
        </div>
      </Card>

      <button
        type="button"
        onClick={handleSave}
        disabled={!mood}
        className="fixed bottom-20 left-1/2 z-20 w-[calc(100%-2.5rem)] max-w-[calc(28rem-2.5rem)] -translate-x-1/2 rounded-2xl bg-brand py-3.5 text-sm font-bold text-white shadow-soft transition-opacity disabled:opacity-50"
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={16} /> Saved!
          </span>
        ) : (
          'Save Mood'
        )}
      </button>

      {showCamera && (
        <EmotionCameraCapture onDetected={handleDetectedMood} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
}
