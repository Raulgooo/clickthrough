import { useState, useEffect } from 'react';
import { cn } from '@/utils/classNames';
import { PrimitiveGallery } from '@/components/PrimitiveGallery';
import {
  VerifyDemo,
  UnderstandDemo,
  ActDemo,
  RespondDemo,
  SummarizeDemo,
  CompareDemo,
  HarnessDemo,
} from '@/demos';

type Route = 'gallery' | 'verify' | 'understand' | 'act' | 'respond' | 'summarize' | 'compare' | 'harness';

const navItems: { route: Route; label: string }[] = [
  { route: 'gallery', label: 'Gallery' },
  { route: 'harness', label: 'Harness' },
  { route: 'verify', label: 'Verify' },
  { route: 'understand', label: 'Understand' },
  { route: 'act', label: 'Act' },
  { route: 'respond', label: 'Respond' },
  { route: 'summarize', label: 'Summarize' },
  { route: 'compare', label: 'Compare' },
];

export const App = () => {
  const [route, setRoute] = useState<Route>('harness');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      {/* Top navigation bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-3 h-12 bg-surface border-b border-outline">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary font-bold text-[10px]">CT</div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">Clickthrough</span>
        </div>
        <nav className="hidden md:flex gap-4">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => setRoute(item.route)}
              className={cn(
                "px-2 py-1 rounded font-label-mono text-label-mono transition-colors",
                route === item.route
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1 hover:bg-surface-container-high rounded"
          title="Toggle theme"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">contrast</span>
        </button>
      </header>

      {/* Main content */}
      <main className="pt-12">
        {route === 'gallery' && <PrimitiveGallery />}
        {route === 'harness' && <HarnessDemo />}
        {route === 'verify' && <VerifyDemo />}
        {route === 'understand' && <UnderstandDemo />}
        {route === 'act' && <ActDemo />}
        {route === 'respond' && <RespondDemo />}
        {route === 'summarize' && <SummarizeDemo />}
        {route === 'compare' && <CompareDemo />}
      </main>
    </div>
  );
};

export default App;
