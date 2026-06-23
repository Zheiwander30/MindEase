# MindEase — Student Wellness App (Alpha)

A student wellness app aligned with **SDG 3 (Good Health and
Well-being)**: mood tracking, mindfulness time, tasks, and a curated
resources/helpline directory.

## Stack

- Vite 5 + React 18 (functional components only)
- Tailwind CSS 3 (utility-first, CSS-variable-driven theming)
- `localStorage` for all persistence — no backend required
- `lucide-react` for icons

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL — the app is laid out as a mobile viewport
(`max-w-md`, centered) so it reads correctly on desktop browsers too.

## Project structure

```
src/
  components/        Reusable UI: BottomNav, Card, MoodEmojiPicker,
                      ScreenHeader, EmotionCameraCapture (AI placeholder)
  screens/            Home, MoodTracker, Tasks, Resources, Profile
  hooks/              useTheme.js — wires theme.js to localStorage + clock
  utils/
    storage.js        localStorage CRUD layer (see "Storage format" below)
    theme.js           Pure functions: time → theme, no React/DOM here
    emotionApi.js      Mocked cloud-emotion-API contract (see below)
    moods.js            Shared 5-point mood scale + factor tags
    dailyTips.js        Rotating "Daily Tip" copy
  App.jsx              Mobile-viewport shell + tab router
  index.css            Theme tokens (light/day/night/dark) as CSS variables
```

## Storage format

Every collection (mood logs, tasks, mindfulness sessions) is stored as a
**JSON array of objects** under one namespaced `localStorage` key, e.g.:

```
mindspace.moodLogs -> [{ id, mood, note, factors, createdAt, updatedAt }, ...]
```

This was chosen over one-key-per-record or one-key-per-day because:

- Aggregation (today's task count, today's mindfulness minutes, a future
  weekly mood trend) is a plain `.filter()`/`.reduce()` over one array.
- Each record's own `id` + `createdAt` makes edits/deletes simple array
  operations instead of constructing/parsing many small keys.
- It maps 1:1 onto what a real JSON REST API would return later, so
  swapping `localStorage` for a backend is a drop-in change to
  `utils/storage.js` only — no screen needs to change.

## Theming: Auto / Light / Dark, synced to the system clock

`utils/theme.js` exposes `getAutoTheme(date)`, a pure function that reads
the browser `Date` API and returns:

- **`'day'`** between 6:00 AM and 6:00 PM
- **`'night'`** (a dimmed, soothing indigo palette) from 6:00 PM–6:00 AM

`hooks/useTheme.js` persists the user's chosen **mode** (`auto` / `light`
/ `dark`) to `localStorage`, resolves it to a concrete theme, writes it to
`<html data-theme="...">`, and re-checks the clock every 60s so Night mode
turns on live at 6:00 PM without a refresh. All four palettes
(`light`, `day`, `night`, `dark`) are defined once in `src/index.css` as
CSS variables; components only ever use semantic Tailwind classes
(`bg-app-card`, `text-brand`, `bg-mood-great`, …), so no component code
branches on theme.

Change the mode from **Profile → Appearance**.

## AI emotion integration (placeholder, not yet wired to a provider)

Per the brief, the camera-based emotion detector is scaffolded but
**intentionally mocked** so the rest of the app can be tested first:

- `components/EmotionCameraCapture.jsx` requests `getUserMedia`, streams
  video, and on "Capture" grabs a still frame via an off-screen canvas.
- `utils/emotionApi.js` defines `callEmotionApi(frameDataUrl)` — the
  function that will eventually `POST` the frame to a provider like Azure
  Face API or Hume AI. Today it returns a randomized **mock** emotion
  vector after a simulated delay, and `mapEmotionVectorToMood()` shows how
  a real provider's vector (`happiness`, `sadness`, `anger`, `fear`,
  `neutral`) would map onto this app's 5-point mood scale.
- To go live: replace the body of `callEmotionApi()` with a real `fetch()`
  call (a sample request is commented inline) and point it at a proxy
  that holds your API key — never call a paid vision API directly from
  the client with a secret key embedded.

Try it from the Mood Tracker screen via "Try AI mood scan (beta)".

## Notes for the team

- No router library is used — navigation is a single `activeTab` state in
  `App.jsx`, which is enough for 5 flat tabs and keeps the alpha dependency
  surface minimal. Swap in `react-router` later if deep-linking is needed.
- `Tasks` and `Profile` screens were added beyond the 3 core screens in
  the brief so the bottom nav (which has 5 tabs in the reference design)
  is fully functional and `Today's Overview` on Home has real data to show.
