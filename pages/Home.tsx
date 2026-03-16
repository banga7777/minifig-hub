
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MinifigCard from '../components/MinifigCard';
import CollectionDashboard from '../components/CollectionDashboard';
import type { Minifigure, UserProfile, PopularMinifig, CollectorRank, MarketMover } from '../types';
import { generateSlug } from '../utils/slug';
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

const KEY_CHARACTER_NAMES = [
  'Luke Skywalker', 'Batman', 'Darth Vader', 'Spider-Man', 
  'Iron Man', 'Harry Potter', 'Yoda', 'Stormtrooper', 
  'Captain America', 'Mandalorian', 'Joker', 'Superman',
  'Boba Fett', 'R2-D2', 'C-3PO', 'Han Solo'
];

import SEO from '../components/SEO';

const Home: React.FC<HomeProps> = ({ onToggleOwned, ownedMinifigs, allMinifigs, user, topMinifigs, marketMovers, volumeMovers, collectorRanking, onRetryFetch }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [setMatchedIds, setSetMatchedIds] = useState<Set<string>>(new Set());
  const [isSearchingSets, setIsSearchingSets] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const touchStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const PULL_THRESHOLD = 80;
  const PULL_RESISTANCE = 2.5;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const scrollContainer = document.getElementById('root');
    touchStartRef.current = {
      y: e.touches[0].clientY,
      scrollTop: scrollContainer?.scrollTop || 0,
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
      } catch (err: unknown) { if (err instanceof Error && err.name !== 'AbortError') console.error("Set search failed:", err); }
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
    const len = allMinifigs.length;
    for (let i = 0; i < len; i++) {
        const m = allMinifigs[i];
        if (results.length >= 6) break; 
        const mName = (m.name || '').toLowerCase();
        const mTheme = (m.theme_name || '').toLowerCase();
        const mSub = (m.sub_category || '').toLowerCase();
        const itemNo = m.item_no.toLowerCase();
        
        const matchesSet = setMatchedIds.has(m.item_no);
        let matchesText = false;
        
        if (terms.length > 0) {
          matchesText = true;
          for (let j = 0; j < terms.length; j++) {
            const term = terms[j];
            if (!mName.includes(term) && !itemNo.includes(term) && !mTheme.includes(term) && !mSub.includes(term)) {
              matchesText = false;
              break;
            }
          }
        }

        if (matchesText || matchesSet) {
             let score = 100;
             if (matchesSet) score += 8000;
             if (itemNo === q) score += 10000;
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
    for (let i = 0; i < keys.length; i++) {
      charStats[keys[i].original] = { count: 0, bestMatch: null };
    }
    
    const len = allMinifigs.length;
    for (let i = 0; i < len; i++) {
        const m = allMinifigs[i];
        const nameLower = (m.name || '').toLowerCase();
        for (let j = 0; j < keys.length; j++) {
            const k = keys[j];
            if (nameLower === k.lower || nameLower.startsWith(k.lower + ' ') || nameLower.startsWith(k.lower + '(') || nameLower.startsWith(k.lower + ',')) {
                const entry = charStats[k.original];
                entry.count++;
                if (!entry.bestMatch || m.year_released > entry.bestMatch.year_released) entry.bestMatch = m;
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
    for (let i = 0; i < targetThemes.length; i++) {
      stats[targetThemes[i]] = { count: 0, owned: 0, latestImg: '', latestYear: 0 };
    }
    
    const len = allMinifigs.length;
    for (let i = 0; i < len; i++) {
        const m = allMinifigs[i];
        const mThemeLower = (m.theme_name || '').toLowerCase();
        const s = stats[mThemeLower];
        if (s) {
            s.count++;
            if (m.owned) s.owned++;
            if (m.year_released > s.latestYear) {
                s.latestYear = m.year_released;
                s.latestImg = m.image_url;
            }
        }
    }
    return MOCK_THEMES.slice(0, 6).map(theme => {
        const s = stats[theme.name.toLowerCase()];
        return { ...theme, count: s.count || theme.minifig_count, owned: s.owned, image_url: s.latestImg || theme.image_url, slug: generateSlug(theme.name) };
    });
  }, [allMinifigs]);

  const recentMinifigs = useMemo(() => [...allMinifigs].sort((a, b) => b.year_released - a.year_released).slice(0, 15), [allMinifigs]);
  const collectionRate = allMinifigs.length > 0 ? (ownedMinifigs.length / allMinifigs.length) * 100 : 0;
  const level = useMemo(() => Math.floor(ownedMinifigs.length / 100), [ownedMinifigs]);
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-900 ring-amber-200';
    if (rank === 2) return 'bg-slate-300 text-slate-900 ring-slate-100';
    if (rank === 3) return 'bg-orange-400 text-orange-900 ring-orange-200';
    return 'bg-slate-800 text-white ring-slate-700';
  };

  const isRealData = topMinifigs.length > 0 && topMinifigs.some(m => m.owner_count > 0);

  return (
    <div className="bg-slate-50 min-h-screen" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <SEO 
        title="Minifig Hub - LEGO Minifigure Collection Tracker" 
        description="Manage, explore, and grow your LEGO Minifigure collection with real-time market values and visual search."
      />
      <div className="h-20 flex items-center justify-center -mb-20">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-lg transition-all duration-200 ${isRefreshing ? 'animate-spin' : ''}`} style={{ opacity: Math.min(1, pullPosition / (PULL_THRESHOLD / 2)), transform: `scale(${Math.min(1, pullPosition / PULL_THRESHOLD)})` }}>
          <i className={`fas fa-sync-alt text-slate-500 transition-colors duration-200 ${pullPosition >= PULL_THRESHOLD ? 'text-indigo-600' : ''}`}></i>
        </div>
      </div>

      <div className="transition-transform duration-300" style={{ transform: `translateY(${pullPosition}px)` }}>
        <div className="pb-40 bg-slate-50 min-h-screen relative">
          <div className="absolute top-0 inset-x-0 h-[160px] bg-slate-900 z-0"></div>
          
          <div className="relative z-[100] pt-6 pb-2">
            <div className="max-w-5xl mx-auto flex flex-col items-center px-5">
              <div className="w-full max-w-2xl relative mb-1" ref={containerRef}>
                <form onSubmit={(e) => { e.preventDefault(); if (searchValue.trim()) navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`); }} className="relative group">
                  <input type="text" value={searchValue} onChange={(e) => { setSearchValue(e.target.value); setShowPreview(true); }} onFocus={() => setShowPreview(true)} placeholder="Bricklink ID, set no, name" className="w-full h-11 pl-12 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none backdrop-blur-xl text-xs shadow-xl" />
                  <i className={`fas ${isSearchingSets ? 'fa-spinner animate-spin text-indigo-400' : 'fa-search text-slate-300'} absolute left-4 top-1/2 -translate-y-1/2 text-[10px]`}></i>
                </form>
                {showPreview && searchPreview.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5">
                      {searchPreview.map((result: { minifig: Minifigure; score: number; isSetMatch: boolean }) => {
                        const fig = result.minifig;
                        if (!fig) return null;
                        return (
                          <button key={fig.item_no} onClick={() => { navigate(`/minifigs/${fig.item_no}-${generateSlug(fig.name)}`); setShowPreview(false); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-all group">
                            <div className="w-8 h-8 bg-white border border-slate-100 rounded-md p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm"><img src={fig.image_url} className="w-full h-full object-contain" alt="" onError={(e) => (e.target as HTMLImageElement).src = `https://img.bricklink.com/ItemImage/MN/0/${fig.item_no.toUpperCase()}.png`} /></div>
                            <div className="flex-1 text-left truncate"><p className="text-[10px] font-black uppercase leading-tight truncate text-slate-900">{fig.decoded_name || 'Unknown'}</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fig.theme_name} • {fig.item_no}</p></div>
                            {result.isSetMatch && <span className="bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0">SET</span>}
                          </button>
                        );
                      })}
                      <button onClick={() => navigate(`/search?q=${encodeURIComponent(searchValue)}`)} className="w-full py-3 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-lg mt-1 transition-all">View All Results</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 mt-1 relative z-[20] space-y-6">
            <CollectionDashboard user={user} onNavigate={navigate} />
            
            {/* Collector Guide Entry Point */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Collector Guide</h2>
                </div>
              </div>
              
              <div className="w-full px-1">
                <Link 
                  to="/lego-star-wars-minifigure-archive"
                  className="block w-full relative group overflow-hidden rounded-[2rem] h-48 sm:h-64 shadow-xl shadow-slate-900/10 border border-slate-800 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-900/20 bg-[#0a0f1a] flex"
                >
                  {/* Left Side (Content) */}
                  <div className="flex-1 h-full relative flex flex-col justify-center px-6 sm:px-10 z-10 overflow-hidden">
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[7px] sm:text-[9px] font-bold text-white/70 uppercase tracking-[0.25em]">
                          Complete Guide
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-[1.1] mb-4">
                        <span className="font-black tracking-tighter uppercase italic">Star Wars</span><br/>
                        <span className="font-black tracking-tighter uppercase italic text-white/90">Minifigure</span><br/>
                        <span className="font-black tracking-tighter uppercase italic text-white/80">Universe</span>
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-8 px-5 rounded-full bg-[#5856d6] text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 group-hover:bg-[#4a48b5] transition-all duration-500 w-fit">
                          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Enter Hub</span>
                          <i className="fas fa-arrow-right text-[9px]"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Image) */}
                  <div className="w-[40%] sm:w-[45%] h-full relative flex items-center justify-center z-0 overflow-hidden">
                    <img 
                      src="https://img.bricklink.com/ItemImage/MN/0/sw0585.png" 
                      className="relative z-10 h-[70%] sm:h-[80%] w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.3)]" 
                      alt="Stormtrooper" 
                    />
                  </div>
                </Link>
              </div>
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
                    <div key={m.item_no} className="flex-shrink-0 w-28 cursor-pointer group" onClick={() => navigate(`/minifigs/${m.item_no}-${generateSlug(m.name)}`)}>
                      <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden border border-slate-100 shadow-sm group-hover:border-indigo-200 transition-all">
                        <div className={`absolute top-2 left-2 z-30 w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ring-2 ring-slate-200 shadow-md ${getRankColor(m.rank)}`}>{m.rank}</div>
                        {m.last_stock_min_price ? (
                          <div className="absolute top-2 right-2 z-30 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-indigo-400/50 backdrop-blur-sm">
                            ${m.last_stock_min_price.toFixed(2)}
                          </div>
                        ) : null}
                        <img src={m.image_url} className="w-[85%] h-[85%] object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" alt="" onError={(e) => (e.target as HTMLImageElement).src = `https://img.bricklink.com/ItemImage/MN/0/${m.item_no.toUpperCase()}.png`} />
                      </div>
                      <div className="px-1">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase truncate leading-tight mb-1">{m.decoded_name}</h3>
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
                  <Link key={theme.id} to={`/themes/${theme.slug}`} className="group bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex flex-col text-center">
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
                {recentMinifigs.map(m => <div key={m.item_no} className="w-32 flex-shrink-0"><MinifigCard minifig={m} onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${generateSlug(m.name)}`)} isSelected={false} isSelectionMode={false} /></div>)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
