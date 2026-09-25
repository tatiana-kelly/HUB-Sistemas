'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, inputClass } from '@/components/ui'
import { updatePassword, type ActionState } from '@/app/actions/auth'

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(updatePassword, {})

  return (
    <form action={formAction} className="space-y-3.5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="Nova senha" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          className={`${inputClass} py-2.5`}
        />
      </Field>

      <Field label="Confirmar nova senha" htmlFor="confirm">
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${inputClass} py-2.5`}
        />
      </Field>

      <div className="pt-1">
        <SubmitButton pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
      </div>
    </form>
  )
}
