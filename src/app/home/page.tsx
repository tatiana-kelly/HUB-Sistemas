import type { Metadata } from 'next'
import { AppHeader } from '@/components/AppHeader'
import { Alert } from '@/components/Alert'
import { SystemsBrowser } from '@/components/SystemsBrowser'
import { requireSession } from '@/lib/auth'
import { getCategories, getFavoriteSystemIds, getVisibleSystems } from '@/lib/queries'

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

  // Consultas independentes em paralelo. `getVisibleSystems` passa pelo RLS do
  // usuário: um sistema sem permissão não chega aqui, e por isso não existe na
  // grade, na busca, nos filtros nem nos favoritos.
  const [systems, categories, favoriteIds] = await Promise.all([
    getVisibleSystems(),
    getCategories(),
    getFavoriteSystemIds(),
  ])

  // Só oferece filtro de categorias que o usuário realmente enxerga.
  const visibleCategoryNames = categories
    .map((category) => category.name)
    .filter((name) => systems.some((system) => system.category_name === name))

  const notice = params.erro ? MESSAGES[params.erro] : undefined

  return (
    <div className="hub-ambient flex min-h-dvh flex-col">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pt-8 pb-10 sm:px-6 lg:px-8">
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
              <p className="mt-2 text-sm text-muted">Acessos disponíveis para o seu perfil.</p>
            </>
          }
        />
      </main>

      <footer className="mx-auto w-full max-w-[1500px] px-4 pb-8 sm:px-6 lg:px-8">
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
