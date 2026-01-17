const LoadingSkeleton = () => {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-32"></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 h-96"></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-96"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;