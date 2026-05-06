interface SkeletonProps {
  className?: string
  shape?: 'rect' | 'circle' | 'pill'
}

export function Skeleton({ className = '', shape = 'rect' }: SkeletonProps) {
  const radius = shape === 'circle' ? 'rounded-full' : shape === 'pill' ? 'rounded-full' : 'rounded-2xl'
  return (
    <div
      className={`relative overflow-hidden ${radius} ${className}`}
      style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.06) 100%)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'sk-shimmer 1.5s infinite linear',
        }}
      />
      <style>{`@keyframes sk-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton shape="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Skeleton shape="circle" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  )
}
