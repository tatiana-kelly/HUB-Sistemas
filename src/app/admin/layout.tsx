import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { AdminNav } from '@/app/admin/AdminNav'
import { requireAdmin } from '@/lib/auth'

/**
 * Portão de entrada da administração: requireAdmin() corre no servidor antes de
 * qualquer página filha renderizar. Acesso direto por URL cai aqui.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="hub-ambient min-h-dvh">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
          Voltar ao portal
        </Link>

        <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-[1.375rem]">
            Administração
          </h1>
          <p className="text-[0.8125rem] text-muted">
            Usuários, sistemas, categorias, permissões e auditoria
          </p>
        </div>

        <AdminNav />

        <div className="mt-5">{children}</div>
      </main>
    </div>
  )
}
