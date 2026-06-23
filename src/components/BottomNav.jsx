import { Home, Smile, ClipboardList, BookOpen, User, BookHeart } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'journal', label: 'Journal', icon: BookHeart },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md border-t border-app-border bg-app-card/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-6">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex w-full flex-col items-center gap-0.5 py-2.5 transition-colors"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? 'text-brand' : 'text-app-muted'}
                />
                <span className={`text-[9px] font-medium ${isActive ? 'text-brand' : 'text-app-muted'}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
