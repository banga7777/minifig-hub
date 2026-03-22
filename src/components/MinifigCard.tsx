import React from 'react';
import { Minifigure } from '../../types';
import { Check, Star } from 'lucide-react';

interface MinifigCardProps {
  minifig: Minifigure;
  onToggleOwned?: (id: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

const MinifigCard: React.FC<MinifigCardProps> = ({ 
  minifig, 
  onToggleOwned, 
  onClick, 
  isSelected, 
  isSelectionMode 
}) => {
  return (
    <div 
      className={`
        relative group bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
        ${isSelected 
          ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 shadow-lg' 
          : 'border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      <div className="aspect-square bg-slate-50 relative p-3 flex items-center justify-center">
        {minifig.image_url ? (
          <img 
            src={minifig.image_url} 
            alt={`LEGO Minifigure ${minifig.name} (${minifig.item_no})`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-300 text-3xl font-black opacity-20">?</div>
        )}
        
        {onToggleOwned && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleOwned(minifig.item_no);
            }}
            className={`
              absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 z-10
              ${minifig.owned 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-white/90 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 shadow-sm'
              }
            `}
          >
            <Check size={12} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center gap-2 mb-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            {minifig.item_no}
          </span>
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
            {minifig.year_released}
          </span>
        </div>
        
        <h3 className="text-[11px] font-black text-slate-900 leading-tight line-clamp-2 min-h-[2.2em]">
          {minifig.name}
        </h3>
      </div>
    </div>
  );
};

export default MinifigCard;