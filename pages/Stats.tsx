
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minifigure, UserProfile } from '../types';
import SEO from '../components/SEO';
import { useOwnedMinifigs, useMinifigStats } from '../src/hooks/useMinifigs';

interface StatsProps {
  user: UserProfile | null;
  ownedMinifigs: Minifigure[];
  allMinifigs: Minifigure[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const Stats: React.FC<StatsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { data: ownedMinifigs = [] } = useOwnedMinifigs(user?.id);
  const { data: globalStats } = useMinifigStats();

  const stats = useMemo(() => {
    const totalFigs = globalStats?.totalCount || 0;
    const ownedTotal = ownedMinifigs.length;
    const completion = totalFigs > 0 ? (ownedTotal / totalFigs) * 100 : 0;
    
    // 가치 합계 계산
    const totalAvgValue = ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_avg_price || 0), 0);
    const totalMinValue = ownedMinifigs.reduce((sum, m) => sum + (m.last_stock_min_price || 0), 0);

    // 테마별 보유 수량
    const themeCounts = new Map<string, number>();
    ownedMinifigs.forEach(m => {
      themeCounts.set(m.theme_name, (themeCounts.get(m.theme_name) || 0) + 1);
    });
    const topThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 연도별 보유 수량 (타임라인)
    const yearCounts = new Map<number, number>();
    ownedMinifigs.forEach(m => {
      const year = m.year_released;
      if (year > 0) yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
    });
    
    const recentYears = Array.from(yearCounts.entries())
      .sort((a, b) => a[0] - b[0]);
      
    return { totalFigs, ownedTotal, completion, topThemes, recentYears, totalAvgValue, totalMinValue };
  }, [ownedMinifigs, globalStats]);

  const maxYearCount = useMemo(() => {
    if (stats.recentYears.length === 0) return 1;
    return Math.max(...stats.recentYears.map(y => y[1]));
  }, [stats.recentYears]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  // No manual SEO useEffect needed

  return (
    <div className="max-w-5xl mx-auto pb-44 min-h-screen bg-slate-50 font-['Outfit']">
      <SEO 
        title="Collection Statistics" 
        description="View detailed insights and statistics about your LEGO minifigure collection." 
        noindex={true}
      />
      <div className="bg-slate-900 pt-10 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none mb-3">
                Collection <span className="text-indigo-400">Stats</span>
              </h1>
              <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.4em]">Collection Insights</p>
            </div>
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collected</span>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-white tracking-tighter">{stats.ownedTotal.toLocaleString()}</span>
                 <span className="text-[10px] font-bold text-slate-500 italic">FIGS</span>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
               </div>
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-black text-white tracking-tighter">{Math.floor(stats.completion)}</span>
                 <span className="text-[10px] font-bold text-slate-500 italic">%</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        
        {/* Market Value Comparison Card */}
        <section className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <i className="fas fa-hand-holding-dollar text-emerald-500"></i>
               Collection Total Value
             </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value (Average)</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(stats.totalAvgValue)}</p>
                <div className="mt-4 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-full animate-in slide-in-from-left duration-1000"></div>
                </div>
             </div>
             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value (Minimum)</p>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(stats.totalMinValue)}</p>
                <div className="mt-4 h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[70%] animate-in slide-in-from-left duration-1000"></div>
                </div>
             </div>
          </div>
        </section>

        {/* Timeline Chart with Numbers */}
        <section className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <i className="fas fa-timeline text-indigo-600"></i>
               Release Timeline
             </h3>
          </div>

          <div className="flex gap-3 h-72 pt-20 pb-2 px-2 relative overflow-x-auto hide-scrollbar">
            {stats.recentYears.map(([year, count]) => {
              const MAX_BAR_HEIGHT_PERCENT = 85;
              const heightPercentage = (count / maxYearCount) * MAX_BAR_HEIGHT_PERCENT;
              const barHeight = Math.max(heightPercentage, 8); 
              
              return (
                <div key={year} className="flex-1 min-w-[34px] h-full flex flex-col items-center gap-2 group relative">
                  <div 
                    className="absolute z-10 animate-in zoom-in fade-in duration-500" 
                    style={{ bottom: `${barHeight}%`, marginBottom: '12px' }}
                  >
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm whitespace-nowrap">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="relative w-full flex-1 flex items-end justify-center">
                    <div 
                      className="w-full max-w-[32px] bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 group-hover:from-indigo-600 group-hover:to-indigo-400 rounded-t-xl transition-all duration-700 shadow-lg relative" 
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-0 group-hover:opacity-20 transition-opacity rounded-t-xl"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{year}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Completion Progress Card */}
        <section className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <i className="fas fa-check-double text-emerald-500"></i>
            Collection Progress
          </h3>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-slate-900 uppercase">Completion Rate</span>
                <span className="text-[11px] font-black text-indigo-600 italic">{stats.completion.toFixed(1)}%</span>
             </div>
             <div className="h-6 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 rounded-xl transition-all duration-1000 shadow-lg"
                  style={{ width: `${stats.completion}%` }}
                ></div>
             </div>
             <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-[0.2em] mt-4 opacity-60">
               {stats.ownedTotal.toLocaleString()} / {stats.totalFigs.toLocaleString()} Figs in Collection
             </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
          
          <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-10 relative z-10">
            Category Spread
          </h3>
          
          <div className="space-y-8 relative z-10">
            {stats.topThemes.map(([name, count]) => (
              <div key={name} className="group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-black text-white uppercase italic tracking-tight truncate pr-4 group-hover:text-indigo-400 transition-colors">
                    {name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-indigo-400">{count.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-slate-600 tracking-widest">FIGS</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-400" 
                    style={{ width: `${(count / Math.max(stats.ownedTotal, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Stats;
