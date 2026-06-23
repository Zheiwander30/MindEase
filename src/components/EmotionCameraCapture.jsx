import { useEffect, useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { callEmotionApi, captureFrameFromVideo } from '../utils/emotionApi';
import { getMoodById } from '../utils/moods';

/**
 * Self-contained "Scan my mood" entry point. Opens the device camera,
 * captures a single frame, and runs it through utils/emotionApi.js
 * (currently mocked — see that file for the real-provider wiring plan).
 *
 * Not connected to any save action yet; onDetected(moodId) lets a parent
 * screen decide what to do with the result (e.g. pre-fill the mood
 * picker) once real detection is plugged in.
 */
export default function EmotionCameraCapture({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('requesting'); // requesting | live | analyzing | error
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('live');
      } catch (err) {
        console.error('[EmotionCameraCapture] camera access failed', err);
        setError('Camera access was denied or is unavailable on this device.');
        setStatus('error');
      }
    }

    startCamera();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = async () => {
    setStatus('analyzing');
    const frame = captureFrameFromVideo(videoRef.current);
    const result = await callEmotionApi(frame);
    onDetected?.(result.mood, result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-app-card shadow-soft">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-sm font-semibold text-app-text">AI mood scan (beta)</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-app-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mx-4 mt-3 aspect-square overflow-hidden rounded-2xl bg-app-surface">
          {status === 'error' ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <Camera size={28} className="text-app-muted" />
              <p className="text-xs text-app-muted">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}

          {status === 'analyzing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
              <Loader2 size={26} className="animate-spin text-white" />
              <p className="text-xs font-medium text-white">Reading expression…</p>
            </div>
          )}
        </div>

        <p className="px-5 pb-1 pt-3 text-center text-[11px] text-app-muted">
          This is a placeholder using mock results — no image leaves your device yet.
        </p>

        <div className="flex gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-app-border py-2.5 text-sm font-semibold text-app-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={status !== 'live'}
            className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}

export function detectedMoodLabel(moodId) {
  return getMoodById(moodId)?.label ?? 'Okay';
}
