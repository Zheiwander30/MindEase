import { useMemo, useState } from 'react';
import {
  Search, Leaf, MessageCircle, BookOpen, Phone, Users,
  Globe, HeartHandshake, ChevronRight, ExternalLink,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';

// ─── Quick Access (top 3 cards) ────────────────────────────────────
const QUICK_ACCESS = [
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    description: 'Guided breathing & relaxation',
    icon: Leaf,
    tint: 'bg-mood-great/15 text-mood-great',
    url: 'https://www.headspace.com/meditation/stress',
  },
  {
    id: 'talk',
    label: 'Talk to Someone',
    description: 'Free online listener chat',
    icon: MessageCircle,
    tint: 'bg-brand/15 text-brand',
    url: 'https://www.7cups.com',
  },
  {
    id: 'selfhelp',
    label: 'Self Help',
    description: 'Articles & well-being tips',
    icon: BookOpen,
    tint: 'bg-mood-okay/20 text-mood-okay',
    url: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/',
  },
];

// ─── Support Service Categories ────────────────────────────────────
const SUPPORT_CATEGORIES = [
  {
    id: 'helpline',
    label: '24/7 Helpline',
    icon: Phone,
    tint: 'bg-mood-overwhelmed/15 text-mood-overwhelmed',
    services: [
      {
        id: 'intouch',
        name: 'In Touch Crisis Line',
        detail: 'Free, confidential crisis support available around the clock for anyone in the Philippines.',
        contact: '(02) 8893-7603',
        action: 'tel:+6328893-7603',
        actionLabel: 'Call',
        badge: '24/7 · Free',
        keywords: ['crisis', 'call', 'phone', 'helpline', 'emergency', 'philippines'],
      },
      {
        id: 'hopeline',
        name: 'Hopeline Philippines',
        detail: 'Suicide prevention and mental health crisis line by the Natasha Goulbourn Foundation.',
        contact: '(02) 8804-4673 · 0917-558-4673',
        action: 'tel:+6328804-4673',
        actionLabel: 'Call',
        badge: '24/7 · Free',
        keywords: ['suicide', 'crisis', 'hopeline', 'hotline', 'philippines'],
      },
    ],
  },
  {
    id: 'counseling',
    label: 'Campus Counseling Center',
    icon: Users,
    tint: 'bg-brand/15 text-brand',
    services: [
      {
        id: 'school',
        name: 'School Counseling Office',
        detail: 'Book a free, confidential appointment with a licensed counselor at your school wellness center.',
        contact: 'Check your school portal',
        action: 'https://www.mapua.edu.ph/pages/services/campus/guidance-and-counseling',
        actionLabel: 'Book appointment',
        badge: 'On-campus',
        keywords: ['campus', 'school', 'counselor', 'appointment', 'therapist', 'book'],
      },
      {
        id: 'mhap',
        name: 'Mental Health Association of the Philippines',
        detail: 'Provides referrals and psychosocial support. Call or visit their site to find counselors near you.',
        contact: '(02) 921-4958 · mhap.ph',
        action: 'https://www.mhap.ph',
        actionLabel: 'Visit website',
        badge: 'Referrals',
        keywords: ['referral', 'mhap', 'philippines', 'association', 'mental health'],
      },
    ],
  },
  {
    id: 'online',
    label: 'Online Resources',
    icon: Globe,
    tint: 'bg-mood-good/20 text-mood-good',
    services: [
      {
        id: '7cups',
        name: '7 Cups — Free Anonymous Chat',
        detail: 'Talk to a trained volunteer listener instantly, for free, with no sign-up required.',
        contact: '7cups.com',
        action: 'https://www.7cups.com',
        actionLabel: 'Start chatting',
        badge: 'Free · Anonymous',
        keywords: ['chat', 'online', '7cups', 'listener', 'anonymous', 'free'],
      },
      {
        id: 'who',
        name: 'WHO Philippines — Youth Mental Health',
        detail: 'World Health Organization resources on managing stress, anxiety and well-being for young people.',
        contact: 'who.int/philippines',
        action: 'https://www.who.int/philippines/health-topics/mental-health',
        actionLabel: 'Explore',
        badge: 'Info · Free',
        keywords: ['who', 'online', 'articles', 'information', 'youth', 'resources'],
      },
      {
        id: 'befrienders',
        name: 'Befrienders Worldwide',
        detail: 'Global directory of crisis helplines — find the right line for any country.',
        contact: 'befrienders.org',
        action: 'https://www.befrienders.org/find-a-helpline',
        actionLabel: 'Find helpline',
        badge: 'Global directory',
        keywords: ['international', 'global', 'directory', 'helpline', 'online'],
      },
    ],
  },
  {
    id: 'crisis',
    label: 'Crisis Support',
    icon: HeartHandshake,
    tint: 'bg-mood-stressed/15 text-mood-stressed',
    services: [
      {
        id: 'intouch-crisis',
        name: 'In Touch — Immediate Crisis Line',
        detail: 'If you are in immediate emotional danger, please call In Touch now. They are trained to help.',
        contact: '(02) 8893-7603',
        action: 'tel:+6328893-7603',
        actionLabel: 'Call now',
        badge: '24/7 · Immediate',
        keywords: ['crisis', 'urgent', 'immediate', 'danger', 'emergency'],
      },
    ],
  },
];

// flatten all services for search
const ALL_SERVICES = SUPPORT_CATEGORIES.flatMap((cat) =>
  cat.services.map((s) => ({ ...s, catId: cat.id }))
);

function isPhone(url) {
  return url?.startsWith('tel:');
}

export default function Resources({ onBack }) {
  const [query, setQuery] = useState('');
  const [expandedService, setExpandedService] = useState(null);

  const q = query.trim().toLowerCase();

  const filteredQuick = useMemo(
    () => q
      ? QUICK_ACCESS.filter((i) => [i.label, i.description].some((f) => f.toLowerCase().includes(q)))
      : QUICK_ACCESS,
    [q]
  );

  // When searching, flatten; when not, show by category
  const searchResults = useMemo(() => {
    if (!q) return null;
    return ALL_SERVICES.filter((s) =>
      [s.name, s.detail, s.contact, ...(s.keywords || [])].some((f) => f?.toLowerCase().includes(q))
    );
  }, [q]);

  const filteredCategories = useMemo(() => {
    if (q) return null;
    return SUPPORT_CATEGORIES;
  }, [q]);

  const noResults = q && filteredQuick.length === 0 && searchResults?.length === 0;

  return (
    <div className="px-5 pb-28 pt-2">
      <ScreenHeader title="Resources" onBack={onBack} />

      {/* Search */}
      <div className="relative mt-2">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources, helplines…"
          className="w-full rounded-xl border border-app-border bg-app-card py-2.5 pl-10 pr-3 text-sm text-app-text placeholder:text-app-muted focus:border-brand focus:outline-none"
        />
      </div>

      {/* Quick Access */}
      {filteredQuick.length > 0 && (
        <>
          <h2 className="mt-6 mb-3 text-sm font-bold text-app-text">Quick Access</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {filteredQuick.map(({ id, label, description, icon: Icon, tint, url }) => (
              <a key={id} href={url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-start gap-2 rounded-2xl border border-app-border bg-app-card p-4 shadow-card text-left">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
                  <Icon size={17} />
                </span>
                <span className="text-xs font-bold leading-tight text-app-text">{label}</span>
                <span className="text-[11px] leading-tight text-app-muted">{description}</span>
                <ExternalLink size={11} className="text-app-muted" />
              </a>
            ))}
          </div>
        </>
      )}

      {/* Support Services — categorized */}
      {filteredCategories && (
        <>
          <h2 className="mt-7 mb-3 text-sm font-bold text-app-text">Support Services</h2>
          <div className="flex flex-col gap-5">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                {/* Category header */}
                <div className="mb-2 flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${cat.tint}`}>
                    <cat.icon size={15} />
                  </span>
                  <p className="text-sm font-bold text-app-text">{cat.label}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {cat.services.map((svc) => {
                    const isOpen = expandedService === svc.id;
                    return (
                      <Card key={svc.id} className="p-0 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedService(isOpen ? null : svc.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-app-text">{svc.name}</p>
                            <p className="text-xs text-app-muted">{svc.contact}</p>
                          </div>
                          {svc.badge && (
                            <span className="shrink-0 rounded-full border border-app-border px-2 py-0.5 text-[10px] font-semibold text-app-muted">
                              {svc.badge}
                            </span>
                          )}
                          <ChevronRight size={16} className={`shrink-0 text-app-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="border-t border-app-border px-4 pb-4 pt-3 space-y-3">
                            <p className="text-xs leading-relaxed text-app-muted">{svc.detail}</p>
                            <a
                              href={svc.action}
                              target={isPhone(svc.action) ? undefined : '_blank'}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
                            >
                              {isPhone(svc.action) ? <Phone size={13} /> : <ExternalLink size={13} />}
                              {svc.actionLabel}
                            </a>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search results (flat list) */}
      {searchResults && searchResults.length > 0 && (
        <>
          <h2 className="mt-7 mb-3 text-sm font-bold text-app-text">Search Results</h2>
          <div className="flex flex-col gap-2">
            {searchResults.map((svc) => {
              const isOpen = expandedService === svc.id;
              return (
                <Card key={svc.id} className="p-0 overflow-hidden">
                  <button type="button" onClick={() => setExpandedService(isOpen ? null : svc.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-app-text">{svc.name}</p>
                      <p className="text-xs text-app-muted">{svc.contact}</p>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 text-app-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-app-border px-4 pb-4 pt-3 space-y-3">
                      <p className="text-xs leading-relaxed text-app-muted">{svc.detail}</p>
                      <a href={svc.action} target={isPhone(svc.action) ? undefined : '_blank'} rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
                        {isPhone(svc.action) ? <Phone size={13} /> : <ExternalLink size={13} />}
                        {svc.actionLabel}
                      </a>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {noResults && (
        <p className="mt-10 text-center text-sm text-app-muted">
          No resources match "{query}". Try a different search.
        </p>
      )}
    </div>
  );
}
