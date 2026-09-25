'use client'

import { Logo } from '@/components/Logo'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="hub-backdrop flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="lg" withSubtitle />
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Algo não funcionou como esperado</h1>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          Tente novamente. Se o problema continuar, avise a equipe de TI informando o que você
          estava fazendo.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
      >
        Tentar novamente
      </button>
    </main>
  )
}
