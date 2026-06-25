/**
 * download-models.js
 * Downloads the face-api.js model weights needed for on-device
 * emotion detection and saves them to /public/models/.
 *
 * Run once after npm install:
 *   node scripts/download-models.js
 */

import https from 'https';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'models');

const BASE_URL  = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const FILES = [
  // Tiny face detector (fast, lightweight)
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  // Face expression / emotion network
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];

fs.mkdirSync(OUT_DIR, { recursive: true });

async function download(filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(OUT_DIR, filename);
    if (fs.existsSync(dest)) {
      console.log(`  ✓ Already exists: ${filename}`);
      resolve();
      return;
    }
    const file = fs.createWriteStream(dest);
    https.get(`${BASE_URL}/${filename}`, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${filename}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`  ↓ Downloaded: ${filename}`); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

console.log(`\nDownloading face-api.js models → ${OUT_DIR}\n`);
for (const file of FILES) {
  await download(file);
}
console.log('\n✅ All models ready. You can now use AI Mood Scan.\n');
