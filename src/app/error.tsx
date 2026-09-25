'use client'

import { AlertTriangle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { buttonClass } from '@/components/ui'

/**
 * Erro genérico do portal. Nunca mostramos a mensagem técnica ao usuário — ela
 * fica no log do servidor; aqui só o que ele pode fazer a respeito.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="hub-ambient flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size="lg" withSubtitle />

      <span className="grid h-11 w-11 place-items-center rounded-full bg-warning-soft text-warning">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
      </span>

      <div>
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          Algo não funcionou como esperado
        </h1>
        <p className="mt-1 max-w-sm text-[0.8125rem] text-muted">
          Tente novamente. Se o problema continuar, avise a equipe de TI contando o que você estava
          fazendo.
        </p>
      </div>

      <button type="button" onClick={reset} className={buttonClass('primary')}>
        Tentar novamente
      </button>
    </main>
  )
}
