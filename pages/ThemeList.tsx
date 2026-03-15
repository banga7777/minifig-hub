
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile, Theme, Minifigure } from '../types';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slug';
import { useThemes } from '../src/hooks/useMinifigs';

interface ThemeListProps {
  user: UserProfile | null;
  allMinifigs: Minifigure[];
}

type SortOption = 'MOST_FIGS' | 'PROGRESS' | 'NAME';
type StatusFilter = 'ALL' | 'COMPLETED' | 'STARTED' | 'NOT_STARTED';

const ThemeList: React.FC<ThemeListProps> = ({ user, allMinifigs }) => {
  const navigate = useNavigate();
  const { data: themes = [], isLoading: themesLoading } = useThemes();
  
  // Calculate progress directly from allMinifigs prop
  const progress = useMemo(() => {
    const counts: Record<string, number> = {};
    allMinifigs.forEach(m => {
      if (m.owned) {
        counts[m.theme_name] = (counts[m.theme_name] || 0) + 1;
      }
    });
    return counts;
  }, [allMinifigs]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('MOST_FIGS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const themesData = useMemo(() => {
    return themes.map((t, index) => {
      const ownedCount = progress[t.name] || 0;
      const completionRate = t.minifig_count > 0 ? Math.round((ownedCount / t.minifig_count) * 100) : 0;
      const customImg = localStorage.getItem(`theme_img_v1_${t.name}`);
      
      return {
        id: String(index),
        name: t.name,
        slug: generateSlug(t.name),
        minifig_count: t.minifig_count,
        owned_count: ownedCount,
        completionRate,
        image_url: t.image_url,
        custom_image_url: customImg || undefined
      };
    });
  }, [themes, progress]);

  const filteredAndSortedThemes = useMemo(() => {
    let result = themesData.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'COMPLETED' ? t.completionRate === 100 :
        statusFilter === 'STARTED' ? t.completionRate > 0 && t.completionRate < 100 :
        t.completionRate === 0;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'MOST_FIGS') return b.minifig_count - a.minifig_count;
      if (sortBy === 'PROGRESS') return b.completionRate - a.completionRate || b.minifig_count - a.minifig_count;
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [themesData, searchTerm, sortBy, statusFilter]);

  if (themesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-40 bg-slate-50 min-h-screen">
      <SEO 
        title="LEGO Minifigure Themes | Series Collection Tracker"
        description="Browse and track your LEGO minifigure collection by theme. From Star Wars to Marvel, manage your progress across all series."
        keywords="LEGO Themes, LEGO Series, Minifigure Collection, Star Wars LEGO, Marvel LEGO, Ninjago LEGO"
        canonical="https://minifig-hub.com/themes"
      />
      <div className="bg-slate-900 pt-10 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                ALL <span className="text-indigo-500">THEMES</span>
              </h1>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mt-3">Browse and track collection by series</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {/* Controls Bar */}
        <div className="bg-white rounded-[2rem] p-3 shadow-xl border border-slate-100 mb-6 flex flex-col gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Find themes by name..."
              className="w-full h-12 pl-12 pr-6 rounded-2xl bg-slate-50 border-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/50 overflow-x-auto hide-scrollbar">
              {(['ALL', 'STARTED', 'COMPLETED', 'NOT_STARTED'] as const).map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mr-1">Sort By</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-200 rounded-lg h-8 pl-3 pr-8 text-[9px] font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer hover:border-indigo-300 transition-colors"
              >
                <option value="MOST_FIGS">MOST FIGURES</option>
                <option value="PROGRESS">COMPLETION %</option>
                <option value="NAME">NAME A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Themes Grid */}
        {filteredAndSortedThemes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
            {filteredAndSortedThemes.map(theme => {
              const displayImg = theme.custom_image_url || theme.image_url;
              return (
                <Link key={theme.name} to={`/themes/${theme.slug}`} className="group bg-white rounded-[1.8rem] p-2 border border-slate-100 shadow-sm transition-all duration-300 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                  <div className="aspect-square rounded-[1.4rem] bg-slate-50 mb-2 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={displayImg} 
                      alt={theme.name} 
                      loading="lazy"
                      decoding="async" 
                      className={`w-full h-full ${theme.custom_image_url ? 'object-cover' : 'w-[80%] h-[80%] object-contain'} group-hover:scale-110 transition-transform duration-700 ease-out`} 
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                       <div className={`backdrop-blur px-2 py-0.5 rounded-lg shadow-sm border ${theme.completionRate === 100 ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-white/90 text-slate-900 border-slate-100'}`}>
                          <p className="text-[9px] font-black leading-none">{theme.completionRate}%</p>
                       </div>
                    </div>
                  </div>
                  <div className="px-1.5 pb-1">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors uppercase truncate tracking-tight">{theme.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{theme.minifig_count} FIGS</span>
                       <span className="text-[7px] font-black text-slate-300">{theme.owned_count} OWNED</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.completionRate === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} transition-all duration-1000`} style={{ width: `${theme.completionRate}%` }}></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 px-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <i className="fas fa-folder-open text-2xl"></i>
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">No Themes Found</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Try changing your search term or filter settings.
            </p>
            <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="mt-8 text-[9px] font-black text-indigo-600 uppercase underline tracking-widest">Reset All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeList;
