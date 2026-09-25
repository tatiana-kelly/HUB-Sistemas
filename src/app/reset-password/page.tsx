import type { Metadata } from 'next'
import { AuthShell } from '@/components/AuthShell'
import { ResetPasswordForm } from '@/app/reset-password/ResetPasswordForm'

export const metadata: Metadata = { title: 'Definir nova senha — SAL HUB' }

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Definir nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres. Somente você a conhece."
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
