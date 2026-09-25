import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { LoginForm } from '@/app/login/LoginForm'

export const metadata: Metadata = { title: 'Entrar — SAL HUB' }

const MESSAGES: Record<string, string> = {
  inativo: 'Seu acesso está desativado. Procure o administrador do portal.',
  'link-invalido': 'O link expirou ou já foi utilizado. Solicite um novo link de acesso.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; erro?: string }>
}) {
  const params = await searchParams
  const redirectTo =
    params.redirectTo && params.redirectTo.startsWith('/') ? params.redirectTo : '/home'
  const message = params.erro ? MESSAGES[params.erro] : null

  return (
    <main className="hub-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size="lg" withSubtitle />
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h1 className="text-lg font-semibold text-ink-900">Entrar no portal</h1>
          <p className="mt-1 mb-5 text-sm text-ink-500">
            Use o e-mail corporativo cadastrado pelo administrador.
          </p>

          <LoginForm redirectTo={redirectTo} initialMessage={message} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          SAL Express · acesso restrito a usuários autorizados
        </p>
      </div>
    </main>
  )
}
