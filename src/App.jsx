import { useCallback, useState } from 'react';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import MoodTracker from './screens/MoodTracker';
import Tasks from './screens/Tasks';
import Resources from './screens/Resources';
import Profile from './screens/Profile';
import Journal from './screens/Journal';
import Chat from './screens/Chat';
import Onboarding from './screens/Onboarding';
import { useTheme } from './hooks/useTheme';
import { isOnboarded, getProfile } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const themeState = useTheme();
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [profile, setProfile] = useState(() => getProfile());

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const goHome = useCallback(() => setActiveTab('home'), []);

  const handleOnboardComplete = (profileData) => {
    setProfile(profileData);
    setOnboarded(true);
  };

  const handleProfileChanged = useCallback(() => {
    setProfile(getProfile());
    bumpRefresh();
  }, [bumpRefresh]);

  if (!onboarded) return <Onboarding onComplete={handleOnboardComplete} />;

  let screen;
  switch (activeTab) {
    case 'mood':      screen = <MoodTracker onBack={goHome} onSaved={bumpRefresh} />; break;
    case 'tasks':     screen = <Tasks onBack={goHome} onChanged={bumpRefresh} />; break;
    case 'resources': screen = <Resources onBack={goHome} />; break;
    case 'journal':   screen = <Journal onBack={goHome} />; break;
    case 'chat':      screen = <Chat onBack={goHome} />; break;
    case 'profile':
      screen = <Profile onBack={goHome} profile={profile} themeState={themeState} onChanged={handleProfileChanged} />;
      break;
    default:
      screen = (
        <Home
          userName={profile.name || 'Friend'}
          userStatus={profile.status}
          onNavigate={setActiveTab}
          refreshKey={refreshKey}
          onChanged={bumpRefresh}
        />
      );
  }

  return (
    <div className="min-h-screen bg-app-surface sm:bg-app-bg sm:py-6 sm:px-4">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-app-bg
                      sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2rem] sm:overflow-hidden sm:shadow-soft">
        <div className="h-full overflow-y-auto overscroll-contain">
          {screen}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
