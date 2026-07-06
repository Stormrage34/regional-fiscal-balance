/**
 * DashboardSkeleton — Loading state placeholders
 * 
 * Displays pulse-animated card placeholders matching the KPI ribbon layout.
 * Used as Suspense fallback for sections that might benefit from loading UX.
 */
export default function DashboardSkeleton({ rows = 3, columns = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 mb-8" role="status" aria-label="Loading">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl relative overflow-hidden border animate-pulse"
          style={{
            backgroundColor: 'rgba(30,41,59,0.5)',
            borderColor: 'rgba(51,65,85,0.3)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-700/50" />
          
          {/* Skeleton content */}
          <div className="p-5 space-y-3">
            {/* Label placeholder */}
            <div className="h-3 w-24 rounded bg-slate-700/50 animate-pulse" />
            
            {/* Value placeholder */}
            <div className="h-10 w-32 rounded bg-slate-700/50 animate-pulse" />
            
            {/* Description placeholders */}
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-slate-700/30 animate-pulse" />
              <div className="h-2 w-3/4 rounded bg-slate-700/30 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
      
      {/* Visually hidden screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
