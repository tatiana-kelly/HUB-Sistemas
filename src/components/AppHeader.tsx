import Link from 'next/link'
import { LogOut, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { signOut } from '@/app/actions/auth'
import type { HubSession } from '@/lib/types'

interface AppHeaderProps {
  session: HubSession
}

export function AppHeader({ session }: AppHeaderProps) {
  const displayName = session.profile.name ?? session.email ?? 'Usuário'

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/home" className="rounded-lg" aria-label="SAL HUB — ir para a página inicial">
          <Logo withSubtitle />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[16rem] truncate text-sm font-medium text-ink-800">{displayName}</p>
            <p className="text-xs text-ink-500">{session.profile.role_name ?? 'Sem perfil'}</p>
          </div>

          {session.isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">Administração</span>
              <span className="sr-only sm:hidden">Administração</span>
            </Link>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sair</span>
              <span className="sr-only sm:hidden">Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
