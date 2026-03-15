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
        relative group bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer
        ${isSelected 
          ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 shadow-md' 
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      <div className="aspect-square bg-slate-50 relative p-4 flex items-center justify-center">
        {minifig.image_url ? (
          <img 
            src={minifig.image_url} 
            alt={`LEGO Minifigure ${minifig.name} (${minifig.item_no})`}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-300 text-4xl font-black opacity-20">?</div>
        )}
        
        {onToggleOwned && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleOwned(minifig.item_no);
            }}
            className={`
              absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10
              ${minifig.owned 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-white/80 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
              }
            `}
          >
            <Check size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {minifig.item_no}
          </span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {minifig.year_released}
          </span>
        </div>
        
        <h3 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2 min-h-[2.5em]">
          {minifig.name}
        </h3>

        {/* Price info could go here if needed, but user asked to remove update date */}
      </div>
    </div>
  );
};

export default MinifigCard;