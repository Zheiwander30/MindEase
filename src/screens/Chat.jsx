import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Send, Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { sendMessage, buildSystemPrompt, isLiveMode } from '../utils/gemini';
import { getProfile, getMoodLogs, getTodayMoodLog } from '../utils/storage';
import { getMoodById } from '../utils/moods';

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it', 'self harm', 'hurt myself', 'don\'t want to be here'];

function hasCrisisContent(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

function CrisisBanner() {
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-mood-overwhelmed/30 bg-mood-overwhelmed/10 px-4 py-3">
      <p className="text-xs font-bold text-mood-overwhelmed mb-1">If you are in crisis right now</p>
      <p className="text-xs text-app-text leading-relaxed">
        Please reach out to <span className="font-bold">In Touch Crisis Line</span> immediately:{' '}
        <a href="tel:+6328893-7603" className="font-bold text-mood-overwhelmed underline">(02) 8893-7603</a>
        {' '}— available 24/7, free, and confidential.
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">M</div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-app-card px-4 py-3 shadow-card">
        <span className="h-2 w-2 animate-bounce rounded-full bg-app-muted [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-app-muted [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-app-muted [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function Message({ msg, userName }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 px-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
        ${isUser ? 'bg-brand-light text-brand' : 'bg-brand text-white'}`}>
        {isUser ? (userName?.charAt(0)?.toUpperCase() ?? 'U') : 'M'}
      </div>
      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card
        ${isUser
          ? 'rounded-br-sm bg-brand text-white'
          : 'rounded-bl-sm bg-app-card text-app-text'
        }`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function Chat({ onBack }) {
  const profile = getProfile();
  const userName = profile.name || 'Friend';
  const todayMood = getTodayMoodLog();

  const systemPrompt = useMemo(() => {
    const recentLogs = getMoodLogs().slice(0, 7);
    return buildSystemPrompt(profile, todayMood, recentLogs);
  }, [profile, todayMood]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);

  // Structural Connection Guards
  const didOpenRef = useRef(false);
  const lastRequestTimeRef = useRef(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const openConversation = async () => {
    const now = Date.now();
    
    // Strict Guard: If there are already messages on screen, do not trigger an automated call
    if (messages.length > 0) return;
    
    // Debounce Guard: Block immediate rapid calls within 5 seconds of each other
    if (now - lastRequestTimeRef.current < 5000) {
      return;
    }
    
    lastRequestTimeRef.current = now;
    setLoading(true);
    setError('');
    
    try {
      const opener = await sendMessage(
        [{ role: 'user', text: '__start__' }],
        systemPrompt + '\n\nThe user just opened the chat. Greet them warmly by name, reference something specific from their journal or mood history, and ask how they are doing today. Do not mention "__start__".'
      );
      setMessages([{ role: 'model', text: opener }]);
    } catch (err) {
      if (err.message?.includes('429')) {
        setError('MindEase Companion is resting due to high traffic (Rate Limit 15 RPM). Please wait a moment before sending another text.');
      } else {
        setError('Could not establish a connection to the companion. Check your configuration key or internet status.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Safe mount initialization execution block
  useEffect(() => {
    if (didOpenRef.current) return;
    didOpenRef.current = true;
    openConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const now = Date.now();
    if (now - lastRequestTimeRef.current < 2000) {
      setError('Please space out your text queries slightly.');
      return;
    }

    setInput('');
    setError('');
    lastRequestTimeRef.current = now;

    if (hasCrisisContent(text)) setShowCrisis(true);

    const updatedMessages = [...messages, { role: 'user', text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const reply = await sendMessage(updatedMessages, systemPrompt);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      if (hasCrisisContent(reply)) setShowCrisis(true);
    } catch (err) {
      if (err.message?.includes('429')) {
        setError('Rate limit hit (15 requests per minute). Take a slow breath, wait a few seconds, and try again.');
      } else {
        setError('Something went wrong processing that response. Let\'s try sending that query again.');
      }
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, systemPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([]);
    setError('');
    setShowCrisis(false);
    didOpenRef.current = true;
    // Allow fresh execution clear
    lastRequestTimeRef.current = 0; 
    setTimeout(() => openConversation(), 100);
  };

  const todayMoodData = todayMood ? getMoodById(todayMood.mood) : null;

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="shrink-0 px-5 pt-2">
        <ScreenHeader
          title="MindEase Companion"
          onBack={onBack}
          right={
            <button type="button" onClick={handleReset} aria-label="New conversation"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-app-surface text-app-muted">
              <RefreshCw size={15} />
            </button>
          }
        />
      </div>

      {/* Context bar */}
      <div className="shrink-0 flex items-center gap-2 px-5 pb-2">
        <Sparkles size={13} className="text-brand" />
        <p className="text-[11px] text-app-muted flex-1">
          {isLiveMode ? 'Powered by Gemini 2.0 Flash' : 'Demo mode — add VITE_GEMINI_API_KEY to .env'}
        </p>
        {todayMoodData && (
          <span className="flex items-center gap-1 rounded-full border border-app-border bg-app-card px-2.5 py-1 text-[11px] text-app-text">
            {todayMoodData.emoji} {todayMoodData.label}
          </span>
        )}
      </div>

      {/* Crisis banner */}
      {showCrisis && <CrisisBanner />}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain py-3 space-y-3">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} userName={userName} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="mx-4 flex items-center gap-2 rounded-xl bg-mood-overwhelmed/10 px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 text-mood-overwhelmed" />
            <p className="text-xs text-app-text">{error}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && !loading && (
        <div className="shrink-0 px-4 pb-2">
          <p className="mb-2 text-[11px] text-app-muted">Suggested</p>
          <div className="flex flex-wrap gap-2">
            {[
              "I'm feeling stressed about school",
              "I just need to vent",
              "Can you suggest a breathing exercise?",
              "I haven't been sleeping well",
            ].map((s) => (
              <button key={s} type="button"
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                className="rounded-full border border-app-border bg-app-card px-3 py-1.5 text-xs text-app-text">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-app-border bg-app-card/95 backdrop-blur-md px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to your companion…"
            rows={1}
            maxLength={500}
            className="flex-1 resize-none rounded-2xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text
                       placeholder:text-app-muted focus:border-brand focus:outline-none
                       max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
            }}
          />
          <button type="button" onClick={handleSend} disabled={!input.trim() || loading}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-soft
                       disabled:opacity-40 transition-opacity">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-app-muted">
          MindEase Companion is not a substitute for professional mental health support.
        </p>
      </div>
    </div>
  );
}