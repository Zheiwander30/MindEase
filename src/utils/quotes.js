// ─────────────────────────────────────────────────────────────────
// DEV CORPUS — add your own motivational quotes here.
// Format: { text: '...', author: '...' }
// author is optional — leave it out for anonymous quotes.
// ─────────────────────────────────────────────────────────────────
export const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", author: 'Lori Deschene' },
  { text: "Mental health is not a destination but a process. It's about how you drive, not where you're going.", author: 'Noam Shpancer' },
  { text: "There is hope, even when your brain tells you there isn't.", author: 'John Green' },
  { text: 'You are not your illness. You have an individual story to tell.', author: 'Julian Seifter' },
  { text: 'Healing is not linear.' },
  { text: 'What mental health needs is more sunlight, more candor, more unashamed conversation.', author: 'Glenn Close' },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: 'Dan Millman' },
  { text: 'Self-care is how you take your power back.', author: 'Lalah Delia' },
  { text: 'Sometimes the bravest thing you can do is ask for help.' },
  { text: "It's okay to not be okay — as long as you are not giving up.", author: 'Karen Salmansohn' },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: 'Nido Qubein' },
  { text: 'Difficult roads often lead to beautiful destinations.' },
  { text: 'Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.', author: 'Max Ehrmann' },
  { text: 'The strongest people are not those who show strength in front of us but those who win battles we know nothing about.' },
  { text: 'Take it one day at a time. One breath. One moment.' },
];

/**
 * Returns a quote that changes once per day.
 * Rotates through the full list before repeating.
 */
export function getDailyQuote(date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return QUOTES[seed % QUOTES.length];
}
