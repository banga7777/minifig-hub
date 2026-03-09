
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MinifigCard from '../components/MinifigCard';
import { Minifigure } from '../types';
import { generateSlug } from '../utils/slug';
import { supabase } from '../services/supabaseClient';
import SEO from '../components/SEO';

interface SearchResultsProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
  onBulkToggleOwned: (ids: string[], shouldOwn: boolean) => Promise<boolean>;
  dataLoading: boolean;
}

type SortOption = 'relevance' | 'year' | 'name' | 'id' | 'value';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'OWNED' | 'MISSING';

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const SearchResults: React.FC<SearchResultsProps> = ({ allMinifigs = [], onToggleOwned, onBulkToggleOwned, dataLoading }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  
  const queryFromUrl = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(queryFromUrl);
  const [setMatchedIds, setSetMatchedIds] = useState<Set<string>>(new Set());
  const [isSearchingSets, setIsSearchingSets] = useState(false);
  const isInitialMount = useRef(true);

  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem(`search_results_visible_count_${queryFromUrl}`);
    return saved ? parseInt(saved, 10) : 48;
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    sessionStorage.setItem(`search_results_visible_count_${queryFromUrl}`, visibleCount.toString());
  }, [visibleCount, queryFromUrl]);

  // Effect for fetching set matches based on URL query
  useEffect(() => {
    const controller = new AbortController();
    const fetchSetMatches = async (query: string) => {
      const q = query.trim();
      if (q.length < 3 || !/\d/.test(q)) {
        setSetMatchedIds(new Set());
        return;
      }
      setIsSearchingSets(true);
      try {
        const searchSetVariations = Array.from({length: 9}, (_, i) => `${q}-${i + 1}`);
        searchSetVariations.push(q);

        const { data, error } = await supabase
          .from('minifig_supersets_grouped')
          .select('item_no')
          .filter('set_list', 'ov', `{${searchSetVariations.join(',')}}`)
          .abortSignal(controller.signal);
        
        if (error) throw error;
        setSetMatchedIds(new Set(data ? data.map(d => d.item_no) : []));
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching set matches:', err);
          setSetMatchedIds(new Set());
        }
      } finally {
        setIsSearchingSets(false);
      }
    };
    fetchSetMatches(queryFromUrl);
    return () => { controller.abort(); };
  }, [queryFromUrl]);

  // Effect for resetting UI state when the search query changes
  useEffect(() => {
    setLocalSearch(queryFromUrl);
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSortBy('id');
    setSortOrder('desc');
    setStatusFilter('ALL');
    setVisibleCount(48);
    setIsManageMode(false);
    setSelectedItems(new Set());
    const root = document.getElementById('root');
    if (root) root.scrollTo(0, 0);
  }, [queryFromUrl]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localSearch.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredResults = useMemo(() => {
    const q = queryFromUrl.trim().toLowerCase();
    if (!q && setMatchedIds.size === 0) return [];
    
    const terms = q.split(/\s+/).filter(t => t.length > 0);
    const normalizedQ = q.replace(/\s+/g, '');

    let resultWithScores = allMinifigs.map(m => {
      const mName = m.decoded_name.toLowerCase();
      const mID = m.item_no.toLowerCase();
      const mTheme = m.theme_name.toLowerCase();
      const mSub = (m.sub_category || '').toLowerCase();
      
      let score = 0;
      const matchesSet = setMatchedIds.has(m.item_no);
      
      let matchesText = false;
      if (terms.length > 0) {
        matchesText = true;
        for (let i = 0; i < terms.length; i++) {
          const t = terms[i];
          if (!mName.includes(t) && !mID.includes(t) && !mTheme.includes(t) && !mSub.includes(t)) {
            matchesText = false;
            break;
          }
        }
      }

      if (!matchesText && !matchesSet) return { minifig: m, score: 0 };
      
      score += 100;
      if (matchesSet) score += 5000;
      if (mID === q || mID === normalizedQ) score += 10000;
      if (mName === q || mName === normalizedQ) score += 3000;
      else if (mName.includes(q) || mName.includes(normalizedQ)) score += 1000;
      
      for (let i = 0; i < terms.length; i++) {
        if (mName.includes(terms[i])) score += 500;
      }
      
      return { minifig: m, score };
    }).filter(item => item.score > 0);

    let finalResult = resultWithScores.filter(item => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'OWNED') return item.minifig.owned;
      if (statusFilter === 'MISSING') return !item.minifig.owned;
      return true;
    });

    return finalResult.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'relevance') {
        comparison = b.score - a.score;
        return comparison;
      }
      if (sortBy === 'name') comparison = a.minifig.decoded_name.localeCompare(b.minifig.decoded_name);
      else if (sortBy === 'id') comparison = a.minifig.item_no.localeCompare(b.minifig.item_no);
      else if (sortBy === 'year') comparison = a.minifig.year_released - b.minifig.year_released;
      else if (sortBy === 'value') comparison = (a.minifig.last_stock_min_price || 0) - (b.minifig.last_stock_min_price || 0);
      
      return sortOrder === 'asc' ? comparison : -comparison;
    }).map(item => item.minifig);
  }, [allMinifigs, queryFromUrl, sortBy, sortOrder, statusFilter, setMatchedIds]);

  const handleBulkAction = async (shouldOwn: boolean) => {
    const itemNos = Array.from(selectedItems);
    if (itemNos.length === 0) return;
    
    setIsBulkProcessing(true);
    const success = await onBulkToggleOwned(itemNos, shouldOwn);
    setIsBulkProcessing(false);
    
    if (success) {
      setIsManageMode(false);
      setSelectedItems(new Set());
      if (shouldOwn && statusFilter === 'MISSING') setStatusFilter('OWNED');
      if (!shouldOwn && statusFilter === 'OWNED') setStatusFilter('MISSING');
    }
  };
  
  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredResults.map(m => m.item_no)));
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
      const minifig = allMinifigs.find(m => m.item_no === itemNo);
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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 48, filteredResults.length));
        }
      },
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => { if (loadMoreRef.current) observer.unobserve(loadMoreRef.current); };
  }, [filteredResults.length]);

  const visibleResults = useMemo(() => filteredResults.slice(0, visibleCount), [filteredResults, visibleCount]);
  
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-40 pt-6">
      <SEO 
        title={`Search Results for "${queryFromUrl}" | Minifig Hub`}
        description={`Find LEGO minifigures matching "${queryFromUrl}". Explore market values, rarity, and collection status.`}
        keywords={`LEGO Search, Minifigure Search, ${queryFromUrl}`}
      />
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6 flex items-end justify-between"><h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-1 italic uppercase px-1">SEARCH RESULTS</h1><div className="flex items-center gap-3"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Found {filteredResults.length} matching items</p>{setMatchedIds.size > 0 && <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">Set Match</span>}</div></header>

        <div className="bg-white rounded-[2rem] p-3 shadow-xl border border-slate-100 mb-8 flex flex-col gap-4">
          <form onSubmit={handleLocalSearch} className="relative group"><input type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Bricklink ID, set no, name" className="w-full h-11 pl-11 pr-5 bg-slate-50 border-none rounded-2xl focus:ring-1 focus:ring-indigo-500 font-bold text-xs" /><i className={`fas ${isSearchingSets ? 'fa-spinner animate-spin text-indigo-500' : 'fa-search text-slate-300'} absolute left-4 top-1/2 -translate-y-1/2 text-xs`}></i></form>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/50">{(['ALL', 'OWNED', 'MISSING'] as const).map(status => (<button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{status}</button>))}</div>
            <div className="flex items-center gap-2">
              <button onClick={handleManageClick} className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isManageMode ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>{isManageMode ? 'Cancel' : 'Select'}</button>
              <div className="relative group"><select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none bg-slate-50 border border-slate-100 rounded-xl h-9 pl-4 pr-10 text-[9px] font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 transition-all"><option value="relevance">RELEVANCE</option><option value="value">PRICE</option><option value="year">YEAR</option><option value="name">NAME</option><option value="id">ID</option></select><i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 pointer-events-none"></i></div>
              {sortBy !== 'relevance' && (<button onClick={toggleSortOrder} className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl active:scale-90 transition-all shadow-sm" aria-label="Toggle Sort Order"><i className={`fas ${sortOrder === 'asc' ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short'} text-xs`}></i></button>)}
            </div>
          </div>
        </div>

        <div className="relative">
          {isBulkProcessing && (<div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-40 rounded-2xl animate-in fade-in duration-300 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>)}
          {filteredResults.length > 0 ? (<div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 pt-2 animate-in fade-in duration-300">{visibleResults.map(minifig => <MinifigCard key={minifig.item_no} minifig={minifig} onToggleOwned={onToggleOwned} onClick={() => handleCardClick(minifig.item_no)} isSelected={selectedItems.has(minifig.item_no)} isSelectionMode={isManageMode} />)}</div>) : (<div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 px-10"><h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">No Matches Found</h2><button onClick={() => { setLocalSearch(''); setStatusFilter('ALL'); setSetMatchedIds(new Set()); navigate('/search?q='); }} className="text-[10px] font-black text-indigo-600 uppercase underline tracking-widest">Reset Filters</button></div>)}
          {visibleCount < filteredResults.length && (<div ref={loadMoreRef} className="py-8 flex justify-center w-full"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>)}
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
    </div>
  );
};

export default SearchResults;
