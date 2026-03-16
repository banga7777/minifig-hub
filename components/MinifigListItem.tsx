import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minifigure } from '../types';

interface MinifigListItemProps {
  minifig: Minifigure;
  onToggleOwned: (itemNo: string, currentOwned?: boolean) => void;
}

const decodeHTMLEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const MinifigListItem: React.FC<MinifigListItemProps> = ({ minifig, onToggleOwned }) => {
  const navigate = useNavigate();
  const decodedName = decodeHTMLEntities(minifig.name);

  const handleNavigate = () => {
    navigate(`/minifigs/${minifig.item_no}/${encodeURIComponent(minifig.name.replace(/ /g, '-'))}`);
  };

  return (
    <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center gap-4 group transition-all active:scale-[0.98]">
      <div 
        className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
        onClick={handleNavigate}
      >
        <img 
          src={minifig.image_url} 
          alt={decodedName} 
          loading="lazy"
          className="w-full h-full object-contain transition-transform group-hover:scale-110"
        />
      </div>

      <div className="flex-1 min-w-0" onClick={handleNavigate}>
        <p className="text-[11px] font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors leading-tight">
          {decodedName}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">{minifig.item_no}</span>
          <span className="text-[9px] text-slate-300 font-bold">{minifig.year_released}</span>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleOwned(minifig.item_no, minifig.owned);
        }}
        className="w-12 h-12 flex items-center justify-center transition-all duration-200 active:scale-75"
        aria-label="Toggle owned status"
      >
        <i className={`${
          minifig.owned 
            ? 'fas text-rose-500 scale-110 drop-shadow-[0_1px_4px_rgba(244,63,94,0.3)]' 
            : 'far text-slate-300 scale-95 hover:text-rose-300'
          } fa-heart text-[16px] transition-all`}
        ></i>
      </button>
    </div>
  );
};

export default MinifigListItem;
