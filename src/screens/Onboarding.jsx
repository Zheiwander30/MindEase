import { useState } from 'react';
import { Smile } from 'lucide-react';
import Card from '../components/Card';
import { saveProfile, setOnboarded } from '../utils/storage';

const STATUS_OPTIONS = [
  { value: 'Student 📚', label: 'Student 📚' },
  { value: 'Feeling stressed 😟', label: 'Feeling stressed 😟' },
  { value: 'Taking it day by day 🌱', label: 'Taking it day by day 🌱' },
  { value: 'Working on myself 💪', label: 'Working on myself 💪' },
  { value: 'Just exploring ✨', label: 'Just exploring ✨' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0 = name, 1 = status
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNameNext = () => {
    if (!name.trim()) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    setStep(1);
  };

  const handleFinish = () => {
    const finalStatus = status === '__custom__' ? customStatus.trim() : status;
    saveProfile({ name: name.trim(), status: finalStatus });
    setOnboarded();
    onComplete({ name: name.trim(), status: finalStatus });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-6 py-10">
      {/* Logo blob */}
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand shadow-soft">
        <Smile size={40} className="text-white" />
      </div>

      {step === 0 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="mb-1 text-center text-2xl font-extrabold text-app-text">
            Welcome to MindEase 💜
          </h1>
          <p className="mb-8 text-center text-sm text-app-muted">
            Your personal mental wellness companion. Let's get you set up.
          </p>

          <Card>
            <label htmlFor="onboard-name" className="mb-1 block text-sm font-bold text-app-text">
              What should we call you?
            </label>
            <p className="mb-3 text-xs text-app-muted">
              This will appear on your home screen and profile.
            </p>
            <input
              id="onboard-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
              placeholder="e.g. Alex"
              maxLength={30}
              autoFocus
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-base text-app-text placeholder:text-app-muted focus:border-brand focus:outline-none"
            />
            {nameError && (
              <p className="mt-2 text-xs text-mood-overwhelmed">{nameError}</p>
            )}
          </Card>

          <button
            type="button"
            onClick={handleNameNext}
            className="mt-5 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white shadow-soft"
          >
            Continue →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="mb-1 text-center text-2xl font-extrabold text-app-text">
            Hi, {name}! 👋
          </h1>
          <p className="mb-8 text-center text-sm text-app-muted">
            How would you describe yourself right now? (Optional — you can skip this.)
          </p>

          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                aria-pressed={status === opt.value}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  status === opt.value
                    ? 'border-brand bg-brand text-white'
                    : 'border-app-border bg-app-card text-app-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setStatus('__custom__')}
              aria-pressed={status === '__custom__'}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                status === '__custom__'
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-app-border bg-app-card text-app-text'
              }`}
            >
              ✏️ Write my own…
            </button>
            {status === '__custom__' && (
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="Describe yourself…"
                maxLength={60}
                autoFocus
                className="rounded-xl border border-brand bg-app-surface px-4 py-3 text-sm text-app-text placeholder:text-app-muted focus:outline-none"
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="mt-6 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white shadow-soft"
          >
            Let's go 🚀
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="mt-2 w-full py-2 text-xs text-app-muted"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
