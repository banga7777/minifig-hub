
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MinifigCard from '../components/MinifigCard';
import { Minifigure, UserProfile } from '../types';
import { generateSlug } from '../utils/slug';
import { decodeHTMLEntities } from '../utils/text';
import { supabase } from '../services/supabaseClient';
import SEO from '../components/SEO';
import { useOwnedMinifigs, useMinifigStats } from '../src/hooks/useMinifigs';

interface CollectionProps {
  onToggleOwned: (id: string) => void;
  onBulkToggleOwned: (ids: string[], shouldOwn: boolean) => Promise<boolean>;
  user: UserProfile | null;
  onShowSettings: (isOpen: boolean) => void; 
  onShowDeleteModal: (isOpen: boolean) => void;
}

type SortOption = 'id' | 'newest' | 'name' | 'theme' | 'value';
type GroupingMode = 'theme' | 'none';
type GridCols = 2 | 3 | 4 | 5;
type NestedGroup = Record<string, Record<string, Minifigure[]>>;

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const Collection: React.FC<CollectionProps> = ({ onToggleOwned, onBulkToggleOwned, user, onShowSettings, onShowDeleteModal }) => {
  const navigate = useNavigate();
  const { data: ownedMinifigs = [], isLoading: collectionLoading } = useOwnedMinifigs(user?.id);
  const { data: stats } = useMinifigStats();
  const totalCount = stats?.totalCount || 0;

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = sessionStorage.getItem('collection_sortby');
    return (saved as SortOption) || 'id';
  });
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(() => {
    const saved = localStorage.getItem('my_minifig_grouping_mode');
    return (saved as GroupingMode) || 'theme';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gridCols, setGridCols] = useState<GridCols>(() => {
    const saved = localStorage.getItem('my_minifig_grid_cols');
    return saved ? (parseInt(saved) as GridCols) : 3;
  });

  const [isManageMode, setIsManageMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem('collection_visible_count');
    return saved ? parseInt(saved, 10) : 48;
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile in Collection page:', error);
        } else if (data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem('collection_visible_count', visibleCount.toString());
    sessionStorage.setItem('collection_sortby', sortBy);
  }, [visibleCount, sortBy]);
  
  useEffect(() => {
    localStorage.setItem('my_minifig_grid_cols', gridCols.toString());
  }, [gridCols]);

  useEffect(() => {
    localStorage.setItem('my_minifig_grouping_mode', groupingMode);
  }, [groupingMode]);

  useEffect(() => {
    onShowSettings(showSettings);
  }, [showSettings, onShowSettings]);

  useEffect(() => {
    onShowDeleteModal(showDeleteModal);
  }, [showDeleteModal, onShowDeleteModal]);
  
  useEffect(() => {
    setIsManageMode(false);
    setSelectedItems(new Set());
  }, [filter, sortBy, groupingMode]);

  const totalAvgValue = useMemo(() => ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_avg_price || 0), 0), [ownedMinifigs]);
  const totalMinValue = useMemo(() => ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_min_price || 0), 0), [ownedMinifigs]);
  
  const completionRate = totalCount > 0 ? (ownedMinifigs.length / totalCount) * 100 : 0;
  const level = Math.floor(ownedMinifigs.length / 100);

  const displayedList = useMemo(() => {
    let result = [...ownedMinifigs];
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.item_no.toLowerCase().includes(q) ||
        m.theme_name.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'id') return b.item_no.localeCompare(a.item_no);
      if (sortBy === 'name') return decodeHTMLEntities(a.name).toLowerCase().localeCompare(decodeHTMLEntities(b.name).toLowerCase());
      if (sortBy === 'theme') {
        const themeComp = a.theme_name.localeCompare(b.theme_name);
        return themeComp !== 0 ? themeComp : decodeHTMLEntities(a.name).toLowerCase().localeCompare(decodeHTMLEntities(b.name).toLowerCase());
      }
      if (sortBy === 'value') return (b.last_stock_min_price || 0) - (a.last_stock_min_price || 0);
      return sortBy === 'newest' ? (b.year_released - a.year_released) || b.item_no.localeCompare(a.item_no) : 0;
    });
    return result;
  }, [ownedMinifigs, filter, sortBy]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVisibleCount(48);
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filter, sortBy, groupingMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 48, displayedList.length));
        }
      },
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [displayedList.length]);

  const visibleList = useMemo(() => displayedList.slice(0, visibleCount), [displayedList, visibleCount]);

  const nestedGroupedData = useMemo(() => {
    if (groupingMode === 'none') return null;
    const groups: NestedGroup = {};
    visibleList.forEach(fig => {
      const theme = fig.theme_name;
      const sub = fig.sub_category || 'General';
      if (!groups[theme]) groups[theme] = {};
      if (!groups[theme][sub]) groups[theme][sub] = [];
      groups[theme][sub].push(fig);
    });
    return groups;
  }, [visibleList, groupingMode]);

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
      const minifig = ownedMinifigs.find(m => m.item_no === itemNo);
      if (minifig) {
        navigate(`/minifigs/${itemNo}-${generateSlug(minifig.name)}`);
      }
    }
  };

  const handleBulkRemove = async () => {
    const itemNos = Array.from(selectedItems);
    if (itemNos.length === 0) return;
    setIsBulkProcessing(true);
    const success = await onBulkToggleOwned(itemNos, false);
    setIsBulkProcessing(false);
    if (success) {
      setIsManageMode(false);
      setSelectedItems(new Set());
    }
  };
  
  const handleSelectAll = () => {
    setSelectedItems(new Set(visibleList.map(m => m.item_no)));
  };

  const processAccountDeletion = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await supabase.from('user_owned_minifigs').delete().eq('user_id', user.id);
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      if (rpcError) console.warn("RPC deletion fail");
      await supabase.auth.signOut();
      sessionStorage.clear();
    } catch (err: any) {
      console.error("Critical Deletion error:", err);
      alert("Error: " + (err.message || "Failed to delete account."));
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  const handleManageClick = () => {
    if (isManageMode) setSelectedItems(new Set());
    setIsManageMode(!isManageMode);
  };

  const gridClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' }[gridCols];
  
  if (collectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-44 font-['Outfit'] relative">
      <SEO 
        title="My Collection" 
        description="View and manage your personal LEGO minifigure collection. Track your progress and collection value." 
        noindex={true}
      />
      <div className="bg-slate-900 pt-6 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20 -mr-24 -mt-24"></div>
        
        {showSettings && (
          <div className="absolute top-16 right-6 z-[100] w-52 bg-white rounded-2xl shadow-2xl p-2 border border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <button onClick={() => { setShowDeleteModal(true); setShowSettings(false); }} className="w-full text-left px-4 py-4 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <i className="fas fa-user-slash text-[10px]"></i>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Delete Account</span>
            </button>
          </div>
        )}

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl border border-white/10 rotate-2 overflow-hidden">
                <img 
                  src={(profile && profile.avatar_url) || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.id}`} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">
                  <span className="bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-md leading-none -rotate-2 shadow-md mr-2 align-middle inline-block">
                    LV.{level}
                  </span>
                  {profile?.username || user?.email?.split('@')[0] || 'COLLECTOR'}
                </h1>
                <p className="text-slate-500 font-bold text-[7px] uppercase tracking-[0.3em]">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/stats" aria-label="View Stats" className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-lg">
                <i className="fas fa-chart-pie text-sm text-indigo-400"></i>
              </Link>
              <Link to="/profile" aria-label="View Profile" className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-lg">
                <i className="fas fa-user-edit text-sm text-indigo-400"></i>
              </Link>
              <button onClick={() => setShowSettings(!showSettings)} aria-label="Settings" className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-lg">
                <i className={`fas ${showSettings ? 'fa-times' : 'fa-cog'} text-sm`}></i>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-3">
             <div className="flex flex-col justify-end">
                <div className="flex items-baseline gap-1.5"><span className="text-2xl font-black text-white tracking-tighter">{completionRate.toFixed(1)}%</span><span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Completed</span></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{ownedMinifigs.length} / {totalCount} FIGURES</p>
             </div>
             
             <div className="flex flex-col items-end">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 opacity-80">Collection Total Value</p>
                <div className="flex flex-col items-end gap-0.5">
                   <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-400 tracking-tighter">{formatCurrency(totalAvgValue)}</span>
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Avg</span>
                   </div>
                   <div className="flex items-baseline gap-1.5 opacity-60">
                      <span className="text-sm font-black text-indigo-400 tracking-tight">{formatCurrency(totalMinValue)}</span>
                      <span className="text-[7px] font-black text-indigo-600 uppercase tracking-widest">Min Est.</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-[1.5rem] p-2.5 shadow-xl shadow-slate-900/5 border border-slate-100 mb-6 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 pt-0.5">
            <div className="relative flex-1"><input type="text" placeholder="Search collection..." className="w-full h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl focus:ring-1 focus:ring-indigo-600/10 font-bold text-[11px]" value={filter} onChange={(e) => setFilter(e.target.value)} /><i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-[9px]"></i></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1.5 pb-0.5">
            <div className="flex items-center gap-2">
              <button onClick={() => setGroupingMode(groupingMode === 'theme' ? 'none' : 'theme')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${groupingMode === 'theme' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-100'}`}><i className={`fas ${groupingMode === 'theme' ? 'fa-layer-group' : 'fa-list'}`}></i>THEME</button>
              
              {/* Manage Mode Toggle Button (Relocated next to THEME) */}
              <button 
                onClick={handleManageClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${isManageMode ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-900 text-white border-slate-950'}`}
              >
                <i className={`fas ${isManageMode ? 'fa-times' : 'fa-check-double'}`}></i>
                {isManageMode ? 'CANCEL' : 'SELECT'}
              </button>

              <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-100">{[2, 3, 4, 5].map((num) => (<button key={num} onClick={() => setGridCols(num as GridCols)} className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black transition-all ${gridCols === num ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>{num}</button>))}</div>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none bg-white border border-slate-100 rounded-lg h-7 pl-2 pr-6 text-[8px] font-black text-slate-400 uppercase tracking-widest outline-none"><option value="id">ID</option><option value="value">PRICE</option><option value="newest">LATEST</option><option value="name">A-Z</option><option value="theme">THEME</option></select>
          </div>
        </div>

        {ownedMinifigs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 px-6">
            <i className="fas fa-box-open text-2xl text-slate-200 mb-4 block"></i>
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-6">Empty List</h2>
            <Link to="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg active:scale-95 transition-all">Start Finding</Link>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-300 pb-12">
            {groupingMode === 'theme' && nestedGroupedData ? (
              (Object.entries(nestedGroupedData) as [string, Record<string, Minifigure[]>][]).map(([themeName, subGroups]) => (
                <section key={themeName} className="relative">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-2 bg-slate-50 pt-4 px-1 relative z-10">
                    <h2 className="text-[13px] font-black text-slate-900 uppercase italic tracking-tight">{themeName}</h2>
                    <Link to={`/themes/${generateSlug(themeName)}`} className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">View Theme</Link>
                  </div>
                  <div className="space-y-8 relative z-0">
                    {Object.entries(subGroups).map(([subName, figs]) => (
                      <div key={subName}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <div className="w-1 h-3 bg-indigo-300 rounded-full"></div>
                          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subName}</h3>
                          <span className="text-[8px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded ml-1">{figs.length}</span>
                        </div>
                        <div className={`grid ${gridClass} gap-2 md:gap-3`}>
                          {figs.map(fig => (
                            <MinifigCard 
                              key={fig.item_no} 
                              minifig={fig} 
                              onToggleOwned={onToggleOwned} 
                              onClick={() => handleCardClick(fig.item_no)} 
                              isSelected={selectedItems.has(fig.item_no)} 
                              isSelectionMode={isManageMode} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              /* No Grouping View */
              <div className="pt-2">
                <div className={`grid ${gridClass} gap-2 md:gap-3`}>
                  {visibleList.map(fig => (
                    <MinifigCard 
                      key={fig.item_no} 
                      minifig={fig} 
                      onToggleOwned={onToggleOwned} 
                      onClick={() => handleCardClick(fig.item_no)} 
                      isSelected={selectedItems.has(fig.item_no)} 
                      isSelectionMode={isManageMode} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {visibleCount < displayedList.length && (<div ref={loadMoreRef} className="py-8 flex justify-center w-full"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>)}
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
              <button onClick={handleBulkRemove} disabled={isBulkProcessing} className="w-10 h-10 flex items-center justify-center text-white bg-rose-600 rounded-lg active:scale-90 transition-transform disabled:opacity-50" aria-label="Remove Selected">{isBulkProcessing ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-heart-crack"></i>}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (<div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"><div className="relative w-full max-sm bg-white rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300"><h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Delete Account?</h2><p className="text-xs text-slate-500 mb-6">This will permanently delete your account and all collection data. This action cannot be undone.</p><div className="flex gap-2"><button onClick={() => setShowDeleteModal(false)} className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button><button onClick={processAccountDeletion} disabled={isDeleting} className="flex-1 h-11 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Confirm Delete'}</button></div></div></div>)}
    </div>
  );
};

export default Collection;
