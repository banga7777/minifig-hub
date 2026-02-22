
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MinifigCard from '../components/MinifigCard';
import { Minifigure, UserProfile, PopularMinifig, CollectorRank, MarketMover } from '../types';
import { MOCK_THEMES } from '../services/mockData';
import { supabase } from '../services/supabaseClient';

interface HomeProps {
  onToggleOwned: (id: string) => void;
  ownedMinifigs: Minifigure[];
  allMinifigs: Minifigure[];
  user: UserProfile | null;
  topMinifigs: PopularMinifig[];
  marketMovers: MarketMover[];
  volumeMovers: MarketMover[];
  collectorRanking: CollectorRank[];
  onRetryFetch: () => void;
}

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 1 
  }).format(val);
};

const KEY_CHARACTER_NAMES = [
  'Luke Skywalker', 'Batman', 'Darth Vader', 'Spider-Man', 
  'Iron Man', 'Harry Potter', 'Yoda', 'Stormtrooper', 
  'Captain America', 'Mandalorian', 'Joker', 'Superman',
  'Boba Fett', 'R2-D2', 'C-3PO', 'Han Solo'
];

const MoverImage = ({ itemNo, imageUrl, size = 'w-12 h-12' }: { itemNo: string, imageUrl?: string, size?: string }) => {
  const [src, setSrc] = useState(imageUrl || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`);
  const officialUrl = `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`;

  return (
    <div className={`${size} bg-white rounded-full p-1 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
      <img 
        src={src} 
        className="w-full h-full object-contain" 
        alt="" 
        onError={() => {
          if (src !== officialUrl) setSrc(officialUrl);
          else setSrc('https://www.bricklink.com/img/no_image.png');
        }}
      />
    </div>
  );
};

const MarketTicker = ({ movers, mode }: { movers: MarketMover[], mode: 'gainers' | 'volume' }) => {
  const navigate = useNavigate();
  
  if (!movers || movers.length === 0) {
    return (
      <div className="w-full bg-slate-950 border border-white/5 rounded-2xl py-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
         <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Syncing...</span>
         </div>
         <div className="h-0.5 w-40 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 w-1/3 animate-[loading-slide_2s_infinite]"></div>
         </div>
      </div>
    );
  }

  const infiniteMovers = [...movers, ...movers];
  const durationPerItem = 3.5;
  const totalDuration = movers.length * durationPerItem;

  return (
    <div className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 overflow-hidden relative group shadow-2xl shadow-black/50">
      <div 
        className="flex whitespace-nowrap animate-ticker-sync group-hover:pause w-max"
        style={{ animationDuration: `${totalDuration}s` }}
      >
        {infiniteMovers.map((mover, idx) => (
          <div 
            key={`${mover.item_no}-${idx}`} 
            className="inline-flex items-center gap-3 px-8 border-r border-white/5 cursor-pointer group active:opacity-70 transition-all"
            onClick={() => navigate(`/minifigs/${mover.item_no}/${encodeURIComponent(mover.name.replace(/ /g, '-'))}`)}
          >
            <MoverImage itemNo={mover.item_no} imageUrl={mover.image_url} size="w-7 h-7" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 group-hover:text-white transition-colors">
                {mover.item_no}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white tracking-tighter font-mono">
                  {formatCurrency(mover.current_price)}
                </span>
                <div className={`flex items-center gap-0.5 font-mono ${mover.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className="text-[10px] font-bold">
                    {mover.change_percent >= 0 ? '▲' : '▼'}
                  </span>
                  <span className="text-[11px] font-black">
                    {Math.abs(mover.change_percent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker-sync {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-sync {
          animation-name: ticker-sync;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .pause {
          animation-play-state: paused;
        }
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ onToggleOwned, ownedMinifigs, allMinifigs, user, topMinifigs, marketMovers, volumeMovers, collectorRanking, onRetryFetch }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [setMatchedIds, setSetMatchedIds] = useState<Set<string>>(new Set());
  const [isSearchingSets, setIsSearchingSets] = useState(false);
  const [tickerMode, setTickerMode] = useState<'gainers' | 'volume'>('gainers');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const touchStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const PULL_THRESHOLD = 80;
  const PULL_RESISTANCE = 2.5;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const rootEl = document.getElementById('root');
    touchStartRef.current = {
      y: e.touches[0].clientY,
      scrollTop: rootEl?.scrollTop || 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isRefreshing) return;
    const { y: startY, scrollTop } = touchStartRef.current;
    const currentY = e.touches[0].clientY;
    const pullDistance = currentY - startY;

    if (scrollTop === 0 && pullDistance > 0) {
      e.preventDefault();
      const resistedPull = Math.max(0, pullDistance / PULL_RESISTANCE);
      setPullPosition(resistedPull);
    } else {
      touchStartRef.current = null;
      setPullPosition(0);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (isRefreshing) return;

    if (pullPosition >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullPosition(PULL_THRESHOLD);
      onRetryFetch();

      setTimeout(() => {
        setIsRefreshing(false);
        setPullPosition(0);
      }, 1500);
    } else {
      setPullPosition(0);
    }
  };

  useEffect(() => {
    const q = searchValue.trim();
    if (q.length < 3 || !/\d/.test(q)) { setSetMatchedIds(new Set()); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearchingSets(true);
      try {
        const searchSetVariations = Array.from({length: 9}, (_, i) => `${q}-${i + 1}`);
        searchSetVariations.push(q);
        const { data } = await supabase
          .from('minifig_supersets_grouped')
          .select('item_no')
          .filter('set_list', 'ov', `{${searchSetVariations.join(',')}}`)
          .limit(20)
          .abortSignal(controller.signal);
        if (data) setSetMatchedIds(new Set(data.map(d => d.item_no)));
      } catch (err: any) { if (err.name !== 'AbortError') console.error("Set search failed:", err); }
      finally { setIsSearchingSets(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowPreview(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPreview = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (q.length < 2 && setMatchedIds.size === 0) return [];
    const terms = q.split(/\s+/).filter(t => t.length > 0);
    const results = [];
    for (const m of allMinifigs) {
        if (results.length >= 6) break; 
        const mName = (m.name || '').toLowerCase();
        const mTheme = (m.theme_name || '').toLowerCase();
        const mSub = (m.sub_category || '').toLowerCase();
        const fullText = `${mName} ${m.item_no} ${mTheme} ${mSub}`.toLowerCase();
        const matchesText = terms.length > 0 && terms.every(t => fullText.includes(t));
        const matchesSet = setMatchedIds.has(m.item_no);
        if (matchesText || matchesSet) {
             let score = 100;
             if (matchesSet) score += 8000;
             if (m.item_no.toLowerCase() === q) score += 10000;
             if (mName.includes(q)) score += 2000;
             results.push({ minifig: m, score, isSetMatch: matchesSet });
        }
    }
    return results.sort((a, b) => b.score - a.score);
  }, [searchValue, allMinifigs, setMatchedIds]);

  const trendingCharacters = useMemo(() => {
    if (!allMinifigs.length) return [];
    const charStats: Record<string, { count: number; bestMatch: Minifigure | null }> = {};
    const keys = KEY_CHARACTER_NAMES.map(k => ({ original: k, lower: k.toLowerCase() }));
    keys.forEach(k => { charStats[k.original] = { count: 0, bestMatch: null }; });
    for (const m of allMinifigs) {
        const nameLower = (m.name || '').toLowerCase();
        for (const k of keys) {
            if (nameLower === k.lower || nameLower.startsWith(k.lower + ' ') || nameLower.startsWith(k.lower + '(') || nameLower.startsWith(k.lower + ',')) {
                const entry = charStats[k.original];
                if (entry) {
                    entry.count++;
                    if (!entry.bestMatch || m.year_released > entry.bestMatch.year_released) entry.bestMatch = m;
                }
                break;
            }
        }
    }
    return KEY_CHARACTER_NAMES.map(name => {
      const data = charStats[name];
      return data?.bestMatch ? { name, image_url: data.bestMatch.image_url, count: data.count } : null;
    }).filter(Boolean).sort((a, b) => b!.count - a!.count);
  }, [allMinifigs]);

  const homeThemes = useMemo(() => {
    const targetThemes = MOCK_THEMES.slice(0, 6).map(t => t.name.toLowerCase());
    const stats: Record<string, { count: number, owned: number, latestImg: string, latestYear: number }> = {};
    targetThemes.forEach(t => { stats[t] = { count: 0, owned: 0, latestImg: '', latestYear: 0 }; });
    for (const m of allMinifigs) {
        const mThemeLower = (m.theme_name || '').toLowerCase();
        if (stats[mThemeLower]) {
            stats[mThemeLower].count++;
            if (m.owned) stats[mThemeLower].owned++;
            if (m.year_released > stats[mThemeLower].latestYear) {
                stats[mThemeLower].latestYear = m.year_released;
                stats[mThemeLower].latestImg = m.image_url;
            }
        }
    }
    return MOCK_THEMES.slice(0, 6).map(theme => {
        const s = stats[theme.name.toLowerCase()];
        return { ...theme, count: s.count || theme.minifig_count, owned: s.owned, image_url: s.latestImg || theme.image_url };
    });
  }, [allMinifigs]);

  const recentMinifigs = useMemo(() => [...allMinifigs].sort((a, b) => b.year_released - a.year_released).slice(0, 15), [allMinifigs]);
  const collectionRate = allMinifigs.length > 0 ? (ownedMinifigs.length / allMinifigs.length) * 100 : 0;
  const level = useMemo(() => Math.floor(ownedMinifigs.length / 100), [ownedMinifigs]);
  const totalAvgValue = useMemo(() => ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_avg_price || 0), 0), [ownedMinifigs]);
  const totalMinValue = useMemo(() => ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_min_price || 0), 0), [ownedMinifigs]);
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-900 ring-amber-200';
    if (rank === 2) return 'bg-slate-300 text-slate-900 ring-slate-100';
    if (rank === 3) return 'bg-orange-400 text-orange-900 ring-orange-200';
    return 'bg-slate-800 text-white ring-slate-700';
  };

  const isRealData = topMinifigs.length > 0 && topMinifigs.some(m => m.owner_count > 0);

  return (
    <div className="bg-slate-50 min-h-screen" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="h-20 flex items-center justify-center -mb-20">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-lg transition-all duration-200 ${isRefreshing ? 'animate-spin' : ''}`} style={{ opacity: Math.min(1, pullPosition / (PULL_THRESHOLD / 2)), transform: `scale(${Math.min(1, pullPosition / PULL_THRESHOLD)})` }}>
          <i className={`fas fa-sync-alt text-slate-500 transition-colors duration-200 ${pullPosition >= PULL_THRESHOLD ? 'text-indigo-600' : ''}`}></i>
        </div>
      </div>

      <div className="transition-transform duration-300" style={{ transform: `translateY(${pullPosition}px)` }}>
        <div className="pb-40 bg-slate-50 min-h-screen relative">
          <div className="absolute top-0 inset-x-0 h-[220px] bg-slate-900 z-0"></div>
          
          <div className="relative z-[100] pt-8 pb-4">
            <div className="max-w-5xl mx-auto flex flex-col items-center px-5">
              <div className="w-full max-w-2xl relative mb-2" ref={containerRef}>
                <form onSubmit={(e) => { e.preventDefault(); if (searchValue.trim()) navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`); }} className="relative group">
                  <input type="text" value={searchValue} onChange={(e) => { setSearchValue(e.target.value); setShowPreview(true); }} onFocus={() => setShowPreview(true)} placeholder="Bricklink ID, set no, name" className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none backdrop-blur-xl text-sm shadow-2xl" />
                  <i className={`fas ${isSearchingSets ? 'fa-spinner animate-spin text-indigo-400' : 'fa-search text-slate-300'} absolute left-4 top-1/2 -translate-y-1/2 text-xs`}></i>
                </form>
                {showPreview && searchPreview.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {searchPreview.map((result: any) => {
                        const fig = result.minifig;
                        if (!fig) return null;
                        return (
                          <button key={fig.item_no} onClick={() => { navigate(`/minifigs/${fig.item_no}/${encodeURIComponent(fig.name.replace(/ /g, '-'))}`); setShowPreview(false); }} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all group">
                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg p-1 flex items-center justify-center flex-shrink-0 shadow-sm"><img src={fig.image_url} className="w-full h-full object-contain" alt="" onError={(e) => (e.target as HTMLImageElement).src = `https://img.bricklink.com/ItemImage/MN/0/${fig.item_no.toUpperCase()}.png`} /></div>
                            <div className="flex-1 text-left truncate"><p className="text-[11px] font-black uppercase leading-tight truncate text-slate-900">{decodeHTMLEntities(fig.name || 'Unknown')}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fig.theme_name} • {fig.item_no}</p></div>
                            {result.isSetMatch && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase flex-shrink-0">SET</span>}
                          </button>
                        );
                      })}
                      <button onClick={() => navigate(`/search?q=${encodeURIComponent(searchValue)}`)} className="w-full py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-xl mt-1.5 transition-all">View All Results</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 mt-2 relative z-[20] space-y-8">
            <div 
              onClick={() => !user ? navigate('/auth') : navigate('/collection')}
              className="group block bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-900/5 border border-slate-100 transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex flex-row items-center justify-between mb-6">
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-4 bg-indigo-600 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    </div>
                    {user && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2.5 py-1 rounded-full leading-none shadow-sm border border-amber-200/50">LV.{level}</span>}
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{user ? collectionRate.toFixed(1) : '0.0'}%</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user ? `${ownedMinifigs.length} / ${allMinifigs.length}` : 'LOGIN'} FIGS</p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right min-w-[120px]">
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-80">Value</p>
                   {user ? (
                     <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1">
                           <span className="text-xl font-black text-emerald-600 tracking-tighter">{formatCurrency(totalAvgValue)}</span>
                           <span className="text-[8px] font-black text-emerald-400 uppercase">Avg</span>
                        </div>
                        <div className="flex items-baseline gap-1 opacity-60">
                           <span className="text-xs font-black text-indigo-400 tracking-tight">{formatCurrency(totalMinValue)}</span>
                           <span className="text-[7px] font-black text-indigo-300 uppercase">Min</span>
                        </div>
                     </div>
                   ) : (
                     null
                   )}
                </div>
              </div>
              <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]" style={{ width: `${user ? collectionRate : 0}%` }}></div>
              </div>
            </div>

            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4">
               <div className="flex items-center justify-between px-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-3.5 bg-slate-900 rounded-full"></div>
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Movers</h2>
                 </div>
                 <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-slate-200">
                    <button 
                      onClick={() => setTickerMode('gainers')}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${tickerMode === 'gainers' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Gainers
                    </button>
                    <button 
                      onClick={() => setTickerMode('volume')}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${tickerMode === 'volume' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Volume
                    </button>
                 </div>
               </div>
               
               <MarketTicker 
                 movers={tickerMode === 'gainers' ? marketMovers : volumeMovers} 
                 mode={tickerMode} 
               />
            </section>

            <section className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Pick</h2>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{isRealData ? 'Live' : 'Featured'}</span>
              </div>
              {topMinifigs.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-1">
                  {topMinifigs.map((m) => (
                    <div key={m.item_no} className="flex-shrink-0 w-28 cursor-pointer group" onClick={() => navigate(`/minifigs/${m.item_no}/${encodeURIComponent(m.name.replace(/ /g, '-'))}`)}>
                      <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden border border-slate-100 shadow-sm group-hover:border-indigo-200 transition-all">
                        <div className={`absolute top-2 left-2 z-30 w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ring-2 ring-slate-200 shadow-md ${getRankColor(m.rank)}`}>{m.rank}</div>
                        {m.change_percent !== undefined && m.change_percent !== 0 && (
                          <div className={`absolute top-2 right-2 z-30 text-[7px] font-black px-1 py-0.5 rounded shadow-sm backdrop-blur-sm border ${m.change_percent >= 0 ? 'bg-emerald-500/90 text-white border-emerald-400/50' : 'bg-rose-500/90 text-white border-rose-400/50'}`}>
                            {m.change_percent >= 0 ? '▲' : '▼'} {Math.abs(m.change_percent).toFixed(1)}%
                          </div>
                        )}
                        <img src={m.image_url} className="w-[85%] h-[85%] object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" alt="" onError={(e) => (e.target as HTMLImageElement).src = `https://img.bricklink.com/ItemImage/MN/0/${m.item_no.toUpperCase()}.png`} />
                      </div>
                      <div className="px-1">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase truncate leading-tight mb-1">{decodeHTMLEntities(m.name)}</h3>
                        <div className="flex items-center gap-1.5">
                           <i className={`fas ${m.owner_count > 0 ? 'fa-users text-amber-500' : 'fa-bolt text-indigo-500'} text-[8px]`}></i>
                           <p className={`text-[8px] font-bold uppercase tracking-tighter ${m.owner_count > 0 ? 'text-amber-600' : 'text-indigo-600'}`}>
                             {m.owner_count > 0 ? `${m.owner_count.toLocaleString()} Own` : 'Trending'}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <i className="fas fa-trophy text-slate-200 text-2xl mb-2"></i>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Syncing...</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-slate-900 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Ranking</h2></div>
                {user && <Link to="/profile" className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">My Profile</Link>}
              </div>
              {collectorRanking.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1">
                  {collectorRanking.slice(0, 10).map((c) => {
                      const level = Math.floor(c.owned_count / 100);
                      return (
                        <div key={c.user_id} className="w-28 flex-shrink-0 bg-slate-900 rounded-3xl p-3 flex flex-col items-center border border-white/5 shadow-2xl shadow-slate-900/20 group hover:bg-slate-800 transition-all">
                          <div className="relative mb-3">
                            <img src={c.avatar_url || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${c.user_id}`} className="w-16 h-16 rounded-full object-cover bg-slate-800 border-2 border-white/10 shadow-lg" alt={`${c.username}'s avatar`} />
                            <div className={`absolute -bottom-1 -right-1 z-10 w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] ring-2 ring-slate-900 shadow-lg ${getRankColor(c.rank)}`}>{c.rank}</div>
                          </div>
                          <h3 className="text-[10px] font-black text-white uppercase truncate w-full text-center leading-tight">{c.username}</h3>
                          <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5"><span className="text-amber-400">LV.{level}</span> • {c.owned_count.toLocaleString()} FIGS</p>
                        </div>
                      );
                    })}
                </div>
              ) : (
                 <div className="py-10 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-100">
                   <i className="fas fa-users-slash text-slate-200 text-2xl mb-2"></i>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">No Data</p>
                </div>
              )}
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-rose-500 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Popular</h2></div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
                {trendingCharacters.map(c => c && (
                  <Link key={c.name} to={`/search?q=${encodeURIComponent(c.name)}`} className="block flex-shrink-0 w-20 text-center group">
                    <div className="w-20 h-20 rounded-full bg-white border-2 border-white p-1 shadow-lg ring-4 ring-slate-100 group-hover:ring-indigo-200 transition-all mb-3"><img src={c.image_url} className="w-full h-full object-contain rounded-full bg-slate-50" alt={c.name} onError={(e) => (e.target as HTMLImageElement).src = 'https://www.bricklink.com/img/no_image.png'} /></div>
                    <p className="text-[9px] font-black text-slate-900 uppercase truncate leading-tight">{c.name}</p>
                  </Link>
                ))}
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Themes</h2></div>
                <Link to="/themes" className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">See All</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {homeThemes.map(theme => (
                  <Link key={theme.id} to={`/themes/${encodeURIComponent(theme.name.replace(/ /g, '-'))}`} className="group bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex flex-col text-center">
                    <div className="w-full aspect-square rounded-xl bg-slate-50 p-2 flex items-center justify-center overflow-hidden mb-2">
                        <img src={theme.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={theme.name} onError={(e) => (e.target as HTMLImageElement).src = 'https://www.bricklink.com/img/no_image.png'} />
                    </div>
                    <h3 className="text-[9px] font-black text-slate-900 uppercase truncate leading-tight group-hover:text-indigo-600 px-1">{theme.name}</h3>
                    <p className="text-[7px] font-bold text-slate-400 mt-1">{theme.owned || 0} / {theme.count} own</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Recent</h2></div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1">
                {recentMinifigs.map(m => <div key={m.item_no} className="w-32 flex-shrink-0"><MinifigCard minifig={m} onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}/${encodeURIComponent(m.name.replace(/ /g, '-'))}`)} isSelected={false} isSelectionMode={false} /></div>)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
