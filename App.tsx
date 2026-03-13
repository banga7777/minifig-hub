
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect, Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate, useNavigationType } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import ReactDOM from 'react-dom/client';

const Home = lazy(() => import('./pages/Home'));
const Collection = lazy(() => import('./pages/Collection'));
const MinifigDetail = lazy(() => import('./pages/MinifigDetail'));
const ThemeDetail = lazy(() => import('./pages/ThemeDetail'));
const ThemeList = lazy(() => import('./pages/ThemeList'));
const Stats = lazy(() => import('./pages/Stats'));
const Auth = lazy(() => import('./pages/Auth'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Profile = lazy(() => import('./pages/Profile'));
const CharacterHub = lazy(() => import('./pages/CharacterHub'));
const TrooperSubHub = lazy(() => import('./pages/TrooperSubHub'));
const Framework = lazy(() => import('./pages/Framework'));
const ArmyBuilders = lazy(() => import('./pages/ArmyBuilders'));
const CharacterCenterpieces = lazy(() => import('./pages/CharacterCenterpieces'));
const EliteSpecialists = lazy(() => import('./pages/EliteSpecialists'));
const SupportUnits = lazy(() => import('./pages/SupportUnits'));
const PrivacyPolicy = lazy(() => import('./src/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./src/pages/TermsOfService'));
const About = lazy(() => import('./src/pages/About'));
import { generateSlug } from './utils/slug';
import Footer from './src/components/Footer';
import ProgressBar from './components/ProgressBar';

import { supabase } from './services/supabaseClient';
import { Minifigure, UserProfile, PopularMinifig, CollectorRank, MarketMover } from './types';
import { AdMobService } from './services/adMobService';
import AdBanner from './components/AdBanner';
import { Capacitor } from '@capacitor/core';

interface ToastProps {
  message: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);
  if (!isVisible) return null;
  return <div className="toast-message">{message}</div>;
};

let toastContainer = document.getElementById('toast-root');
if (!toastContainer) {
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-root';
  document.body.appendChild(toastContainer);
}

// Store the root instance on the container element to reuse it
// This avoids the "You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before" warning
const getToastRoot = (container: HTMLElement) => {
  if ((container as any)._reactRoot) {
    return (container as any)._reactRoot;
  }
  const root = ReactDOM.createRoot(container);
  (container as any)._reactRoot = root;
  return root;
};

const toastRoot = getToastRoot(toastContainer);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
const showToast = (message: string, duration?: number) => {
  toastRoot.render(<div className="toast-container"><Toast message={message} duration={duration} /></div>);
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastRoot.render(null), (duration || 2000) + 300);
};

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const ScrollToTop = ({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLElement> }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const { key } = location;

  // 1. Save scroll position in real-time
  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const handleScroll = () => {
      sessionStorage.setItem(`scroll_pos_${key}`, element.scrollTop.toString());
    };

    // Use passive listener for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [key, scrollContainerRef]);

  // 2. Restore or Reset scroll position
  useLayoutEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (navType === 'POP') {
      // Skip restoration if navigating to a theme detail page, 
      // as it handles its own scroll restoration.
      if (!location.pathname.startsWith('/themes/')) {
        const savedPos = sessionStorage.getItem(`scroll_pos_${key}`);
        const targetY = savedPos ? parseInt(savedPos, 10) : 0;
        
        // Immediate attempt
        element.scrollTo(0, targetY);

        // Retry with ResizeObserver for dynamic content
        const observer = new ResizeObserver(() => {
          // If we haven't reached the target yet and content is large enough
          if (Math.abs(element.scrollTop - targetY) > 10) {
             if (element.scrollHeight >= targetY + element.clientHeight) {
               element.scrollTo(0, targetY);
             }
          }
        });
        observer.observe(element);
        
        // Disconnect after 2 seconds to prevent infinite loops
        const timeout = setTimeout(() => observer.disconnect(), 2000);
        return () => {
          observer.disconnect();
          clearTimeout(timeout);
        };
      }
    } else {
      // PUSH, REPLACE: Always scroll to top
      // Skip scroll-to-top if navigating to a theme detail page, 
      // as it handles its own scroll restoration.
      if (!location.pathname.startsWith('/themes/')) {
        // Force reset immediately by direct property assignment
        element.scrollTop = 0;
        element.scrollTo(0, 0);
        
        // Backup attempts for async rendering
        setTimeout(() => {
          if (element) {
            element.scrollTop = 0;
            element.scrollTo(0, 0);
          }
        }, 0);
      }
    }
  }, [location.pathname, navType, key, scrollContainerRef]);

  return null;
};

const ProtectedRoute: React.FC<React.PropsWithChildren<{ user: UserProfile | null; loading: boolean }>> = ({ user, children, loading }) => {
  if (loading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Verifying Access...</p>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

interface MainContentProps {
  allMinifigs: Minifigure[];
  topMinifigs: PopularMinifig[];
  collectorRanking: CollectorRank[];
  marketMovers: MarketMover[];
  volumeMovers: MarketMover[];
  dataLoading: boolean;
  authLoading: boolean;
  hasError: boolean;
  user: UserProfile | null;
  onToggleOwned: (id: string) => void;
  onBulkToggleOwned: (ids: string[], shouldOwn: boolean) => Promise<boolean>;
  onLogout: () => void;
  onRetryFetch: () => void;
  hasActiveModal: boolean;
  updateModalState: (key: string, isOpen: boolean) => void;
  showAdBanner: boolean;
  scrollRef: React.RefObject<HTMLElement>;
}

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType();

  useLayoutEffect(() => {
    // Only scroll to top on PUSH/REPLACE actions, not on BACK (POP)
    if (navType !== 'POP') {
      // 1. Reset main container
      const scrollContainer = document.getElementById('main-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollTo(0, 0);
      }

      // 2. Reset window/body/html
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      // 3. Force reset again after paint to handle async content
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
          scrollContainer.scrollTo(0, 0);
        }
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });
    }
  }, [location.pathname, navType]);

  return <>{children}</>;
};

const MainContent: React.FC<MainContentProps> = ({ 
  allMinifigs, topMinifigs, collectorRanking, marketMovers, volumeMovers, dataLoading, authLoading, hasError, user, onToggleOwned, onBulkToggleOwned, onLogout, onRetryFetch, hasActiveModal, updateModalState, showAdBanner, scrollRef 
}) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const ownedMinifigs = useMemo(() => allMinifigs.filter((m: Minifigure) => m.owned), [allMinifigs]);
  const mainPaddingBottom = (showAdBanner ? 60 : 0) + 60;
  return (
    <div className="h-full bg-slate-900 text-slate-900 flex flex-col overflow-hidden">
      <GlobalHeader user={user} onLogout={onLogout} hasActiveModal={hasActiveModal} />
      <main ref={scrollRef} id="main-scroll-container" className="flex-1 relative z-10 ios-scroll overflow-y-auto overflow-x-hidden bg-slate-50" style={{ paddingBottom: `calc(${mainPaddingBottom}px + env(safe-area-inset-bottom))` }}>
        <Suspense fallback={
          <div className="absolute inset-0 z-[50] bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Loading Page...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<PageWrapper><Home onToggleOwned={onToggleOwned} ownedMinifigs={ownedMinifigs} allMinifigs={allMinifigs} user={user} topMinifigs={topMinifigs} marketMovers={marketMovers} volumeMovers={volumeMovers} collectorRanking={collectorRanking} onRetryFetch={onRetryFetch} /></PageWrapper>} />
            <Route path="/auth" element={<PageWrapper>{user ? <Navigate to="/collection" /> : <Auth onShowLegalModal={(isOpen: boolean) => updateModalState('authLegal', isOpen)} />}</PageWrapper>} />
            <Route path="/collection/*" element={<PageWrapper><ProtectedRoute user={user} loading={authLoading}><Collection allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} onShowSettings={(isOpen: boolean) => updateModalState('collectionSettings', isOpen)} onShowDeleteModal={(isOpen: boolean) => updateModalState('collectionDelete', isOpen)} dataLoading={dataLoading} /></ProtectedRoute></PageWrapper>} />
            <Route path="/stats" element={<PageWrapper><ProtectedRoute user={user} loading={authLoading}><Stats ownedMinifigs={ownedMinifigs} allMinifigs={allMinifigs} user={user} /></ProtectedRoute></PageWrapper>} />
            <Route path="/themes" element={<PageWrapper><ThemeList allMinifigs={allMinifigs} user={user} /></PageWrapper>} />
            <Route path="/minifigs/:id/*" element={<PageWrapper><MinifigDetail onToggleOwned={onToggleOwned} allMinifigs={allMinifigs} user={user} dataLoading={dataLoading} /></PageWrapper>} />
            <Route path="/themes/:themeName/*" element={<PageWrapper><ThemeDetail onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} allMinifigs={allMinifigs} user={user} onShowSubCatModal={(isOpen: boolean) => updateModalState('themeDetailSubCat', isOpen)} dataLoading={dataLoading} /></PageWrapper>} />
            <Route path="/character/troopers" element={<PageWrapper><CharacterHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/character/troopers/:factionId" element={<PageWrapper><TrooperSubHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/character/troopers/:factionId/:unitId" element={<PageWrapper><TrooperSubHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/lego-star-wars-minifigure-archive" element={<Suspense fallback={<div className="min-h-screen bg-slate-950" />}><PageWrapper><Framework allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper></Suspense>} />
            <Route path="/role/army-builders/*" element={<PageWrapper><ArmyBuilders allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/character-centerpieces/*" element={<PageWrapper><CharacterCenterpieces allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/elite-specialists/*" element={<PageWrapper><EliteSpecialists allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/support-units/*" element={<PageWrapper><SupportUnits allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/search/*" element={<PageWrapper><SearchResults allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} dataLoading={dataLoading} /></PageWrapper>} />
            <Route path="/profile/*" element={<PageWrapper><ProtectedRoute user={user} loading={authLoading}><Profile user={user} onLogout={onLogout} allMinifigs={allMinifigs} /></ProtectedRoute></PageWrapper>} />
            <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path="/terms-of-service" element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />

            <Route path="*" element={<PageWrapper><div className="min-h-screen flex items-center justify-center text-center p-4"><div className="animate-in fade-in zoom-in duration-300"><p className="text-slate-400 font-bold mb-4">Page Not Found</p><p className="text-xs text-slate-300 mb-6 font-mono">{location.pathname}</p><Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Go Home</Link></div></div></PageWrapper>} />
          </Routes>
          <Footer />
        </Suspense>
      </main>
      <Navigation />
      {showAdBanner && <AdBanner />}
      {hasError && (
        <div className="fixed bottom-20 left-4 right-4 z-[1000] bg-rose-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <div>
              <p className="font-bold text-sm">Connection Error</p>
              <p className="text-xs opacity-90">Failed to sync with server.</p>
            </div>
          </div>
          <button onClick={onRetryFetch} className="bg-white text-rose-600 px-4 py-2 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors">
            Retry
          </button>
        </div>
      )}
      {dataLoading && !hasError && allMinifigs.length === 0 && !isAuthPage && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-black uppercase tracking-[0.3em] text-[11px] italic animate-pulse">Syncing Library...</p>
        </div>
      )}
    </div>
  );
};

const GlobalHeader = ({ user, onLogout, hasActiveModal }: { user: UserProfile | null; onLogout: () => void; hasActiveModal: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '';
  const isAuthPage = location.pathname === '/auth';
  const isProfilePage = location.pathname === '/profile';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/themes/')) return decodeURIComponent(path.split('/')[2]).replace(/-/g, ' ').toUpperCase();
    if (path.startsWith('/minifigs/')) return 'FIGURE DETAILS';
    if (path === '/collection') return 'MY COLLECTION';
    if (path === '/themes') return 'ALL THEMES';
    if (path === '/stats') return 'STATS';
    if (path === '/search') return 'SEARCH RESULTS';
    if (path === '/profile') return 'MY PROFILE';
    if (path === '/lego-star-wars-minifigure-framework') return 'COLLECTOR FRAMEWORK';
    if (path === '/role/army-builders') return 'ARMY BUILDERS';
    if (path === '/role/character-centerpieces') return 'CHARACTER CENTERPIECES';
    if (path === '/role/elite-specialists') return 'ELITE SPECIALISTS';
    if (path === '/role/support-units') return 'SUPPORT UNITS';
    return '';
  };
  const pageTitle = getPageTitle();
  const handleBack = () => {
    if (hasActiveModal) return;
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };
  return (
    <header className={`sticky top-0 z-[200] w-full border-b border-white/5 px-4 flex items-center justify-between pt-[env(safe-area-inset-top)] h-[calc(3.75rem+env(safe-area-inset-top))] shadow-xl ${isProfilePage ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <div className="flex items-center gap-3 min-w-[80px]">
        {!isHome ? (
          <button onClick={handleBack} className={`flex items-center gap-1.5 active:scale-90 transition-transform p-2 -ml-2 ${isProfilePage ? 'text-slate-900' : 'text-white'}`} disabled={hasActiveModal}>
            <i className={`fas fa-chevron-left text-xs ${isProfilePage ? 'text-slate-400' : 'text-indigo-400'}`}></i>
            <span className="text-[10px] font-black uppercase tracking-tight">BACK</span>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 group-active:scale-90 transition-transform">
              <i className="fas fa-cubes text-white text-xs"></i>
            </div>
          </Link>
        )}
      </div>
      <div className="flex-1 flex justify-center overflow-hidden px-2 text-center">
        {(!isHome && pageTitle) ? (
          <h2 className={`text-[11px] font-black tracking-[0.2em] uppercase italic truncate max-w-[150px] ${isProfilePage ? 'text-slate-400' : 'text-indigo-400'}`}>{getPageTitle()}</h2>
        ) : isHome && (
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic leading-none">Minifig<span className="text-indigo-500">Hub</span></h1>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 min-w-[80px]">
        {user ? (
          <button onClick={onLogout} className={`w-8 h-8 rounded-full border flex items-center justify-center hover:bg-rose-600 transition-all active:scale-90 ${isProfilePage ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white/10 border-white/10 text-white'}`}>
            <i className="fas fa-power-off text-[10px]"></i>
          </button>
        ) : !isAuthPage && (
          <Link to="/auth" className="h-8 px-3 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95">LOGIN</Link>
        )}
      </div>
    </header>
  );
};

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };
  const navItems = [
    { path: '/', icon: 'fa-home', label: 'HOME' },
    { path: '/themes', icon: 'fa-layer-group', label: 'THEMES' },
    { path: '/collection', icon: 'fa-box-archive', label: 'COLLECTION' },
    { path: '/profile', icon: 'fa-user-circle', label: 'PROFILE' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[180] w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-5px_30px_rgba(0,0,0,0.04)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-[60px] w-full max-w-5xl mx-auto px-4 relative">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}>
              <i className={`fas ${item.icon} ${active ? 'text-xl' : 'text-lg'}`}></i>
              <span className={`text-[9px] font-black uppercase tracking-tighter transition-opacity ${active ? 'opacity-100' : 'opacity-90'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const STARTER_TREND_IDS = [
  'sw0021', 'sh0002', 'sw0004', 'sh0038', 'sh0036', 
  'hp001', 'sw0188', 'sw0002', 'sh0031', 'njo001'
];

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const decodeHTMLEntities = (text: string) => {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const App: React.FC = () => {
  const [allMinifigs, setAllMinifigs] = useState<Minifigure[]>([]);
  const [topMinifigs, setTopMinifigs] = useState<PopularMinifig[]>([]);
  const [collectorRanking, setCollectorRanking] = useState<CollectorRank[]>([]);
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([]);
  const [volumeMovers, setVolumeMovers] = useState<MarketMover[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation();
  const showAdBanner = Capacitor.isNativePlatform();
  const [activeModals, setActiveModals] = useState<{ [key: string]: boolean }>({ collectionSettings: false, collectionDelete: false, themeDetailSubCat: false, authLegal: false });
  const updateModalState = useCallback((key: string, isOpen: boolean) => setActiveModals(prev => prev[key] === isOpen ? prev : { ...prev, [key]: isOpen }), []);
  const retryFetch = () => setFetchTrigger(c => c + 1);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    AdMobService.initialize().then(() => AdMobService.prepareInterstitial());
  }, []);

  useEffect(() => {
    let lastBackPressTime = 0;
    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      const openModalKey = Object.keys(activeModals).find(key => activeModals[key]);
      if (openModalKey) { updateModalState(openModalKey, false); return; }
      if (location.pathname === '/' || location.pathname === '/home' || location.pathname === '') {
        const currentTime = Date.now();
        if (currentTime - lastBackPressTime < 2000) CapacitorApp.exitApp();
        else { showToast('Press back again to exit', 2000); lastBackPressTime = currentTime; }
      } else navigate(-1);
    });
    return () => { listenerPromise.then(handle => handle.remove()).catch(e => console.error(e)); };
  }, [navigate, location.pathname, activeModals, updateModalState]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setAuthLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTrends = async () => {
      try {
        const { data: trendData, error: trendError } = await supabase
          .from('popular_minifigs_view')
          .select('*')
          .limit(10)
          .abortSignal(controller.signal);

        if (trendError || !trendData || trendData.length === 0) {
          const { data: details, error: detailError } = await supabase
            .from('minifigures')
            .select('item_no, main_category, sub_category, name_en, category_id, year_released, image_url, last_stock_min_price, last_stock_avg_price')
            .in('item_no', STARTER_TREND_IDS)
            .abortSignal(controller.signal);

          if (!detailError && details) {
            const fallback = STARTER_TREND_IDS.map((id, idx) => {
              const base = details.find(d => d.item_no === id);
              if (!base) return null;
              const name = base.name_en || 'Untitled';
              const themeName = base.main_category || 'Other';
              return {
                item_no: base.item_no,
                name: name,
                decoded_name: decodeHTMLEntities(name),
                theme_name: themeName,
                theme_slug: generateSlug(themeName),
                sub_category: base.sub_category || '',
                image_url: base.image_url || '',
                category_id: base.category_id || 0,
                year_released: base.year_released || 0,
                owned: false,
                rank: idx + 1,
                owner_count: 0,
                last_stock_min_price: base.last_stock_min_price,
                last_stock_avg_price: base.last_stock_avg_price
              };
            }).filter(Boolean) as PopularMinifig[];
            setTopMinifigs(fallback);
          }
          return;
        }

        const topList = trendData.map((m: any, idx: number) => {
          const name = m.name_en || 'Untitled';
          const themeName = m.main_category || 'Other';
          return {
            item_no: m.item_no,
            name: name,
            decoded_name: decodeHTMLEntities(name),
            theme_name: themeName,
            theme_slug: generateSlug(themeName),
            sub_category: m.sub_category || '',
            image_url: m.image_url || '',
            category_id: m.category_id || 0,
            year_released: m.year_released || 0,
            owned: false,
            rank: idx + 1,
            owner_count: parseInt(m.owner_count || 0),
            last_stock_min_price: m.last_stock_min_price,
            last_stock_avg_price: m.last_stock_avg_price
          };
        });

        setTopMinifigs(topList);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Trends View Fetch Error:", err);
      }
    };
    
    const fetchRanking = async () => {
      try {
        const { data: rankingData, error: rankingError } = await supabase.rpc('get_collector_ranking', {}).abortSignal(controller.signal);
        if (rankingError) throw rankingError;

        if (rankingData) {
          const rankedList: CollectorRank[] = rankingData.map((item: any, index: number) => ({
            rank: index + 1,
            user_id: item.user_id,
            username: item.username,
            owned_count: item.owned_count,
            avatar_url: item.avatar_url
          }));
          setCollectorRanking(rankedList);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Collector ranking fetch error:", err);
        setCollectorRanking([]);
      }
    };

    const fetchMarketMovers = async () => {
      try {
        const { data: gainerData, error: gainerError } = await supabase
          .from('market_movers_view')
          .select('item_no, name, image_url, current_price, change_percent, total_quantity')
          .not('change_percent', 'is', null)
          .order('change_percent', { ascending: false })
          .limit(20)
          .abortSignal(controller.signal);
        
        if (gainerError) {
          console.error("Gainer Fetch Error:", gainerError);
        } else if (gainerData && gainerData.length > 0) {
          setMarketMovers(gainerData.map(m => ({
            item_no: m.item_no,
            name: m.name || 'Unknown',
            image_url: m.image_url,
            current_price: parseFloat(m.current_price || 0),
            change_percent: parseFloat(m.change_percent || 0),
            total_quantity: parseInt(m.total_quantity || 0)
          })));
        } else {
          const { data: fallbackGainer } = await supabase
            .from('market_movers_view')
            .select('item_no, name, image_url, current_price, change_percent, total_quantity')
            .order('current_price', { ascending: false })
            .limit(20)
            .abortSignal(controller.signal);
          
          if (fallbackGainer) {
            setMarketMovers(fallbackGainer.map(m => ({
              item_no: m.item_no,
              name: m.name || 'Unknown',
              image_url: m.image_url,
              current_price: parseFloat(m.current_price || 0),
              change_percent: parseFloat(m.change_percent || 0),
              total_quantity: parseInt(m.total_quantity || 0)
            })));
          }
        }

        const { data: volumeData, error: volumeError } = await supabase
          .from('market_movers_view')
          .select('item_no, name, image_url, current_price, change_percent, total_quantity')
          .order('total_quantity', { ascending: false })
          .limit(20)
          .abortSignal(controller.signal);
        
        if (volumeError) {
          console.error("Volume Fetch Error:", volumeError);
        } else if (volumeData && volumeData.length > 0) {
          setVolumeMovers(volumeData.map(m => ({
            item_no: m.item_no,
            name: m.name || 'Unknown',
            image_url: m.image_url,
            current_price: parseFloat(m.current_price || 0),
            change_percent: parseFloat(m.change_percent || 0),
            total_quantity: parseInt(m.total_quantity || 0)
          })));
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Market movers fetch error:", err);
      }
    };

    fetchTrends();
    fetchRanking();
    fetchMarketMovers();

    return () => controller.abort();
  }, [fetchTrigger]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      if (allMinifigs.length === 0) {
        setDataLoading(true);
      }
      setHasError(false);
      try {
        // Fetch minifigures in chunks to avoid payload limits
        let allRawMinifigs: any[] = [];
        let page = 0;
        const pageSize = 1000; // Reduced to 1000 for better stability
        let hasMore = true;

        while (hasMore) {
          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              const { data, error } = await supabase
                .from('minifigures')
                .select('item_no, main_category, sub_category, name_en, category_id, year_released, image_url, last_stock_min_price, last_stock_avg_price, stock_updated_at')
                .range(page * pageSize, (page + 1) * pageSize - 1)
                .abortSignal(controller.signal);
              
              if (error) throw error;
              
              if (data && data.length > 0) {
                allRawMinifigs = [...allRawMinifigs, ...data];
                if (data.length < pageSize) hasMore = false;
                else page++;
              } else {
                hasMore = false;
              }
              success = true;
            } catch (e: any) {
              // Check if it's an abort error, if so, don't retry and rethrow
              if (e.name === 'AbortError' || e.message?.includes('AbortError')) throw e;
              
              console.warn(`Fetch failed (page ${page}), retrying... (${retries} left)`, e);
              retries--;
              if (retries === 0) throw e;
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff: 1s, 2s, 3s
            }
          }
        }
        
        // Fetch market movers in chunks
        let allMarketMovers: any[] = [];
        let mmPage = 0;
        const mmPageSize = 1000; // Reduced to 1000
        let mmHasMore = true;

        while (mmHasMore) {
          const { data, error } = await supabase
            .from('market_movers_view')
            .select('item_no, change_percent')
            .range(mmPage * mmPageSize, (mmPage + 1) * mmPageSize - 1)
            .abortSignal(controller.signal);
          
          if (error) {
            console.warn('Error fetching market movers chunk:', error);
            break; // Continue with partial data
          }
          
          if (data && data.length > 0) {
            allMarketMovers = [...allMarketMovers, ...data];
            if (data.length < mmPageSize) mmHasMore = false;
            else mmPage++;
          } else {
            mmHasMore = false;
          }
        }
        
        const changePercentMap = new Map<string, number>();
        if (allMarketMovers.length > 0) {
          allMarketMovers.forEach(m => {
            if (m.item_no && m.change_percent !== undefined) {
              changePercentMap.set(m.item_no, parseFloat(m.change_percent));
            }
          });
        }

        let ownedIds = new Set<string>();
        if (user) {
          const { data: owned, error: ownedError } = await supabase
            .from('user_owned_minifigs')
            .select('minifig_id')
            .eq('user_id', user.id)
            .abortSignal(controller.signal);
          if (!ownedError && owned) owned.forEach(o => ownedIds.add(o.minifig_id));
        }

        const enriched: Minifigure[] = allRawMinifigs.map((m: any) => {
          const itemNo = m.item_no || 'unknown';
          const themeName = m.main_category || 'Other';
          const name = m.name_en || 'Untitled';
          return {
            item_no: itemNo, 
            name: name, 
            decoded_name: decodeHTMLEntities(name),
            theme_name: themeName, 
            theme_slug: generateSlug(themeName),
            sub_category: m.sub_category || '', 
            image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`, 
            category_id: m.category_id || 0, 
            year_released: m.year_released || 0, 
            owned: ownedIds.has(itemNo),
            last_stock_min_price: m.last_stock_min_price,
            last_stock_avg_price: m.last_stock_avg_price,
            change_percent: changePercentMap.get(itemNo),
            stock_updated_at: m.stock_updated_at
          };
        });
        
        setAllMinifigs(enriched);
        setTopMinifigs(prev => prev.map(m => ({ 
          ...m, 
          owned: ownedIds.has(m.item_no),
          change_percent: changePercentMap.get(m.item_no)
        })));

      } catch (err: any) {
        const isAbortError = err.name === 'AbortError' || err.message?.includes('AbortError') || err.code === '20' || err.message?.includes('signal is aborted');
        if (!isAbortError) {
          setHasError(true);
          console.error("Sync Error:", err);
        }
      } finally {
        // Only set loading to false if not aborted to avoid state updates on unmounted component
        // or flickering during rapid re-renders
        setDataLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [user, fetchTrigger]);

  const toggleOwned = async (itemNo: string) => {
    if (!user) { if (window.confirm("Sign in required. Go to Login page?")) navigate('/auth'); return; }
    const idx = allMinifigs.findIndex(m => m.item_no === itemNo);
    if (idx === -1) return;
    const original = allMinifigs[idx].owned;
    setAllMinifigs(prev => prev.map(m => m.item_no === itemNo ? { ...m, owned: !m.owned } : m));
    try {
      if (!original) await supabase.from('user_owned_minifigs').upsert({ minifig_id: itemNo, user_id: user.id });
      else await supabase.from('user_owned_minifigs').delete().eq('minifig_id', itemNo).eq('user_id', user.id);
      setFetchTrigger(c => c + 1);
    } catch (err) { setAllMinifigs(prev => prev.map(m => m.item_no === itemNo ? { ...m, owned: original } : m)); }
  };

  const bulkToggleOwned = async (itemNos: string[], shouldOwn: boolean) => {
    if (!user || itemNos.length === 0) return false;
    try {
      for (let i = 0; i < itemNos.length; i += 500) {
        const chunk = itemNos.slice(i, i + 500);
        if (shouldOwn) await supabase.from('user_owned_minifigs').upsert(chunk.map(id => ({ minifig_id: id, user_id: user.id })));
        else await supabase.from('user_owned_minifigs').delete().in('minifig_id', chunk).eq('user_id', user.id);
      }
      const ids = new Set(itemNos);
      setAllMinifigs(prev => prev.map(m => ids.has(m.item_no) ? { ...m, owned: shouldOwn } : m));
      showToast(`${itemNos.length} items updated.`, 2000);
      setFetchTrigger(c => c + 1);
      return true;
    } catch (err) { showToast('Error updating collection.', 4000); return false; }
  };

  const handleLogout = async () => { try { await supabase.auth.signOut(); setUser(null); sessionStorage.clear(); navigate('/'); } catch (e) { navigate('/'); } };
  
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop scrollContainerRef={scrollRef} />
      <MainContent 
        allMinifigs={allMinifigs} 
        topMinifigs={topMinifigs} 
        collectorRanking={collectorRanking}
        marketMovers={marketMovers}
        volumeMovers={volumeMovers}
        dataLoading={dataLoading} 
        authLoading={authLoading} 
        hasError={hasError} 
        user={user} 
        onToggleOwned={toggleOwned} 
        onBulkToggleOwned={bulkToggleOwned} 
        onLogout={handleLogout} 
        onRetryFetch={retryFetch} 
        hasActiveModal={Object.values(activeModals).some(v => v)} 
        updateModalState={updateModalState} 
        showAdBanner={showAdBanner}
        scrollRef={scrollRef}
      />
    </QueryClientProvider>
  );
};

export default App;

