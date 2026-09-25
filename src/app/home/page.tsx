import type { Metadata } from 'next'
import { History } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Alert } from '@/components/Alert'
import { FavoritesStrip } from '@/components/FavoritesStrip'
import { SystemsBrowser } from '@/components/SystemsBrowser'
import { SystemIcon } from '@/components/SystemIcon'
import { SectionHeading } from '@/components/ui'
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
    <div className="hub-ambient min-h-dvh">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        {(notice || params.senha === 'atualizada') && (
          <div className="mb-5 space-y-2">
            {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
            {params.senha === 'atualizada' && (
              <Alert tone="success">Senha atualizada com sucesso.</Alert>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-[1.375rem]">
            {greeting()}, {firstName(session.profile.name, session.email)}
          </h1>
          <p className="text-[0.8125rem] text-muted">
            {systems.length} {systems.length === 1 ? 'acesso disponível' : 'acessos disponíveis'}{' '}
            para o seu perfil
          </p>
        </div>

        <div className="mt-6">
          <FavoritesStrip systems={favorites} />
        </div>

        <div className="mt-7">
          <SystemsBrowser
            systems={systems}
            favoriteIds={favoriteIds}
            categories={visibleCategoryNames}
          />
        </div>

        {lastAccesses.length > 0 && (
          <section aria-labelledby="ultimos-heading" className="mt-8">
            <SectionHeading
              id="ultimos-heading"
              icon={<History className="h-4 w-4 text-subtle" aria-hidden="true" strokeWidth={1.75} />}
            >
              Últimos acessos
            </SectionHeading>

            <ul className="mt-2.5 grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
              {lastAccesses.map((entry) => {
                const system = systems.find((item) => item.id === entry.system_id)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <SystemIcon icon={system?.icon ?? null} className="h-3.5 w-3.5 shrink-0 text-subtle" />
                      <span className="truncate text-[0.8125rem] text-fg">
                        {entry.system_name ?? 'Sistema removido'}
                      </span>
                    </span>
                    <time
                      dateTime={entry.accessed_at}
                      className="shrink-0 text-xs text-subtle tabular-nums"
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
