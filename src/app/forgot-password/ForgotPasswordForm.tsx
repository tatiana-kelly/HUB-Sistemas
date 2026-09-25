'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { requestPasswordReset, type ActionState } from '@/app/actions/auth'

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(requestPasswordReset, {})

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-ink-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="nome@salexpress.com.br"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </div>

      <SubmitButton pendingLabel="Enviando…">Enviar link de recuperação</SubmitButton>
    </form>
  )
}
