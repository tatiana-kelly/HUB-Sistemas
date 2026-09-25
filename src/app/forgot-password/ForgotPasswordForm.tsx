'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, inputClass } from '@/components/ui'
import { requestPasswordReset, type ActionState } from '@/app/actions/auth'

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(requestPasswordReset, {})

  return (
    <form action={formAction} className="space-y-3.5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="E-mail" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="nome@salexpress.com.br"
          className={`${inputClass} py-2.5`}
        />
      </Field>

      <div className="pt-1">
        <SubmitButton pendingLabel="Enviando…">Enviar link de recuperação</SubmitButton>
      </div>
    </form>
  )
}
