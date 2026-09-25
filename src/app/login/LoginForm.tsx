'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { signIn, type ActionState } from '@/app/actions/auth'

interface LoginFormProps {
  redirectTo: string
  initialMessage?: string | null
}

export function LoginForm({ redirectTo, initialMessage }: LoginFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(signIn, {})

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {state.error && <Alert tone="error">{state.error}</Alert>}
      {!state.error && initialMessage && <Alert tone="info">{initialMessage}</Alert>}

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

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-ink-700">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </div>

      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>

      <p className="text-center text-sm">
        <Link
          href="/forgot-password"
          className="font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </form>
  )
}
