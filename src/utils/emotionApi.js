/**
 * AI Emotion Integration — PLACEHOLDER ARCHITECTURE ONLY.
 *
 * This module defines the *shape* of the face-emotion pipeline so the UI
 * (see components/EmotionCameraCapture.jsx) can be built and tested today
 * against a mock, then pointed at a real provider later by implementing
 * `callEmotionApi()` — nothing else in the app needs to change.
 *
 * Intended real-world flow (NOT yet active):
 *   1. Request camera access (getUserMedia) — see EmotionCameraCapture.jsx.
 *   2. Draw the current video frame to an off-screen <canvas>.
 *   3. canvas.toBlob() / toDataURL() to get an image payload.
 *   4. POST the image to a cloud face-emotion provider
 *      (e.g. Azure Face API, Hume AI, AWS Rekognition).
 *   5. Map the provider's emotion vector to this app's 5-point mood scale
 *      (Great / Good / Okay / Stressed / Overwhelmed).
 *
 * For the alpha build, callEmotionApi() returns a MOCK response so the
 * camera capture UI is fully testable with zero external dependencies
 * and zero API keys.
 */

export const MOOD_SCALE = ['great', 'good', 'okay', 'stressed', 'overwhelmed'];

/**
 * Maps a raw provider emotion vector (e.g. { happiness, sadness, anger,
 * fear, surprise, neutral }) to this app's 5-point mood scale.
 * Replace the heuristic below with real provider-specific logic when a
 * provider is connected.
 */
export function mapEmotionVectorToMood(vector) {
  const { happiness = 0, sadness = 0, anger = 0, fear = 0, neutral = 0 } = vector || {};

  if (happiness > 0.6) return 'great';
  if (happiness > 0.35 || neutral > 0.5) return 'good';
  if (sadness > 0.4 || fear > 0.4) return 'stressed';
  if (anger > 0.4 || (sadness > 0.3 && fear > 0.3)) return 'overwhelmed';
  return 'okay';
}

/**
 * Sends a captured frame (base64 JPEG/PNG data URL) to the configured
 * cloud emotion-recognition endpoint.
 *
 * Swap the body of this function for a real fetch() call once a provider
 * and API key/proxy are ready, e.g.:
 *
 *   const response = await fetch(import.meta.env.VITE_EMOTION_API_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ image: frameDataUrl }),
 *   });
 *   const data = await response.json();
 *   return { vector: data.faceAttributes.emotion, mood: mapEmotionVectorToMood(data.faceAttributes.emotion) };
 *
 * @param {string} frameDataUrl - base64 data URL of the captured frame.
 * @returns {Promise<{ vector: object, mood: string, mocked: boolean }>}
 */
export async function callEmotionApi(frameDataUrl) {
  // --- MOCK IMPLEMENTATION (active for the alpha build) ---------------
  // Simulates network latency and returns a plausible random emotion
  // vector so the capture UI / state wiring can be fully tested without
  // a live backend or API key.
  await new Promise((resolve) => setTimeout(resolve, 900));

  const mockVector = {
    happiness: Math.random(),
    sadness: Math.random() * 0.5,
    anger: Math.random() * 0.3,
    fear: Math.random() * 0.3,
    neutral: Math.random() * 0.6,
  };

  return {
    vector: mockVector,
    mood: mapEmotionVectorToMood(mockVector),
    mocked: true,
    frameReceived: Boolean(frameDataUrl),
  };
  // ----------------------------------------------------------------------
}

/**
 * Captures a single still frame from a live <video> element and returns
 * it as a base64 data URL, using an off-screen canvas. Ready to use once
 * camera capture is wired into a screen.
 */
export function captureFrameFromVideo(videoEl) {
  if (!videoEl || !videoEl.videoWidth) return null;
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}
