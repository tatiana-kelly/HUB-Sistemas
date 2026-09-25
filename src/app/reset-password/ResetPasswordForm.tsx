'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { updatePassword, type ActionState } from '@/app/actions/auth'

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(updatePassword, {})

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-ink-700">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="block text-sm font-medium text-ink-700">
          Confirmar nova senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </div>

      <SubmitButton pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
    </form>
  )
}
