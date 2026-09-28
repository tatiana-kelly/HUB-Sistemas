import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { ThemeMenu } from '@/components/theme/ThemeMenu'
import { buttonClass } from '@/components/ui'
import type { HubSession } from '@/lib/types'

/**
 * Cabeçalho do portal.
 *
 * O perfil aparece como texto, nunca como seletor: quem define o que a pessoa
 * enxerga é o role gravado no profile, e trocá-lo é ação de administrador. Aqui
 * é só a leitura do que a sessão já traz.
 *
 * Em telas estreitas o botão de administração recolhe para dentro do menu do
 * usuário, deixando só identidade, tema e conta na barra.
 */
export function AppHeader({ session }: { session: HubSession }) {
  const displayName = session.profile.name ?? session.email?.split('@')[0] ?? 'Usuário'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/home"
          aria-label="SAL HUB — ir para a página inicial"
          className="rounded-[var(--radius-md)]"
        >
          {/* Abaixo de 360px o subtítulo sai para o nome e os controles caberem. */}
          <Logo withSubtitle subtitleClassName="max-[359px]:hidden" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {session.profile.role_name && (
            <p className="mr-1 hidden text-[0.8125rem] text-muted md:block">
              Perfil:{' '}
              <span className="font-semibold text-fg">{session.profile.role_name}</span>
            </p>
          )}

          {/* Wrapper em vez de `hidden` no próprio link: buttonClass já define
              display, e as duas utilidades competiriam pela mesma propriedade. */}
          {session.isAdmin && (
            <span className="hidden lg:block">
              <Link href="/admin" className={buttonClass('secondary', 'sm')}>
                <ShieldCheck className="h-4 w-4 text-subtle" strokeWidth={1.75} aria-hidden="true" />
                Administração
              </Link>
            </span>
          )}

          <ThemeMenu />

          <UserMenu
            name={displayName}
            email={session.email}
            roleName={session.profile.role_name}
            isAdmin={session.isAdmin}
          />
        </div>
      </div>
    </header>
  )
}
