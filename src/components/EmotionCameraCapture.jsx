import { useEffect, useRef, useState } from 'react';
import { Camera, X, Loader2, AlertCircle, CheckCircle2, Info, FolderDown } from 'lucide-react';
import { detectEmotionFromVideo } from '../utils/emotionApi';
import { getMoodById } from '../utils/moods';

export default function EmotionCameraCapture({ onDetected, onClose }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const overlayRef = useRef(null);

  const [status, setStatus]   = useState('requesting'); // requesting | loading | live | analyzing | result | error | noface
  const [error,  setError]    = useState('');
  const [result, setResult]   = useState(null);

  /* ── Camera start ── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setStatus('live');
      } catch (err) {
        setError(err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Camera unavailable on this device or browser.');
        setStatus('error');
      }
    })();
    return () => { mounted = false; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  /* ── Escape to close ── */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  /* ── Scan ── */
  const handleScan = async () => {
    setStatus('analyzing');
    const res = await detectEmotionFromVideo(videoRef.current);

    if (res.noFace) {
      setStatus('noface');
      setError(res.reasoning);
      return;
    }

    setResult(res);
    setStatus('result');
  };

  const handleAccept  = () => { onDetected?.(result.mood, result); onClose(); };
  const handleRetry   = () => { setResult(null); setError(''); setStatus('live'); };
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  const mood = result ? getMoodById(result.mood) : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-5"
    >
      <div className="w-full sm:max-w-sm bg-app-card rounded-t-3xl sm:rounded-3xl shadow-soft overflow-hidden animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-app-border">
          <div>
            <p className="text-sm font-bold text-app-text">
              AI Mood Scan
              <span className="ml-2 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">BETA</span>
            </p>
            <p className="text-xs text-app-muted mt-0.5">On-device · No data sent anywhere</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-app-surface text-app-muted">
            <X size={16} />
          </button>
        </div>

        {/* ── Camera viewport ── */}
        <div className="relative mx-5 mt-4 aspect-square overflow-hidden rounded-2xl bg-black">

          {/* Live video — always mounted to keep stream alive */}
          <video
            ref={videoRef}
            muted playsInline
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              status === 'result' ? 'opacity-20' : 'opacity-100'
            }`}
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Face guide oval (live only) */}
          {status === 'live' && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-48 w-36 rounded-full border-2 border-white/40" />
              <p className="absolute bottom-3 text-[11px] text-white/50">Centre your face in the oval</p>
            </div>
          )}

          {/* Requesting camera */}
          {status === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
              <Loader2 size={26} className="animate-spin text-white" />
              <p className="text-xs text-white/70">Starting camera…</p>
            </div>
          )}

          {/* Loading models */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
              <Loader2 size={26} className="animate-spin text-white" />
              <p className="text-sm font-semibold text-white">Loading AI model…</p>
              <p className="text-[11px] text-white/50">First run takes a moment</p>
            </div>
          )}

          {/* Analyzing */}
          {status === 'analyzing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <Loader2 size={30} className="animate-spin text-white" />
              <p className="text-sm font-semibold text-white">Analyzing expression…</p>
            </div>
          )}

          {/* No face */}
          {status === 'noface' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
              <AlertCircle size={28} className="text-mood-okay" />
              <p className="text-xs text-white/80">{error}</p>
            </div>
          )}

          {/* Camera / permission error */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
              <AlertCircle size={28} className="text-mood-overwhelmed" />
              <p className="text-xs text-white/80">{error}</p>
            </div>
          )}

          {/* Result overlay */}
          {status === 'result' && mood && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={20} className="text-mood-great" />
              <span className="text-5xl">{mood.emoji}</span>
              <p className="text-base font-bold text-white">{mood.label}</p>
              {result.mocked && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] text-white/60">
                  {result.modelsNotDownloaded ? 'Models missing — demo result' : 'Demo mode'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Models-not-downloaded warning ── */}
        {result?.modelsNotDownloaded && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-xl bg-mood-okay/10 border border-mood-okay/20 px-3 py-2.5">
            <FolderDown size={14} className="mt-0.5 shrink-0 text-mood-okay" />
            <p className="text-[11px] leading-relaxed text-app-text">
              Model files not found. Run{' '}
              <code className="rounded bg-app-surface px-1 py-0.5 text-[10px] font-mono text-brand">
                node scripts/download-models.js
              </code>{' '}
              once to enable live detection.
            </p>
          </div>
        )}

        {/* ── Reasoning text after result ── */}
        {status === 'result' && result?.reasoning && !result.modelsNotDownloaded && (
          <div className="mx-5 mt-3 rounded-xl bg-app-surface px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-app-muted italic">"{result.reasoning}"</p>
            {result.confidence != null && (
              <p className="mt-1 text-[10px] text-app-muted">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {/* ── Privacy notice (pre-result) ── */}
        {!['result'].includes(status) && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-xl bg-app-surface px-3 py-2.5">
            <Info size={13} className="mt-0.5 shrink-0 text-app-muted" />
            <p className="text-[11px] leading-relaxed text-app-muted">
              Detection runs entirely on your device using face-api.js. No images or data are sent anywhere.
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-2.5 px-5 pb-6 pt-3">
          {status === 'result' ? (
            <>
              <button type="button" onClick={handleRetry}
                className="flex-1 rounded-xl border border-app-border py-3 text-sm font-semibold text-app-text">
                Retry
              </button>
              <button type="button" onClick={handleAccept}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white">
                Use this mood
              </button>
            </>
          ) : status === 'error' ? (
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl bg-app-surface py-3 text-sm font-semibold text-app-text">
              Close
            </button>
          ) : status === 'noface' ? (
            <>
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl border border-app-border py-3 text-sm font-semibold text-app-text">
                Cancel
              </button>
              <button type="button" onClick={handleRetry}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white">
                Try again
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl border border-app-border py-3 text-sm font-semibold text-app-text">
                Cancel
              </button>
              <button type="button" onClick={handleScan} disabled={status !== 'live'}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-40">
                <Camera size={15} />
                Scan
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export function detectedMoodLabel(moodId) {
  return getMoodById(moodId)?.label ?? 'Okay';
}
