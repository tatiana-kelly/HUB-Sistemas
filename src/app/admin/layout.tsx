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
    <div className="hub-backdrop min-h-dvh">
      <AppHeader session={session} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
          Voltar ao portal
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">Administração</h1>
        <p className="mt-1 text-sm text-ink-500">
          Usuários, sistemas, categorias, permissões e auditoria de acessos.
        </p>

        <AdminNav />

        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}
