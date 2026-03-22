
import React from 'react';

const AdCard: React.FC = () => {
  return (
    <div className="bg-binance-dark/50 rounded-xl p-1.5 border border-dashed border-white/10 group flex flex-col h-full relative overflow-hidden transition-all">
      {/* 명확한 'AD' 배지 추가 (구글 정책 준수) */}
      <div className="absolute top-2 left-2 z-20 bg-binance-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-black text-binance-gray uppercase tracking-tighter">
        AD
      </div>

      <div className="aspect-square rounded-lg bg-binance-black/30 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center opacity-40">
          <i className="fas fa-rectangle-ad text-3xl text-binance-gray mb-2"></i>
          <span className="text-[9px] font-black text-binance-gray uppercase tracking-[0.2em]">SPONSORED</span>
        </div>
        
        {/* 미세한 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-binance-black/10 to-transparent"></div>
      </div>

      <div className="mt-2 px-1 pb-1 flex flex-col flex-1">
        {/* 텍스트 영역을 콘텐츠 카드와 다르게 스켈레톤 처리하여 오클릭 방지 */}
        <div className="space-y-1.5 mb-auto">
          <div className="h-2 w-16 bg-white/5 rounded"></div>
          <div className="h-3 w-full bg-white/5 rounded"></div>
        </div>
        
        <div className="mt-4 pt-2 border-t border-white/5">
          <div className="w-full h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-binance-yellow transition-all duration-300">
            <span className="text-[8px] font-black text-binance-gray group-hover:text-binance-black uppercase tracking-widest">Learn More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
