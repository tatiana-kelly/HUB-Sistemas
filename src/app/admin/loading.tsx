import { Skeleton } from '@/components/ui'

export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 w-full rounded-[var(--radius-lg)]" />
      <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
      <span className="sr-only" role="status">
        Carregando…
      </span>
    </div>
  )
}
