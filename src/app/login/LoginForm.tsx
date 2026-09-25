'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, inputClass } from '@/components/ui'
import { signIn, type ActionState } from '@/app/actions/auth'

interface LoginFormProps {
  redirectTo: string
  initialMessage?: string | null
}

export function LoginForm({ redirectTo, initialMessage }: LoginFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(signIn, {})

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {state.error && <Alert tone="error">{state.error}</Alert>}
      {!state.error && initialMessage && <Alert tone="info">{initialMessage}</Alert>}

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

      <Field label="Senha" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${inputClass} py-2.5`}
        />
      </Field>

      <div className="pt-1">
        <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
      </div>

      <p className="pt-0.5 text-center text-[0.8125rem]">
        <Link
          href="/forgot-password"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </form>
  )
}
