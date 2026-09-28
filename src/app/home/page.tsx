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
import { formatAccessMoment, lastAccessesBySystem } from '@/lib/access'

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
    <div className="hub-ambient flex min-h-dvh flex-col">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        {(notice || params.senha === 'atualizada') && (
          <div className="mb-6 space-y-2">
            {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
            {params.senha === 'atualizada' && (
              <Alert tone="success">Senha atualizada com sucesso.</Alert>
            )}
          </div>
        )}

        <SystemsBrowser
          systems={systems}
          favoriteIds={favoriteIds}
          categories={visibleCategoryNames}
          heading={
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-balance text-fg sm:text-[2rem] sm:leading-[1.15]">
                Seus sistemas, em um só lugar.
              </h1>
              <p className="mt-2 text-sm text-muted">
                Acessos disponíveis para o perfil {session.profile.role_name ?? 'do seu usuário'}.
              </p>
            </>
          }
        />

        {favorites.length > 0 && (
          <div className="mt-10">
            <FavoritesStrip systems={favorites} />
          </div>
        )}

        {lastAccesses.length > 0 && (
          <section aria-labelledby="ultimos-heading" className="mt-10">
            <SectionHeading
              id="ultimos-heading"
              icon={<History className="h-4 w-4 text-subtle" aria-hidden="true" strokeWidth={1.75} />}
            >
              Últimos acessos
            </SectionHeading>

            <ul className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
              {lastAccesses.map((entry) => {
                const system = systems.find((item) => item.id === entry.system_id)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <SystemIcon
                        icon={system?.icon ?? null}
                        className="h-3.5 w-3.5 shrink-0 text-subtle"
                      />
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

      <footer className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-[0.6875rem] leading-relaxed tracking-[0.14em] text-subtle uppercase">
            Soluções que
            <br />
            movem o amanhã.
          </p>
          <p className="flex items-center gap-3 text-[0.6875rem] tracking-[0.14em] text-subtle uppercase">
            <span className="text-sm font-bold tracking-tight text-muted normal-case">SAL</span>
            <span aria-hidden="true" className="h-4 w-px bg-line-strong" />
            <span>
              Juntos
              <br />
              mais longe.
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}
