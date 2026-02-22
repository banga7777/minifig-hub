
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate, useNavigationType } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import ReactDOM from 'react-dom/client';

import Home from './pages/Home';
import Collection from './pages/Collection';
import MinifigDetail from './pages/MinifigDetail';
import ThemeDetail from './pages/ThemeDetail';
import ThemeList from './pages/ThemeList';
import Stats from './pages/Stats';
import Auth from './pages/Auth';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
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
const toastRoot = ReactDOM.createRoot(toastContainer);
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

const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = React.useRef<Record<string, number>>({});
  const prevLocation = usePrevious(location);
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    if (prevLocation) scrollPositions.current[prevLocation.key] = root.scrollTop;
    if (navigationType !== 'POP') root.scrollTo(0, 0);
  }, [location.pathname, navigationType, prevLocation]);
  useEffect(() => {
    if (navigationType !== 'POP') return;
    const savedPosition = scrollPositions.current[location.key];
    if (savedPosition === undefined) return;
    const root = document.getElementById('root');
    if (!root) return;
    let animationFrameId: number;
    let attempts = 0;
    const maxAttempts = 60;
    const restoreScroll = () => {
      if (root.scrollHeight >= savedPosition || attempts >= maxAttempts) {
        root.scrollTo({ top: savedPosition, behavior: 'auto' });
      } else {
        attempts++;
        animationFrameId = requestAnimationFrame(restoreScroll);
      }
    };
    animationFrameId = requestAnimationFrame(restoreScroll);
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [location.key, navigationType]);
  return null;
};

const ProtectedRoute: React.FC<React.PropsWithChildren<{ user: UserProfile | null; loading: boolean }>> = ({ user, children, loading }) => {
  if (loading) return <div className="w-full h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
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
}

const MainContent: React.FC<MainContentProps> = ({ 
  allMinifigs, topMinifigs, collectorRanking, marketMovers, volumeMovers, dataLoading, authLoading, hasError, user, onToggleOwned, onBulkToggleOwned, onLogout, onRetryFetch, hasActiveModal, updateModalState, showAdBanner 
}) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const ownedMinifigs = allMinifigs.filter((m: Minifigure) => m.owned);
  const mainPaddingBottom = (showAdBanner ? 60 : 0) + 60;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <GlobalHeader user={user} onLogout={onLogout} hasActiveModal={hasActiveModal} />
      <main className="flex-1 relative z-10 ios-scroll" style={{ paddingBottom: `calc(${mainPaddingBottom}px + env(safe-area-inset-bottom))` }}>
        <Routes>
          <Route path="/" element={<Home onToggleOwned={onToggleOwned} ownedMinifigs={ownedMinifigs} allMinifigs={allMinifigs} user={user} topMinifigs={topMinifigs} marketMovers={marketMovers} volumeMovers={volumeMovers} collectorRanking={collectorRanking} onRetryFetch={onRetryFetch} />} />
          <Route path="/auth" element={user ? <Navigate to="/collection" /> : <Auth onShowLegalModal={(isOpen: boolean) => updateModalState('authLegal', isOpen)} />} />
          <Route path="/collection" element={<ProtectedRoute user={user} loading={authLoading}><Collection allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} user={user} onShowSettings={(isOpen: boolean) => updateModalState('collectionSettings', isOpen)} onShowDeleteModal={(isOpen: boolean) => updateModalState('collectionDelete', isOpen)} /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute user={user} loading={authLoading}><Stats ownedMinifigs={ownedMinifigs} allMinifigs={allMinifigs} user={user} /></ProtectedRoute>} />
          <Route path="/themes" element={<ThemeList allMinifigs={allMinifigs} />} />
          <Route path="/minifigs/:id/:name" element={<MinifigDetail onToggleOwned={onToggleOwned} allMinifigs={allMinifigs} user={user} />} />
          <Route path="/themes/:themeName" element={<ThemeDetail onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} allMinifigs={allMinifigs} onShowSubCatModal={(isOpen: boolean) => updateModalState('themeDetailSubCat', isOpen)} />} />
          <Route path="/search" element={<SearchResults allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} onBulkToggleOwned={onBulkToggleOwned} />} />
          <Route path="/profile" element={<ProtectedRoute user={user} loading={authLoading}><Profile user={user} onLogout={onLogout} allMinifigs={allMinifigs} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Navigation />
      {showAdBanner && <AdBanner />}
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
    const fetchTrends = async () => {
      try {
        const { data: trendData, error: trendError } = await supabase
          .from('popular_minifigs_view')
          .select('*')
          .limit(10);

        if (trendError || !trendData || trendData.length === 0) {
          const { data: details, error: detailError } = await supabase
            .from('minifigures')
            .select('item_no, main_category, sub_category, name_en, category_id, year_released, image_url, last_stock_min_price, last_stock_avg_price')
            .in('item_no', STARTER_TREND_IDS);

          if (!detailError && details) {
            const fallback = STARTER_TREND_IDS.map((id, idx) => {
              const base = details.find(d => d.item_no === id);
              if (!base) return null;
              return {
                item_no: base.item_no,
                name: base.name_en || 'Untitled',
                theme_name: base.main_category || 'Other',
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

        const topList = trendData.map((m: any, idx: number) => ({
          item_no: m.item_no,
          name: m.name_en || 'Untitled',
          theme_name: m.main_category || 'Other',
          sub_category: m.sub_category || '',
          image_url: m.image_url || '',
          category_id: m.category_id || 0,
          year_released: m.year_released || 0,
          owned: false,
          rank: idx + 1,
          owner_count: parseInt(m.owner_count || 0),
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price
        }));

        setTopMinifigs(topList);
      } catch (err) {
        console.error("Trends View Fetch Error:", err);
      }
    };
    
    const fetchRanking = async () => {
      try {
        const { data: rankingData, error: rankingError } = await supabase.rpc('get_collector_ranking');
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
      } catch (err) {
        console.error("Collector ranking fetch error:", err);
        setCollectorRanking([]);
      }
    };

    const fetchMarketMovers = async () => {
      try {
        // Gainers: change_percent 내림차순(DESC) 상위 20개
        // nullsLast를 위해 order 옵션 확인 (Supabase JS 버전에 따라 다를 수 있으나 기본적으로 nullsLast: false가 DESC의 기본일 수 있음)
        // 여기서는 확실히 하기 위해 filter를 추가하거나 정렬 방식을 점검
        const { data: gainerData, error: gainerError } = await supabase
          .from('market_movers_view')
          .select('item_no, name, image_url, current_price, change_percent, total_quantity')
          .not('change_percent', 'is', null)
          .order('change_percent', { ascending: false })
          .limit(20);
        
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
          // 데이터가 없을 경우 (변동률이 모두 0이거나 null인 경우)
          // 차선책으로 가격 순이라도 가져와서 보여줌
          const { data: fallbackGainer } = await supabase
            .from('market_movers_view')
            .select('item_no, name, image_url, current_price, change_percent, total_quantity')
            .order('current_price', { ascending: false })
            .limit(20);
          
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

        // Volume: total_quantity 내림차순(DESC) 상위 20개
        const { data: volumeData, error: volumeError } = await supabase
          .from('market_movers_view')
          .select('item_no, name, image_url, current_price, change_percent, total_quantity')
          .order('total_quantity', { ascending: false })
          .limit(20);
        
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
      } catch (err) {
        console.error("Market movers fetch error:", err);
      }
    };

    fetchTrends();
    fetchRanking();
    fetchMarketMovers();
  }, [fetchTrigger]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setDataLoading(true);
      setHasError(false);
      try {
        const { data: rawMinifigs, error: figError } = await supabase
          .from('minifigures')
          .select('item_no, main_category, sub_category, name_en, category_id, year_released, image_url, last_stock_min_price, last_stock_avg_price, stock_updated_at')
          .limit(35000)
          .abortSignal(controller.signal);
        
        if (figError) throw figError;
        
        // Fetch market movers to get change_percent
        const { data: marketMoversData } = await supabase
          .from('market_movers_view')
          .select('item_no, change_percent')
          .abortSignal(controller.signal);
        
        const changePercentMap = new Map<string, number>();
        if (marketMoversData) {
          marketMoversData.forEach(m => {
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

        const enriched: Minifigure[] = (rawMinifigs || []).map((m: any) => ({
          item_no: m.item_no || 'unknown', 
          name: m.name_en || 'Untitled', 
          theme_name: m.main_category || 'Other', 
          sub_category: m.sub_category || '', 
          image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${(m.item_no || '').toUpperCase()}.png`, 
          category_id: m.category_id || 0, 
          year_released: m.year_released || 0, 
          owned: ownedIds.has(m.item_no),
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price,
          change_percent: changePercentMap.get(m.item_no),
          stock_updated_at: m.stock_updated_at
        }));
        
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
    <>
      <ScrollManager />
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
      />
    </>
  );
};

export default App;
