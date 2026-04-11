
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MinifigCard from '../components/MinifigCard';
import { Minifigure, UserProfile } from '../types';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slug';
import { supabase } from '../services/supabaseClient';

interface ThemeDetailProps {
  onToggleOwned: (id: string) => void;
  onBulkToggleOwned: (ids: string[], shouldOwn: boolean) => Promise<boolean>;
  allMinifigs: Minifigure[];
  onShowSubCatModal: (isOpen: boolean) => void; 
  dataLoading: boolean;
  user: UserProfile | null;
}

type SortOption = 'newest' | 'name' | 'id' | 'value';
type SortOrder = 'asc' | 'desc';
type OwnedFilter = 'all' | 'owned' | 'missing';

const ThemeDetail: React.FC<ThemeDetailProps> = ({ onToggleOwned, onBulkToggleOwned, allMinifigs, onShowSubCatModal, dataLoading, user }) => {
  const { themeName } = useParams<{ themeName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Restore scroll position with retry mechanism
  React.useLayoutEffect(() => {
    if (dataLoading) return;
    
    const savedPos = sessionStorage.getItem(`scroll_pos_${location.key}`);
    if (!savedPos) return;
    
    const targetY = parseInt(savedPos, 10);
    const element = document.getElementById('main-scroll-container');
    if (!element) return;

    // 1. Try immediately
    element.scrollTo(0, targetY);

    // 2. Retry until rendered (up to 2 seconds)
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      // Check if content is large enough to reach targetY
      if (element.scrollHeight >= targetY + element.clientHeight || attempts > 20) {
        element.scrollTo(0, targetY);
        clearInterval(interval);
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [dataLoading, location.key]);
  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = sessionStorage.getItem(`theme_detail_search_${themeName}`);
    console.log(`[Debug] Initial searchTerm for ${themeName}:`, saved);
    return saved || '';
  });
  const [activeSubCat, setActiveSubCat] = useState<string | null>(() => {
    const saved = sessionStorage.getItem(`theme_detail_subcat_${themeName}`);
    console.log(`[Debug] Initial activeSubCat for ${themeName}:`, saved);
    return saved;
  });
  const [filterOwned, setFilterOwned] = useState<OwnedFilter>(() => {
    const saved = sessionStorage.getItem(`theme_detail_owned_${themeName}`) as OwnedFilter;
    console.log(`[Debug] Initial filterOwned for ${themeName}:`, saved);
    return saved || 'all';
  });
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = sessionStorage.getItem(`theme_detail_sortby_${themeName}`) as SortOption;
    console.log(`[Debug] Initial sortBy for ${themeName}:`, saved);
    return saved || 'id';
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const saved = sessionStorage.getItem(`theme_detail_sortorder_${themeName}`) as SortOrder;
    console.log(`[Debug] Initial sortOrder for ${themeName}:`, saved);
    return saved || 'desc';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem(`theme_detail_visible_count_${themeName}`);
    return saved ? parseInt(saved, 10) : 48;
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (themeName) {
      sessionStorage.setItem(`theme_detail_visible_count_${themeName}`, visibleCount.toString());
      sessionStorage.setItem(`theme_detail_search_${themeName}`, searchTerm);
      if (activeSubCat) sessionStorage.setItem(`theme_detail_subcat_${themeName}`, activeSubCat);
      else sessionStorage.removeItem(`theme_detail_subcat_${themeName}`);
      sessionStorage.setItem(`theme_detail_owned_${themeName}`, filterOwned);
      sessionStorage.setItem(`theme_detail_sortby_${themeName}`, sortBy);
      sessionStorage.setItem(`theme_detail_sortorder_${themeName}`, sortOrder);
    }
  }, [visibleCount, themeName, searchTerm, activeSubCat, filterOwned, sortBy, sortOrder]);

  useEffect(() => {
    if (themeName) {
      const saved = localStorage.getItem(`theme_img_v1_${themeName}`);
      if (saved) setCustomImage(saved);
    }
  }, [themeName]);

  useEffect(() => {
    onShowSubCatModal(isModalOpen);
  }, [isModalOpen, onShowSubCatModal]);
  
  // Clear selection when filters change
  useEffect(() => {
    setIsManageMode(false);
    setSelectedItems(new Set());
  }, [searchTerm, activeSubCat, filterOwned, sortBy, sortOrder]);

  const [themeMinifigs, setThemeMinifigs] = useState<Minifigure[]>([]);
  const [isFetchingTheme, setIsFetchingTheme] = useState(false);

  useEffect(() => {
    const targetSlug = themeName?.toLowerCase();
    if (!targetSlug) return;

    const controller = new AbortController();
    const fetchThemeData = async () => {
      setIsFetchingTheme(true);
      try {
        // First, get the actual theme name from the slug if possible, or just use the slug
        // We'll query by main_category (theme)
        // Since we don't have a theme_slug in the DB, we might need to be clever or just use the slug to match
        // Actually, the slug is generated from main_category. 
        // We can fetch all minifigures and filter by slug in JS, but that's what we wanted to avoid.
        // Better: fetch where main_category is like the slug (replacing hyphens with spaces)
        const likelyThemeName = targetSlug.replace(/-/g, ' ');
        
        const { data, error } = await supabase
          .from('minifigures')
          .select('item_no, main_category, sub_category, name_en, category_id, year_released, image_url, last_price, stock_updated_at')
          .ilike('main_category', `%${likelyThemeName}%`)
          .abortSignal(controller.signal);

        if (error) throw error;

        if (data) {
          const enriched = data.map((m: any) => ({
            item_no: m.item_no,
            name: m.name_en || 'Untitled',
            decoded_name: decodeHTMLEntities(m.name_en || 'Untitled'),
            theme_name: m.main_category || 'Other',
            theme_slug: generateSlug(m.main_category || 'Other'),
            sub_category: m.sub_category || '',
            image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${m.item_no.toUpperCase()}.png`,
            category_id: m.category_id || 0,
            year_released: m.year_released || 0,
            owned: allMinifigs.find(am => am.item_no === m.item_no)?.owned || false,
            last_price: m.last_price,
            stock_updated_at: m.stock_updated_at
          })).filter((m: any) => m.theme_slug === targetSlug); // Final precise filter
          
          setThemeMinifigs(enriched);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') console.error("Theme fetch failed:", err);
      } finally {
        setIsFetchingTheme(false);
      }
    };

    fetchThemeData();
    return () => controller.abort();
  }, [themeName, allMinifigs]);

  const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  useEffect(() => {
    // Check if user already has a preference
    const savedSortBy = sessionStorage.getItem(`theme_detail_sortby_${themeName}`);
    const savedSortOrder = sessionStorage.getItem(`theme_detail_sortorder_${themeName}`);
    
    // If user has a preference, don't override
    if (savedSortBy || savedSortOrder) return; 

    if (themeMinifigs.length > 0 && themeMinifigs[0].theme_name.toLowerCase().includes('collectible')) {
      setSortBy('newest');
      setSortOrder('desc');
    } else {
      setSortBy('id');
      setSortOrder('desc');
    }
  }, [themeMinifigs, themeName]);

  const displayThemeName = themeMinifigs.length > 0 ? themeMinifigs[0].theme_name : themeName?.replace(/-/g, ' ');

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredMinifigs = useMemo(() => {
    let result = themeMinifigs.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.item_no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubCat = !activeSubCat || m.sub_category === activeSubCat;
      const matchesOwned = filterOwned === 'all' ? true : (filterOwned === 'owned' ? m.owned : !m.owned);
      return matchesSearch && matchesSubCat && matchesOwned;
    });
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortBy === 'id') {
        comparison = a.item_no.localeCompare(b.item_no);
      } else if (sortBy === 'newest') {
        comparison = a.year_released - b.year_released;
      } else if (sortBy === 'value') {
        comparison = (a.last_price || 0) - (b.last_price || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [themeMinifigs, searchTerm, activeSubCat, filterOwned, sortBy, sortOrder]);
  
  const handleBulkAction = async (shouldOwn: boolean) => {
    const itemNos = Array.from(selectedItems);
    if (itemNos.length === 0) return;
    
    setIsBulkProcessing(true);
    const success = await onBulkToggleOwned(itemNos, shouldOwn);
    setIsBulkProcessing(false);
    
    if (success) {
      setIsManageMode(false);
      setSelectedItems(new Set());
      if (shouldOwn && filterOwned === 'missing') setFilterOwned('owned');
      if (!shouldOwn && filterOwned === 'owned') setFilterOwned('missing');
    }
  };
  
  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredMinifigs.map(m => m.item_no)));
  };

  const handleCardClick = (itemNo: string) => {
    if (isManageMode) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(itemNo)) {
        newSelection.delete(itemNo);
      } else {
        newSelection.add(itemNo);
      }
      setSelectedItems(newSelection);
    } else {
      const minifig = themeMinifigs.find(m => m.item_no === itemNo);
      if (minifig) {
        navigate(`/minifigs/${itemNo}-${generateSlug(minifig.name)}`);
      }
    }
  };

  const handleManageClick = () => {
    if (isManageMode) {
      setSelectedItems(new Set());
    }
    setIsManageMode(!isManageMode);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVisibleCount(48);
    const scrollContainer = document.getElementById('main-scroll-container') || document.getElementById('root');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchTerm, activeSubCat, filterOwned, sortBy, sortOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 48, filteredMinifigs.length));
        }
      },
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [filteredMinifigs.length]);

  const visibleMinifigs = useMemo(() => filteredMinifigs.slice(0, visibleCount), [filteredMinifigs, visibleCount]);
  const subCategoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    themeMinifigs.forEach(m => {
      if (m.sub_category) stats[m.sub_category] = (stats[m.sub_category] || 0) + 1;
    });
    return stats;
  }, [themeMinifigs]);
  const subCategories = useMemo(() => Object.keys(subCategoryStats).sort(), [subCategoryStats]);
  const filteredSubCategories = useMemo(() => {
    if (!catSearch) return subCategories;
    return subCategories.filter(cat => cat.toLowerCase().includes(catSearch.toLowerCase()));
  }, [subCategories, catSearch]);

  const ownedCount = themeMinifigs.filter(m => m.owned).length;
  const totalCount = themeMinifigs.length;
  const completionRate = totalCount > 0 ? (ownedCount / totalCount) * 100 : 0;
  const defaultImage = themeMinifigs[0]?.image_url;
  
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-44 bg-slate-50 min-h-screen">
      <SEO 
        title={`${displayThemeName} Minifigures | Collection Tracker`}
        description={`Explore and track your LEGO ${displayThemeName} minifigure collection. View market values, rarity, and completion progress.`}
        keywords={`LEGO, ${displayThemeName}, Minifigure, Collection, Price Guide`}
        ogImage={customImage || defaultImage}
      />
      <div className="bg-slate-900 pt-8 pb-14 px-5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">{customImage ? <img src={customImage} className="w-full h-full object-cover opacity-30 blur-sm" alt="" /> : <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>}<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div></div>
        <div className="max-w-5xl mx-auto relative z-10"><div className="flex items-center gap-4 mt-2"><div className="w-16 h-16 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center justify-center overflow-hidden shadow-2xl flex-shrink-0"><img src={customImage || defaultImage} className={`w-full h-full ${customImage ? 'object-cover' : 'object-contain'}`} alt="" /></div><div className="flex-1 min-w-0"><h1 className="text-xl font-black text-white italic tracking-tight uppercase leading-none mb-1 truncate">{displayThemeName}</h1><div className="flex items-center gap-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{totalCount} FIGURES</span><span className="text-[9px] font-black text-indigo-400 uppercase">{completionRate.toFixed(0)}% PROGRESS</span></div></div></div></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-6">
          <div className="p-2 border-b border-slate-50 flex gap-2"><div className="relative flex-1"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search in this theme..." className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-indigo-500 font-bold text-[10px]" /><i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[9px]"></i></div><button onClick={handleManageClick} className={`h-10 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${isManageMode ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>{isManageMode ? 'Cancel' : 'Select'}</button></div>
          <div className="flex flex-wrap items-center p-2 gap-2">
            <div className="flex bg-slate-50 p-0.5 rounded-lg">{(['all', 'owned', 'missing'] as const).map(opt => (<button key={opt} onClick={() => setFilterOwned(opt)} className={`px-2.5 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${filterOwned === opt ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{opt}</button>))}</div>
            <button onClick={() => setIsModalOpen(true)} className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${activeSubCat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-white'}`}><i className="fas fa-filter text-[6px]"></i><span className="max-w-[70px] truncate">{activeSubCat || 'ALL SERIES'}</span></button>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="relative"><select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none bg-slate-50 border border-slate-100 rounded-lg h-8 pl-3 pr-7 text-[7px] font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 transition-all"><option value="newest">NEWEST</option><option value="value">PRICE</option><option value="name">NAME</option><option value="id">ID</option></select><i className="fas fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[6px] text-slate-300 pointer-events-none"></i></div>
              <button onClick={toggleSortOrder} className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg active:scale-90 transition-all shadow-sm"><i className={`fas ${sortOrder === 'asc' ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short'} text-[10px]`}></i></button>
            </div>
          </div>
        </div>

        {/* Grid and Loading */}
        <div className="relative">
          {isBulkProcessing && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-40 rounded-2xl animate-in fade-in duration-300 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 animate-in fade-in duration-200">
            {visibleMinifigs.length > 0 ? (visibleMinifigs.map((m) => (<MinifigCard key={m.item_no} minifig={m} onToggleOwned={onToggleOwned} onClick={() => handleCardClick(m.item_no)} isSelected={selectedItems.has(m.item_no)} isSelectionMode={isManageMode} />))) : (<div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100"><p className="text-slate-300 font-black uppercase text-[8px] tracking-widest">No matching items</p></div>)}
          </div>
          {visibleCount < filteredMinifigs.length && (<div ref={loadMoreRef} className="py-8 flex justify-center w-full"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>)}
        </div>
      </div>
      
      {isManageMode && (
        <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom))] left-0 right-0 z-[185] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300">
          <div className="h-[70px] max-w-5xl mx-auto px-4 flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-black text-white">{selectedItems.size} SELECTED</p>
              <p className="text-[9px] font-bold text-slate-400">Tap items to select/deselect</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSelectAll} disabled={isBulkProcessing} className="w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-lg active:scale-90 transition-transform disabled:opacity-50" aria-label="Select All"><i className="fas fa-check-double"></i></button>
              <button onClick={() => handleBulkAction(true)} disabled={isBulkProcessing} className="w-10 h-10 flex items-center justify-center text-white bg-indigo-600 rounded-lg active:scale-90 transition-transform disabled:opacity-50" aria-label="Add Selected">{isBulkProcessing ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-heart"></i>}</button>
              <button onClick={() => handleBulkAction(false)} disabled={isBulkProcessing} className="w-10 h-10 flex items-center justify-center text-white bg-rose-600 rounded-lg active:scale-90 transition-transform disabled:opacity-50" aria-label="Remove Selected">{isBulkProcessing ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-heart-crack"></i>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (<div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div><div className="relative w-full max-w-lg bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[70vh] flex flex-col"><div className="p-4 border-b border-slate-50 flex items-center justify-between"><h3 className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">Filter by Series</h3><button onClick={() => setIsModalOpen(false)} className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><i className="fas fa-times text-[10px]"></i></button></div><div className="p-3 bg-white sticky top-0 z-10"><input type="text" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="Search series..." className="w-full h-10 px-4 bg-slate-50 border-none rounded-xl font-bold text-xs" /></div><div className="flex-1 overflow-y-auto p-3 space-y-1"><button onClick={() => { setActiveSubCat(null); setIsModalOpen(false); }} className={`w-full p-3.5 rounded-xl text-left text-[11px] font-bold ${!activeSubCat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600'}`}>All Figures</button>{filteredSubCategories.map(cat => (<button key={cat} onClick={() => { setActiveSubCat(cat); setIsModalOpen(false); }} className={`w-full p-3.5 rounded-xl text-left text-[11px] font-bold flex items-center justify-between transition-all ${activeSubCat === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600'}`}><span className="truncate pr-4">{cat}</span><span className={`text-[8px] px-1.5 py-0.5 rounded ${activeSubCat === cat ? 'bg-white/20' : 'bg-slate-200 text-slate-400'}`}>{subCategoryStats[cat]}</span></button>))}</div></div></div>)}
    </div>
  );
};

export default ThemeDetail;
