import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { ResetPasswordForm } from '@/app/reset-password/ResetPasswordForm'

export const metadata: Metadata = { title: 'Definir nova senha — SAL HUB' }

export default function ResetPasswordPage() {
  return (
    <main className="hub-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size="lg" withSubtitle />
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
          <h1 className="text-lg font-semibold text-ink-900">Definir nova senha</h1>
          <p className="mt-1 mb-5 text-sm text-ink-500">
            Escolha uma senha com pelo menos 8 caracteres. Somente você a conhece.
          </p>

          <ResetPasswordForm />
        </div>
      </div>
    </main>
  )
}
