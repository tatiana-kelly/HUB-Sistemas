import type { Metadata } from 'next'
import { Clock, Star } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Alert } from '@/components/Alert'
import { SystemCard } from '@/components/SystemCard'
import { SystemsBrowser } from '@/components/SystemsBrowser'
import { SystemIcon } from '@/components/SystemIcon'
import { requireSession } from '@/lib/auth'
import {
  getCategories,
  getFavoriteSystemIds,
  getMyRecentAccesses,
  getVisibleSystems,
} from '@/lib/queries'
import { firstName, formatAccessMoment, greeting, lastAccessesBySystem } from '@/lib/access'

export const metadata: Metadata = { title: 'Início — SAL HUB' }

const MESSAGES: Record<string, { tone: 'error' | 'success'; text: string }> = {
  'sem-permissao': {
    tone: 'error',
    text: 'Você não tem permissão para acessar a área de administração.',
  },
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; senha?: string }>
}) {
  const params = await searchParams
  const session = await requireSession()

  // Consultas independentes em paralelo: uma ida ao banco por bloco da página.
  const [systems, categories, favoriteIds, recent] = await Promise.all([
    getVisibleSystems(),
    getCategories(),
    getFavoriteSystemIds(),
    getMyRecentAccesses(),
  ])

  const favoriteSet = new Set(favoriteIds)
  const favorites = systems.filter((system) => favoriteSet.has(system.id))
  const lastAccesses = lastAccessesBySystem(recent, 8)

  // Só oferece filtro de categorias que o usuário realmente enxerga.
  const visibleCategoryNames = categories
    .map((category) => category.name)
    .filter((name) => systems.some((system) => system.category_name === name))

  const notice = params.erro ? MESSAGES[params.erro] : undefined

  return (
    <div className="hub-backdrop min-h-dvh">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
          {params.senha === 'atualizada' && (
            <Alert tone="success">Senha atualizada com sucesso.</Alert>
          )}
        </div>

        <section className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            {greeting()}, {firstName(session.profile.name, session.email)} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Acesse rapidamente os sistemas disponíveis para você.
          </p>
        </section>

        <section aria-labelledby="favoritos-heading" className="mt-8">
          <h2
            id="favoritos-heading"
            className="flex items-center gap-2 text-lg font-semibold text-ink-900"
          >
            <Star
              className="h-4.5 w-4.5 text-accent-500"
              fill="currentColor"
              aria-hidden="true"
              strokeWidth={1.5}
            />
            Meus acessos
          </h2>

          {favorites.length === 0 ? (
            <p className="mt-3 rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-white/60 px-5 py-6 text-sm text-ink-500">
              Você ainda não adicionou favoritos. Toque na estrela de um sistema para deixá-lo
              sempre à mão.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((system) => (
                <li key={system.id} className="flex">
                  <SystemCard system={system} isFavorite />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10">
          <SystemsBrowser
            systems={systems}
            favoriteIds={favoriteIds}
            categories={visibleCategoryNames}
          />
        </div>

        {lastAccesses.length > 0 && (
          <section aria-labelledby="ultimos-heading" className="mt-10">
            <h2
              id="ultimos-heading"
              className="flex items-center gap-2 text-lg font-semibold text-ink-900"
            >
              <Clock className="h-4.5 w-4.5 text-ink-400" aria-hidden="true" strokeWidth={1.75} />
              Últimos acessos
            </h2>

            <ul className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-[var(--radius-card)] border border-ink-200 bg-white shadow-[var(--shadow-card)]">
              {lastAccesses.map((entry) => {
                const system = systems.find((item) => item.id === entry.system_id)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
                        <SystemIcon icon={system?.icon ?? null} className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium text-ink-800">
                        {entry.system_name ?? 'Sistema removido'}
                      </span>
                    </span>
                    <time
                      dateTime={entry.accessed_at}
                      className="shrink-0 text-xs text-ink-500 tabular-nums"
                    >
                      {formatAccessMoment(entry.accessed_at)}
                    </time>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
