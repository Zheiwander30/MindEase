/**
 * AI Emotion Detection — face-api.js (100% on-device, no API key needed)
 *
 * face-api.js runs TensorFlow.js models entirely in the browser.
 * No data ever leaves the device. No API key. No cost. Works offline.
 *
 * SETUP (one-time):
 *   1. Run: npm install face-api.js
 *   2. Download the model weights into /public/models/ by running the
 *      download script: node scripts/download-models.js
 *      (or manually from https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
 *
 *      Required files in /public/models/:
 *        tiny_face_detector_model-weights_manifest.json
 *        tiny_face_detector_model-shard1
 *        face_expression_model-weights_manifest.json
 *        face_expression_model-shard1
 *
 * HOW IT WORKS:
 *   captureFrameFromVideo() grabs a single JPEG frame from the live <video>.
 *   detectEmotionFromVideo() runs TinyFaceDetector + FaceExpressionNet on the
 *   frame directly (no upload), and returns the dominant expression mapped to
 *   the app's 5-point mood scale.
 *
 * PRIVACY: Everything runs locally. Zero network requests. Zero data sent anywhere.
 */

// face-api.js expression labels → app mood scale
const EXPRESSION_TO_MOOD = {
  happy:     'great',
  neutral:   'okay',
  surprised: 'good',
  sad:       'stressed',
  fearful:   'stressed',
  disgusted: 'overwhelmed',
  angry:     'overwhelmed',
};

const MOOD_REASONING = {
  happy:     'You appear to be smiling — that is a great sign!',
  neutral:   'Your expression looks calm and composed.',
  surprised: 'You look alert and engaged.',
  sad:       'You seem a little down. That is okay.',
  fearful:   'You look a bit anxious or worried.',
  disgusted: 'You seem uncomfortable or frustrated.',
  angry:     'There is some tension in your expression.',
};

let _faceapi = null;
let _modelsLoaded = false;

/**
 * Lazy-loads face-api.js and the required model weights.
 * Models are served from /public/models/ (local, no network needed after setup).
 */
async function loadModels() {
  if (_modelsLoaded) return _faceapi;

  // Dynamic import so face-api.js isn't bundled unless the camera feature is used
  _faceapi = await import('face-api.js');

  const MODEL_URL = '/models';
  await Promise.all([
    _faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    _faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);

  _modelsLoaded = true;
  return _faceapi;
}

/**
 * Runs emotion detection on a live <video> element.
 * Returns { mood, expression, reasoning, mocked: false } or falls back to mock.
 *
 * @param {HTMLVideoElement} videoEl
 * @returns {Promise<{ mood: string, expression: string, reasoning: string, mocked: boolean }>}
 */
export async function detectEmotionFromVideo(videoEl) {
  try {
    const faceapi = await loadModels();

    const detection = await faceapi
      .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) {
      return { mood: null, expression: null, reasoning: 'No face detected. Make sure your face is visible and well-lit.', mocked: false, noFace: true };
    }

    // Find the dominant expression
    const expressions = detection.expressions;
    const dominant = Object.entries(expressions).reduce(
      (best, [expr, score]) => (score > best[1] ? [expr, score] : best),
      ['neutral', 0]
    );

    const expression = dominant[0];
    const mood = EXPRESSION_TO_MOOD[expression] ?? 'okay';
    const reasoning = MOOD_REASONING[expression] ?? 'Expression detected.';

    return { mood, expression, reasoning, confidence: dominant[1], mocked: false };

  } catch (err) {
    // Models not downloaded yet or other setup issue → fall back to mock
    console.warn('[EmotionAPI] face-api.js error, using mock:', err.message);
    return _mockResponse(err.message.includes('404') || err.message.includes('load'));
  }
}

/**
 * Legacy function kept for compatibility — just runs detectEmotionFromVideo
 * on the video element instead of a captured frame.
 */
export async function callEmotionApi(videoEl) {
  return detectEmotionFromVideo(videoEl);
}

function _mockResponse(modelsNotDownloaded = false) {
  const expressions = ['happy', 'neutral', 'surprised', 'sad'];
  const expression = expressions[Math.floor(Math.random() * expressions.length)];
  return {
    mood: EXPRESSION_TO_MOOD[expression],
    expression,
    reasoning: modelsNotDownloaded
      ? 'Models not found — run the download script to enable live detection. Showing demo result.'
      : MOOD_REASONING[expression],
    mocked: true,
    modelsNotDownloaded,
  };
}

/**
 * Captures a still frame from a <video> for display purposes only.
 * Detection itself runs on the live video element, not a canvas.
 */
export function captureFrameFromVideo(videoEl) {
  if (!videoEl || !videoEl.videoWidth) return null;
  const scale = Math.min(1, 640 / videoEl.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(videoEl.videoWidth  * scale);
  canvas.height = Math.round(videoEl.videoHeight * scale);
  canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.80);
}
