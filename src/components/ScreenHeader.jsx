import { ChevronLeft } from 'lucide-react';

export default function ScreenHeader({ title, onBack, right = null }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-2">
      <div className="flex w-9 items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-app-text"
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h1 className="text-lg font-bold text-app-text">{title}</h1>
      <div className="flex w-9 items-center justify-end">{right}</div>
    </header>
  );
}
