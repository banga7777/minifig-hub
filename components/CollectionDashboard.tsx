import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { Minifigure, UserProfile } from '../types';

interface CollectionDashboardProps {
  user: UserProfile | null;
  onNavigate: (path: string) => void;
  allMinifigs: Minifigure[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 1 
  }).format(val);
};

const CollectionDashboard: React.FC<CollectionDashboardProps> = ({ user, onNavigate, allMinifigs }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['collectionValue', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // 1. Fetch owned minifig IDs
      const { data: ownedData, error: ownedError } = await supabase
        .from('user_owned_minifigs')
        .select('minifig_id')
        .eq('user_id', user.id);

      if (ownedError) throw ownedError;
      
      const minifigIds = ownedData.map(item => item.minifig_id);
      if (minifigIds.length === 0) return { count: 0, totalAvgValue: 0, totalMinValue: 0 };

      // 2. Fetch minifigures with prices
      const { data: minifigs, error: minifigsError } = await supabase
        .from('minifigures')
        .select('item_no, last_stock_avg_price, last_stock_min_price')
        .in('item_no', minifigIds);
        
      if (minifigsError) throw minifigsError;
      
      const totalAvgValue = minifigs.reduce((sum, m) => sum + (m.last_stock_avg_price || 0), 0);
      const totalMinValue = minifigs.reduce((sum, m) => sum + (m.last_stock_min_price || 0), 0);
      
      return {
        count: minifigs.length,
        totalAvgValue,
        totalMinValue
      };
    },
    enabled: !!user,
  });

  const totalFigs = allMinifigs.length; 
  const collectionRate = data ? (data.count / totalFigs) * 100 : 0;
  const level = data ? Math.floor(data.count / 100) : 0;

  return (
    <div 
      onClick={() => !user ? onNavigate('/auth') : onNavigate('/collection')}
      className="group block bg-white rounded-[1.5rem] p-4 shadow-lg shadow-slate-900/5 border border-slate-100 transition-all active:scale-[0.98] cursor-pointer"
    >
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-2.5 bg-indigo-600 rounded-full"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
            </div>
            {user && <span className="bg-amber-100 text-amber-800 text-[7px] font-black px-1.5 py-0.5 rounded-full leading-none shadow-sm border border-amber-200/50">LV.{level}</span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{user ? collectionRate.toFixed(1) : '0.0'}%</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{user ? `${data?.count || 0} / ${totalFigs}` : 'LOGIN'} FIGS</p>
          </div>
        </div>
        <div className="flex flex-col items-end text-right min-w-[80px]">
           <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 opacity-80">Value</p>
           {user && !isLoading && data ? (
             <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                   <span className="text-base font-black text-emerald-600 tracking-tighter">{formatCurrency(data.totalAvgValue)}</span>
                   <span className="text-[6px] font-black text-emerald-400 uppercase">Avg</span>
                </div>
                <div className="flex items-baseline gap-1 opacity-60">
                   <span className="text-[9px] font-black text-indigo-400 tracking-tight">{formatCurrency(data.totalMinValue)}</span>
                   <span className="text-[5px] font-black text-indigo-300 uppercase">Min</span>
                </div>
             </div>
           ) : (
             <div className="text-[10px] text-slate-400">Loading...</div>
           )}
        </div>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
        <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${user ? collectionRate : 0}%` }}></div>
      </div>
    </div>
  );
};

export default CollectionDashboard;
