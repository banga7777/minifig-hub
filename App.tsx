
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
            <Route path="/" element={<PageWrapper><Home onToggleOwned={onToggleOwned} ownedMinifigs={ownedMinifigs} user={user} topMinifigs={topMinifigs} marketMovers={marketMovers} volumeMovers={volumeMovers} collectorRanking={collectorRanking} onRetryFetch={onRetryFetch} /></PageWrapper>} />
            <Route path="/auth" element={<PageWrapper>{user ? <Navigate to="/collection" /> : <Auth onShowLegalModal={(isOpen: boolean) => updateModalState('authLegal', isOpen)} />}</PageWrapper>} />
            <Route path="/collection/*" element={<PageWrapper><ProtectedRoute user={user} loading={authLoading}><Collection onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} onShowSettings={(isOpen: boolean) => updateModalState('collectionSettings', isOpen)} onShowDeleteModal={(isOpen: boolean) => updateModalState('collectionDelete', isOpen)} /></ProtectedRoute></PageWrapper>} />
            <Route path="/stats" element={<PageWrapper><ProtectedRoute user={user} loading={authLoading}><Stats ownedMinifigs={ownedMinifigs} allMinifigs={allMinifigs} user={user} /></ProtectedRoute></PageWrapper>} />
            <Route path="/themes" element={<PageWrapper><ThemeList user={user} /></PageWrapper>} />
            <Route path="/minifigs/:id/*" element={<PageWrapper><MinifigDetail onToggleOwned={onToggleOwned} user={user} /></PageWrapper>} />
            <Route path="/themes/:themeName/*" element={<PageWrapper><ThemeDetail onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} onShowSubCatModal={(isOpen: boolean) => updateModalState('themeDetailSubCat', isOpen)} /></PageWrapper>} />
            <Route path="/character/troopers" element={<PageWrapper><CharacterHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/character/troopers/:factionId" element={<PageWrapper><TrooperSubHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/character/troopers/:factionId/:unitId" element={<PageWrapper><TrooperSubHub allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/lego-star-wars-minifigure-archive" element={<PageWrapper><Framework allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/army-builders/*" element={<PageWrapper><ArmyBuilders allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/character-centerpieces/*" element={<PageWrapper><CharacterCenterpieces allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/elite-specialists/*" element={<PageWrapper><EliteSpecialists allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/role/support-units/*" element={<PageWrapper><SupportUnits allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} /></PageWrapper>} />
            <Route path="/search/*" element={<PageWrapper><SearchResults onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} /></PageWrapper>} />
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

const decodeHTMLEntities = (text: string) => {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

import { useTopMinifigs, useCollectorRanking, useMarketMovers, useMinifigStats } from './src/hooks/useMinifigs';
import { useQueryClient } from '@tanstack/react-query';

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [allMinifigs, setAllMinifigs] = useState<Minifigure[]>([]);
  const { data: topMinifigs = [] } = useTopMinifigs();
  const { data: collectorRanking = [] } = useCollectorRanking();
  const { data: marketMovers = [] } = useMarketMovers();
  const { data: stats } = useMinifigStats();
  const [volumeMovers, setVolumeMovers] = useState<MarketMover[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
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
    // Global data fetching is now handled by React Query hooks
  }, [fetchTrigger]);

  // Removed the massive fetchData useEffect

  const toggleOwned = async (itemNo: string) => {
    if (!user) { if (window.confirm("Sign in required. Go to Login page?")) navigate('/auth'); return; }
    
    // Optimistic update for UI responsiveness
    setAllMinifigs(prev => prev.map(m => m.item_no === itemNo ? { ...m, owned: !m.owned } : m));
    
    try {
      const { data: existing } = await supabase
        .from('user_owned_minifigs')
        .select('minifig_id')
        .eq('minifig_id', itemNo)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        await supabase.from('user_owned_minifigs').upsert({ minifig_id: itemNo, user_id: user.id });
      } else {
        await supabase.from('user_owned_minifigs').delete().eq('minifig_id', itemNo).eq('user_id', user.id);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['ownedMinifigs', user.id] });
      setFetchTrigger(c => c + 1);
    } catch (err) { 
      // Rollback on error
      console.error("Toggle Error:", err);
    }
  };

  const bulkToggleOwned = async (itemNos: string[], shouldOwn: boolean) => {
    if (!user || itemNos.length === 0) return false;
    try {
      for (let i = 0; i < itemNos.length; i += 500) {
        const chunk = itemNos.slice(i, i + 500);
        if (shouldOwn) await supabase.from('user_owned_minifigs').upsert(chunk.map(id => ({ minifig_id: id, user_id: user.id })));
        else await supabase.from('user_owned_minifigs').delete().in('minifig_id', chunk).eq('user_id', user.id);
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['ownedMinifigs', user.id] });
      showToast(`${itemNos.length} items updated.`, 2000);
      setFetchTrigger(c => c + 1);
      return true;
    } catch (err) { showToast('Error updating collection.', 4000); return false; }
  };

  const handleLogout = async () => { try { await supabase.auth.signOut(); setUser(null); sessionStorage.clear(); navigate('/'); } catch (e) { navigate('/'); } };
  
  return (
    <>
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
    </>
  );
};

export default App;

