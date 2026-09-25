import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ForgotPasswordForm } from '@/app/forgot-password/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Recuperar senha — SAL HUB' }

export default function ForgotPasswordPage() {
  return (
    <main className="hub-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size="lg" withSubtitle />
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h1 className="text-lg font-semibold text-ink-900">Recuperar senha</h1>
          <p className="mt-1 mb-5 text-sm text-ink-500">
            Informe seu e-mail e enviaremos um link para você definir uma nova senha.
          </p>

          <ForgotPasswordForm />

          <p className="mt-5 text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-brand-700 underline-offset-2 hover:underline"
            >
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
