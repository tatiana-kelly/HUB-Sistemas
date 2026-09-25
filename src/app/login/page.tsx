import type { Metadata } from 'next'
import { AuthShell } from '@/components/AuthShell'
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
    <AuthShell
      title="Entrar no portal"
      description="Use o e-mail corporativo cadastrado pelo administrador."
      footer={
        <p className="mt-6 text-center text-xs text-subtle">
          SAL Express · acesso restrito a usuários autorizados
        </p>
      }
    >
      <LoginForm redirectTo={redirectTo} initialMessage={message} />
    </AuthShell>
  )
}
