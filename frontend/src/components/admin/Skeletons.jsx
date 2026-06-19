export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden">
      <div className="divide-y divide-[#2A3A2C]/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-[#2A3A2C] rounded flex-1 max-w-[10rem]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardListSkeleton({ rows = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden flex animate-pulse">
          <div className="w-40 h-24 bg-[#1D2B1F] flex-shrink-0" />
          <div className="flex-1 px-5 py-4 space-y-2.5">
            <div className="h-4 bg-[#2A3A2C] rounded w-1/3" />
            <div className="h-3 bg-[#2A3A2C] rounded w-1/2" />
            <div className="h-3 bg-[#2A3A2C] rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Block({ className = "" }) {
  return <div className={`bg-[#162018] border border-[#2A3A2C] rounded-xl animate-pulse ${className}`} />;
}
