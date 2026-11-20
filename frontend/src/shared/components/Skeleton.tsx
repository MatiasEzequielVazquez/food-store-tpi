interface SkeletonProps {
  cantidad?: number
  className?: string
}

export default function Skeleton({ cantidad = 1, className = 'h-24' }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
      ))}
    </>
  )
}