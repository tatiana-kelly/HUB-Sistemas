import { Skeleton } from '@/components/ui'

/** Esqueleto da home: mesma silhueta da página real, sem tela branca. */
export default function HomeLoading() {
  return (
    <div className="hub-ambient min-h-dvh">
      <div className="h-14 border-b border-line bg-surface" />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-64" />

        <div className="mt-6 space-y-2.5">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-40 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-7 space-y-2.5">
          <Skeleton className="h-4 w-44" />
          <div className="flex flex-col gap-2.5 lg:flex-row">
            <Skeleton className="h-9.5 w-full rounded-[var(--radius-md)] lg:w-80" />
            <Skeleton className="h-9.5 w-full max-w-md rounded-full" />
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-[7.75rem] w-full rounded-[var(--radius-lg)]" />
            </li>
          ))}
        </ul>
      </main>

      <span className="sr-only" role="status">
        Carregando seus acessos…
      </span>
    </div>
  )
}
