/**
 * Storage layer for MindEase.
 */

const NAMESPACE = 'mindspace';

const KEYS = {
  moodLogs: `${NAMESPACE}.moodLogs`,
  tasks: `${NAMESPACE}.tasks`,
  mindfulness: `${NAMESPACE}.mindfulnessSessions`,
  profile: `${NAMESPACE}.profile`,
  themeMode: `${NAMESPACE}.themeMode`,
  onboarded: `${NAMESPACE}.onboarded`,
};

function readArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[storage] Failed to read "${key}"`, err);
    return [];
  }
}

function writeArray(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
    return true;
  } catch (err) {
    console.error(`[storage] Failed to write "${key}"`, err);
    return false;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ----------------------------- Onboarding ----------------------------- */

export function isOnboarded() {
  return localStorage.getItem(KEYS.onboarded) === 'true';
}

export function setOnboarded() {
  localStorage.setItem(KEYS.onboarded, 'true');
}

/* ----------------------------- Profile ----------------------------- */

export function getProfile() {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return { name: '', status: '' };
    return JSON.parse(raw);
  } catch {
    return { name: '', status: '' };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

/* ----------------------------- Mood logs ----------------------------- */

export function getMoodLogs() {
  return readArray(KEYS.moodLogs).sort((a, b) => b.createdAt - a.createdAt);
}

export function getTodayMoodLog() {
  const todayKey = new Date().toDateString();
  return getMoodLogs().find((log) => new Date(log.createdAt).toDateString() === todayKey);
}

export function saveMoodLog({ mood, note, factors }) {
  const logs = readArray(KEYS.moodLogs);
  const todayKey = new Date().toDateString();
  const existingIndex = logs.findIndex(
    (log) => new Date(log.createdAt).toDateString() === todayKey
  );

  const record = {
    id: existingIndex >= 0 ? logs[existingIndex].id : makeId(),
    mood,
    note: note?.trim() || '',
    factors: factors || [],
    createdAt: existingIndex >= 0 ? logs[existingIndex].createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    logs[existingIndex] = record;
  } else {
    logs.push(record);
  }

  writeArray(KEYS.moodLogs, logs);
  return record;
}

export function deleteMoodLog(id) {
  const logs = readArray(KEYS.moodLogs).filter((log) => log.id !== id);
  writeArray(KEYS.moodLogs, logs);
}

/* -------------------------------- Tasks -------------------------------- */

export function getTasks() {
  return readArray(KEYS.tasks).sort((a, b) => a.createdAt - b.createdAt);
}

export function addTask(title) {
  const tasks = readArray(KEYS.tasks);
  const task = { id: makeId(), title: title.trim(), completed: false, createdAt: Date.now() };
  tasks.push(task);
  writeArray(KEYS.tasks, tasks);
  return task;
}

export function toggleTask(id) {
  const tasks = readArray(KEYS.tasks);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx >= 0) {
    tasks[idx].completed = !tasks[idx].completed;
    writeArray(KEYS.tasks, tasks);
  }
  return tasks;
}

export function deleteTask(id) {
  const tasks = readArray(KEYS.tasks).filter((t) => t.id !== id);
  writeArray(KEYS.tasks, tasks);
  return tasks;
}

export function getRemainingTaskCount() {
  return getTasks().filter((t) => !t.completed).length;
}

/* --------------------------- Mindfulness time --------------------------- */

export function getMindfulnessSessions() {
  return readArray(KEYS.mindfulness);
}

export function logMindfulnessMinutes(minutes) {
  const sessions = readArray(KEYS.mindfulness);
  sessions.push({ id: makeId(), minutes, createdAt: Date.now() });
  writeArray(KEYS.mindfulness, sessions);
  return sessions;
}

export function getTodayMindfulnessMinutes() {
  const todayKey = new Date().toDateString();
  return getMindfulnessSessions()
    .filter((s) => new Date(s.createdAt).toDateString() === todayKey)
    .reduce((sum, s) => sum + s.minutes, 0);
}

/* --------------------------------- Theme --------------------------------- */

export function getThemeMode() {
  return localStorage.getItem(KEYS.themeMode) || 'auto';
}

export function setThemeMode(mode) {
  localStorage.setItem(KEYS.themeMode, mode);
}

export const STORAGE_KEYS = KEYS;

/* ----------------------- Mindfulness Timer (live) ----------------------- */

// Active timer stored in memory only (not persisted across page reloads)
let _activeTimerStart = null;

export function startMindfulnessTimer() {
  _activeTimerStart = Date.now();
}

export function stopMindfulnessTimer() {
  if (!_activeTimerStart) return 0;
  const elapsed = Math.floor((Date.now() - _activeTimerStart) / 1000 / 60); // minutes
  _activeTimerStart = null;
  return elapsed;
}

export function getActiveTimerStart() {
  return _activeTimerStart;
}

/* ---------------------- Completed tasks count ---------------------- */

export function getCompletedTaskCount() {
  return getTasks().filter((t) => t.completed).length;
}
