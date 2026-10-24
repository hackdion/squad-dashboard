import { useEffect, useState } from 'react';
import { NexusProvider, useNexus } from './state/nexus';
import { AppShell, TITLES } from './components/AppShell';
import Overview from './pages/Overview';
import Tactical from './pages/Tactical';
import Squad from './pages/Squad';
import Operators from './pages/Operators';
import MapsPage from './pages/MapsPage';
import Stats from './pages/Stats';
import Customize from './pages/Customize';

function currentRoute(): string {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return '/';
  return raw.startsWith('/') ? raw.replace(/\/+$/, '') || '/' : `/${raw}`;
}

function Router() {
  const { accentClass } = useNexus();
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const page = (() => {
    switch (route) {
      case '/':
        return <Overview />;
      case '/tactical':
        return <Tactical />;
      case '/squad':
        return <Squad />;
      case '/operators':
        return <Operators />;
      case '/maps':
        return <MapsPage />;
      case '/stats':
        return <Stats />;
      case '/custom':
        return <Customize />;
      default:
        return <Overview />;
    }
  })();

  return (
    <div className={accentClass}>
      <AppShell route={route} title={TITLES[route]} flush={route === '/tactical'}>
        {page}
      </AppShell>
    </div>
  );
}

export default function App() {
  return (
    <NexusProvider>
      <Router />
    </NexusProvider>
  );
}
