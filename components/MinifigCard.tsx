
import React, { memo } from 'react';
import { Minifigure } from '../types';

interface MinifigCardProps {
  minifig: Minifigure;
  onToggleOwned: (itemNo: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  variant?: 'light' | 'dark';
}

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const formatCurrency = (val?: number) => {
  if (val === undefined || val === 0) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

const MinifigCard: React.FC<MinifigCardProps> = ({ 
  minifig, 
  onToggleOwned, 
  onClick, 
  isSelected, 
  isSelectionMode,
  variant = 'light'
}) => {
  const decodedName = minifig.decoded_name;
  const currentYear = new Date().getFullYear();
  // 카드에는 평균가 대신 최저가(Min Price)를 표시
  const priceDisplay = formatCurrency(minifig.last_stock_min_price);
  const isDark = variant === 'dark';

  return (
    <div 
      className={`
        rounded-xl p-1.5 shadow-sm border group transition-all duration-200 relative flex flex-col h-full
        ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 shadow-sm'}
        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : ''} 
        ${isSelectionMode ? 'cursor-pointer' : ''} 
        ${isSelectionMode && !isSelected ? 'opacity-70' : ''}
      `}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isSelectionMode && (
        <div className={`absolute top-2 right-2 z-30 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all duration-200 ${isSelected ? 'bg-indigo-600' : 'bg-white/50'}`}>
          {isSelected && <i className="fas fa-check text-white text-[9px]"></i>}
        </div>
      )}
      
      <div 
        className={`aspect-square rounded-lg flex items-center justify-center overflow-hidden relative img-container-skeleton ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      >
        {minifig.image_url ? (
          <img 
            src={minifig.image_url} 
            alt={`LEGO ${minifig.theme_name} ${decodedName} Minifigure ${minifig.item_no}`} 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-[92%] h-[92%] object-contain p-0.5 relative z-10 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-slate-700' : 'text-slate-200'}`}>
            <i className="fas fa-image text-xl"></i>
          </div>
        )}

        {/* 가격 배지 */}
        {priceDisplay && !isSelectionMode && (
          <div className="absolute top-1.5 left-1.5 z-20 flex flex-col gap-1 items-start">
            <div className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-indigo-400/50 backdrop-blur-sm">
              {priceDisplay}
            </div>
          </div>
        )}
        
        <div className={`absolute top-0 right-0 flex flex-col items-end z-20 ${isSelectionMode ? 'hidden' : ''}`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleOwned(minifig.item_no);
            }}
            className="w-10 h-10 flex items-center justify-center transition-all duration-200 active:scale-75 focus:outline-none"
            aria-label="Toggle owned status"
          >
            <i className={`${
              minifig.owned 
                ? 'fas text-rose-500 scale-110 drop-shadow-[0_1px_4px_rgba(244,63,94,0.3)]' 
                : isDark ? 'far text-white/20 scale-95 hover:text-rose-400' : 'far text-slate-300 scale-95 hover:text-rose-300'
              } fa-heart text-[14px] transition-all`}
            ></i>
          </button>
        </div>

        {minifig.year_released === currentYear && (
          <div className="absolute bottom-1.5 left-1.5 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter z-20 shadow-lg">
            NEW
          </div>
        )}
      </div>

      <div className="mt-2 px-1 pb-1 flex-1 flex flex-col">
        <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 truncate opacity-90 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
          {minifig.theme_name}
        </p>
        <h3 
          className={`text-[11px] font-bold line-clamp-2 leading-tight flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {decodedName}
        </h3>
        <div className={`flex items-center justify-between mt-2 pt-1.5 border-t ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
          <span className={`text-[9px] font-mono font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{minifig.item_no}</span>
          <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>{minifig.year_released}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(MinifigCard);
