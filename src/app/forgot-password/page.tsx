import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'
import { ForgotPasswordForm } from '@/app/forgot-password/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar senha — SAL HUB' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      description="Informe seu e-mail e enviaremos um link para você definir uma nova senha."
    >
      <ForgotPasswordForm />

      <p className="mt-5 text-center text-[0.8125rem]">
        <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </AuthShell>
  )
}
