
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Minifigure, UserProfile } from '../types';
import MinifigCard from '../components/MinifigCard';
import { supabase } from '../services/supabaseClient';
import { AdMobService } from '../services/adMobService';

const AMAZON_TAG = 'minifighub-20'; 
const EBAY_CAMPID = '5339000000';  

interface AppearanceSummary {
  item_no: string;
  set_list: string[];
}

interface MinifigDetailProps {
  onToggleOwned: (id: string) => void;
  allMinifigs: Minifigure[];
  user: UserProfile | null;
}

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const formatCurrency = (val?: number) => {
  if (val === undefined || val === 0) return '---';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

// 세트 번호에서 -1, -2 등의 접미사를 제거하는 헬퍼 함수
const stripSetSuffix = (setNo: string) => {
  return setNo.split('-')[0];
};

const MinifigDetail: React.FC<MinifigDetailProps> = ({ onToggleOwned, allMinifigs, user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appearanceSummary, setAppearanceSummary] = useState<AppearanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const minifig = useMemo(() => allMinifigs.find(m => m.item_no === id), [allMinifigs, id]);

  useEffect(() => {
    const VIEW_COUNT_KEY = 'minifig_detail_view_count';
    const currentCount = parseInt(sessionStorage.getItem(VIEW_COUNT_KEY) || '0', 10);
    const newCount = currentCount + 1;
    sessionStorage.setItem(VIEW_COUNT_KEY, newCount.toString());
    AdMobService.showInterstitial();

    if (!id || !minifig) return;

    const controller = new AbortController();
    const fetchAppearanceData = async () => {
      setLoadingSummary(true);
      try {
        const { data, error } = await supabase
          .from('minifig_supersets_grouped')
          .select('item_no, set_list')
          .eq('item_no', id)
          .abortSignal(controller.signal)
          .single();
        
        if (!error && data) setAppearanceSummary(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Error fetching appearance summary:", err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchAppearanceData();
    return () => controller.abort();
  }, [id, minifig]);

  const setListArray = useMemo(() => {
    if (!appearanceSummary?.set_list) return [];
    return appearanceSummary.set_list.filter(Boolean);
  }, [appearanceSummary]);

  const handleShare = async () => {
    if (navigator.share && minifig) {
      try {
        await navigator.share({
          title: `Minifig Hub: ${minifig.name}`,
          text: `Check out this LEGO Minifigure: ${minifig.name} (${minifig.item_no})`,
          url: window.location.href,
        });
      } catch (err) { console.error("Error sharing:", err); }
    } else { alert("Sharing is not supported on this browser."); }
  };

  const relatedFigs = useMemo(() => {
    if (!minifig) return [];
    const targetTheme = minifig.theme_name;
    const targetSub = minifig.sub_category;
    const currentId = minifig.item_no;
    const candidates: Minifigure[] = [];
    for (let i = 0; i < allMinifigs.length; i++) {
        if (allMinifigs[i].theme_name === targetTheme && allMinifigs[i].item_no !== currentId) candidates.push(allMinifigs[i]);
    }
    const primaryName = minifig.name.split(/[, (]/)[0].toLowerCase();
    const scoredCandidates = candidates.map(m => {
      let score = 50;
      if (targetSub && m.sub_category === targetSub) score += 30;
      if (m.name.toLowerCase().includes(primaryName)) score += 100;
      return { minifig: m, score };
    });
    scoredCandidates.sort((a, b) => b.score !== a.score ? b.score - a.score : b.minifig.year_released - a.minifig.year_released);
    return scoredCandidates.slice(0, 15).map(item => item.minifig);
  }, [allMinifigs, minifig]);

  if (!minifig) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div className="animate-in fade-in zoom-in duration-300"><p className="text-slate-400 font-bold mb-4">Item Not Found.</p><button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Go Home</button></div>
    </div>
  );

  const decodedName = decodeHTMLEntities(minifig.name);
  const getAmazonLink = (query: string) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
  const getEbayLink = (query: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${EBAY_CAMPID}&toolid=10001&mkevt=1`;
  const getBricklinkMinifigLink = (itemNo: string) => `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${itemNo}`;
  const getBricklinkSetLink = (setNo: string) => `https://www.bricklink.com/v2/catalog/catalogitem.page?S=${setNo}`;

  return (
    <div className="pb-40 bg-slate-50 min-h-screen font-['Outfit'] ios-scroll">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white px-6 pt-6 pb-12 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 relative">
          <div className="absolute top-4 right-6"><button onClick={handleShare} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform shadow-sm"><i className="fas fa-share-nodes text-xs"></i></button></div>
          <div className="relative aspect-square max-w-[220px] mx-auto mb-6 group img-container-skeleton rounded-[2rem]"><div className="absolute inset-0 bg-slate-100/30 rounded-full blur-[60px] opacity-40"></div><img src={minifig.image_url} alt={decodedName} className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500"/></div>
          <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Link to={`/themes/${encodeURIComponent(minifig.theme_name.replace(/ /g, '-'))}`} className="inline-block text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 bg-indigo-50 px-3 py-1 rounded-full shadow-sm">{minifig.theme_name}</Link>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter mb-3 px-4">{decodedName}</h1>
            <div className="flex items-center justify-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8"><span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{minifig.item_no}</span><span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span><span>Released {minifig.year_released}</span></div>
            <button onClick={() => onToggleOwned(minifig.item_no)} className={`w-full max-w-[320px] h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 shadow-xl mx-auto mb-2 ${minifig.owned ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-900 text-white shadow-slate-900/20'}`}><i className={`${minifig.owned ? 'fas' : 'far'} fa-heart text-sm`}></i>{minifig.owned ? 'I OWN THIS FIGURE' : 'ADD TO COLLECTION'}</button>
          </div>
        </div>

        {/* 시장 가치 상세 (Market Value) 섹션 */}
        <div className="px-6 -mt-6 relative z-20">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 border border-slate-100 mb-6">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Market Value</h2>
               </div>
               {minifig.stock_updated_at && (
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                   {new Date(minifig.stock_updated_at).toLocaleDateString()}
                 </span>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg</p>
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(minifig.last_stock_avg_price)}</p>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Min</p>
                  <p className="text-xl font-black text-indigo-600">{formatCurrency(minifig.last_stock_min_price)}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <a href={getAmazonLink(`LEGO minifigure ${minifig.item_no}`)} target="_blank" className="flex items-center justify-center gap-2.5 h-12 bg-amber-50 rounded-xl border border-amber-100/50 hover:bg-amber-100 transition-all active:scale-95 group shadow-sm"><i className="fab fa-amazon text-amber-600 text-xs"></i><span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Amazon</span></a>
              <a href={getEbayLink(`LEGO ${minifig.item_no}`)} target="_blank" className="flex items-center justify-center gap-2.5 h-12 bg-indigo-50 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 transition-all active:scale-95 group shadow-sm"><i className="fas fa-shopping-bag text-indigo-600 text-xs"></i><span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">eBay</span></a>
              <a href={getBricklinkMinifigLink(minifig.item_no)} target="_blank" className="flex items-center justify-center gap-2.5 h-12 bg-slate-50 rounded-xl border border-slate-100/50 hover:bg-slate-100 transition-all active:scale-95 group shadow-sm"><i className="fas fa-store text-slate-600 text-xs"></i><span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">BrickLink</span></a>
            </div>
          </div>
        </div>

        <div className="px-6 mt-10"><div className="flex items-center gap-2 mb-4 px-2"><div className="w-1.5 h-3.5 bg-slate-400 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Featured In Set</h2></div>{loadingSummary ? (<div className="py-12 flex flex-col items-center justify-center gap-3"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Scanning Database...</p></div>) : setListArray.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{setListArray.map((setNo) => (<div key={setNo} className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-900/5 border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300"><div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0 border border-slate-100 shadow-inner"><img src={`https://img.bricklink.com/ItemImage/SN/0/${setNo}.png`} alt={setNo} className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).src = 'https://www.bricklink.com/img/no_image.png'}/></div><div className="flex-1 min-w-0"><h3 className="text-sm font-black text-slate-900 italic uppercase tracking-tighter truncate leading-none">SET #{stripSetSuffix(setNo)}</h3><p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 opacity-80">Official Product</p></div></div><div className="grid grid-cols-3 gap-2"><a href={getAmazonLink(`LEGO ${stripSetSuffix(setNo)}`)} target="_blank" className="h-9 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm">Amazon</a><a href={getEbayLink(`LEGO ${stripSetSuffix(setNo)}`)} target="_blank" className="h-9 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm">eBay</a><a href={getBricklinkSetLink(setNo)} target="_blank" className="h-9 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm">BrickLink</a></div></div>))}</div>) : (<div className="py-10 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-slate-300 font-black uppercase text-[9px] tracking-[0.3em]">No sets listed</p></div>)}</div>
        <div className="px-6 mt-12 mb-24"><div className="flex items-center gap-2 mb-4 px-2"><div className="w-1.s h-3.5 bg-slate-900 rounded-full"></div><h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic">Related Figures</h2></div><div className="grid grid-cols-3 gap-3">{relatedFigs.map(m => (<MinifigCard key={m.item_no} minifig={m} onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}/${encodeURIComponent(m.name.replace(/ /g, '-'))}`)} isSelected={false} isSelectionMode={false}/>))}</div></div>
      </div>
    </div>
  );
};

export default MinifigDetail;
