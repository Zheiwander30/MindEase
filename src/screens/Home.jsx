import { useEffect, useRef, useState } from 'react';
import { Bell, ClipboardCheck, Leaf, Quote, CheckCircle2, Timer } from 'lucide-react';
import Card from '../components/Card';
import MoodEmojiPicker from '../components/MoodEmojiPicker';
import {
  getTodayMoodLog,
  getRemainingTaskCount,
  getCompletedTaskCount,
  getTodayMindfulnessMinutes,
  logMindfulnessMinutes,
} from '../utils/storage';
import { getDailyTip } from '../utils/dailyTips';
import { getDailyQuote } from '../utils/quotes';

export default function Home({ userName = 'Friend', userStatus = '', onNavigate, refreshKey, onChanged }) {
  const [todayMood, setTodayMood] = useState(null);
  const [tasksRemaining, setTasksRemaining] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [mindfulMinutes, setMindfulMinutes] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);
  const timerStartRef = useRef(null);

  const tip = getDailyTip();
  const quote = getDailyQuote();

  useEffect(() => {
    setTodayMood(getTodayMoodLog()?.mood ?? null);
    setTasksRemaining(getRemainingTaskCount());
    setTasksDone(getCompletedTaskCount());
    setMindfulMinutes(getTodayMindfulnessMinutes());
  }, [refreshKey]);

  const startTimer = () => {
    timerStartRef.current = Date.now();
    setTimerSeconds(0);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
    const minutes = Math.floor(elapsed / 60);
    setTimerActive(false);
    setTimerSeconds(0);
    if (minutes >= 1) {
      logMindfulnessMinutes(minutes);
      setMindfulMinutes((m) => m + minutes);
      onChanged?.();
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const greeting = getTimeGreeting();

  return (
    <div className="px-5 pb-28 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white shadow-card">
          {userName.charAt(0).toUpperCase()}
        </div>
        <button type="button" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-app-card shadow-card">
          <Bell size={19} className="text-app-text" />
        </button>
      </div>

      {/* Greeting */}
      <div className="mt-5 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-app-text">{greeting}, {userName} 👋</h1>
          <p className="mt-1 text-sm text-app-muted">{userStatus || 'Take care of your mind, one step at a time.'}</p>
        </div>
        <CalmBlob className="h-24 w-24 shrink-0" />
      </div>

      {/* Mood Tracker Preview */}
      <Card className="mt-6">
        <button type="button" onClick={() => onNavigate('mood')} className="mb-3 flex w-full items-center justify-between">
          <h2 className="text-base font-bold text-app-text">How are you feeling today?</h2>
          <span className="text-xs font-semibold text-brand">Log it →</span>
        </button>
        <MoodEmojiPicker size="sm" selected={todayMood} />
      </Card>

      {/* Today's Overview */}
      <h2 className="mt-7 mb-3 text-base font-bold text-app-text">Today's Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* Tasks Remaining */}
        <button type="button" onClick={() => onNavigate('tasks')} className="text-left">
          <Card className="flex flex-col gap-2 h-full">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light">
              <ClipboardCheck size={18} className="text-brand" />
            </span>
            <p className="text-2xl font-extrabold text-app-text">{tasksRemaining}</p>
            <p className="text-xs leading-tight text-app-muted">Tasks Remaining</p>
          </Card>
        </button>

        {/* Tasks Done */}
        <button type="button" onClick={() => onNavigate('tasks')} className="text-left">
          <Card className="flex flex-col gap-2 h-full">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mood-great/20">
              <CheckCircle2 size={18} className="text-mood-great" />
            </span>
            <p className="text-2xl font-extrabold text-app-text">{tasksDone}</p>
            <p className="text-xs leading-tight text-app-muted">Tasks Done</p>
          </Card>
        </button>

        {/* Mindfulness Time */}
        <div className="col-span-2">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mood-good/20">
                  <Leaf size={18} className="text-mood-good" />
                </span>
                <div>
                  <p className="text-sm font-bold text-app-text">
                    {mindfulMinutes}
                    <span className="ml-1 text-xs font-semibold text-app-muted">min logged</span>
                    {timerActive && (
                      <span className="ml-2 font-mono text-brand text-sm">{fmtTimer(timerSeconds)}</span>
                    )}
                  </p>
                  <p className="text-xs text-app-muted">Mindfulness Time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={timerActive ? stopTimer : startTimer}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  timerActive ? 'bg-mood-overwhelmed/15 text-mood-overwhelmed' : 'bg-brand-light text-brand'
                }`}
              >
                <Timer size={14} />
                {timerActive ? 'Stop' : 'Start'}
              </button>
            </div>
            {timerActive && (
              <p className="text-[11px] text-app-muted">
                Timer running — tap Stop when done. Sessions under 1 min won't be logged.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Quote of the Day */}
      <h2 className="mt-7 mb-3 text-base font-bold text-app-text">Quote of the Day</h2>
      <Card className="flex items-start gap-3 bg-brand-light/60 border-transparent">
        <Quote size={18} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <p className="text-sm leading-relaxed text-app-text italic">"{quote.text}"</p>
          {quote.author && (
            <p className="mt-1.5 text-xs font-semibold text-app-muted">— {quote.author}</p>
          )}
        </div>
      </Card>

      {/* Daily Tip */}
      <h2 className="mt-5 mb-3 text-base font-bold text-app-text">Daily Tip</h2>
      <Card className="flex items-start gap-3 border border-app-border">
        <span className="mt-0.5 text-base">💡</span>
        <p className="text-sm leading-relaxed text-app-text">{tip}</p>
      </Card>

      {/* Quick nav to Resources */}
      <button
        type="button"
        onClick={() => onNavigate('resources')}
        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-app-border bg-app-card px-4 py-3 shadow-card"
      >
        <span className="text-sm font-semibold text-app-text">Need support? Browse resources</span>
        <span className="text-xs font-bold text-brand">View →</span>
      </button>
    </div>
  );
}

function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function CalmBlob({ className = '' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="62" r="42" fill="rgb(var(--primary-light))" />
      <circle cx="60" cy="62" r="30" fill="rgb(var(--primary))" opacity="0.9" />
      <path d="M46 62q14 -10 28 0" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="55" r="2.6" fill="white" />
      <circle cx="70" cy="55" r="2.6" fill="white" />
      <path d="M30 40q6 -14 18 -10" stroke="rgb(var(--mood-great))" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M88 44q8 -10 16 -4" stroke="rgb(var(--mood-great))" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
