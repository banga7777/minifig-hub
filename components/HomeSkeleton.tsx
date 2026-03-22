import React from 'react';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);

const HomeSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Search Bar Skeleton */}
      <Skeleton className="h-11 w-full rounded-xl" />
      
      {/* Dashboard Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />
      
      {/* Collector Guide Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-[2rem]" />
      </div>

      {/* Pick Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-28 flex-shrink-0 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
