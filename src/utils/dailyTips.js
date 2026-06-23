// ─────────────────────────────────────────────────────────────────
// DEV CORPUS — add as many tips as you like here.
// They are shown in random order, changing each day.
// ─────────────────────────────────────────────────────────────────
export const TIPS = [
  // Encouragement
  "It's okay to take a break. You're doing your best.",
  'Small steps still move you forward. One task at a time.',
  'Rest is productive too. Give yourself permission to pause.',
  'You are not behind — you are exactly where you need to be.',
  'Progress, not perfection. Today counts.',
  'Asking for help is a sign of strength, not weakness.',
  'A five-minute breath break can reset a hard hour.',

  // Mindfulness
  'Take three slow, deep breaths before you start your next task.',
  'Notice five things you can see right now. Ground yourself.',
  'Your thoughts are not facts. Observe them, then let them pass.',
  'Being present in this moment is always enough.',

  // Self-compassion
  'Speak to yourself the way you would speak to a good friend.',
  "You don't have to earn rest. It's a basic need.",
  'One difficult day does not define your whole semester.',
  'You are more than your grades or your productivity.',

  // Student-specific
  'Break big assignments into three small steps and tackle the first one.',
  'Sleep is the best study tool — protect it.',
  'A short walk between study sessions can boost focus.',
  'It is okay to say no to things that drain you.',
  'Connect with one person today, even just a quick message.',
];

/**
 * Returns a random tip that changes once per day.
 * The seed is based on the calendar date so it stays
 * consistent throughout the day but rotates daily.
 */
export function getDailyTip(date = new Date()) {
  // Use date string as a simple seed
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  // Simple deterministic shuffle index from seed
  const index = seed % TIPS.length;
  return TIPS[index];
}
