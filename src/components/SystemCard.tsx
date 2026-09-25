'use client'

import { useState, useTransition } from 'react'
import { ArrowUpRight, Loader2, Star } from 'lucide-react'
import { SystemIcon } from '@/components/SystemIcon'
import { registerSystemAccess, toggleFavorite } from '@/app/actions/portal'
import type { SystemWithCategory } from '@/lib/types'

interface SystemCardProps {
  system: SystemWithCategory
  isFavorite: boolean
}

/**
 * Card reutilizável de sistema/indicador.
 *
 * O clique em ACESSAR não navega direto pela URL: chama o servidor, que revalida
 * a permissão, grava o access_log e só então devolve a URL para abrir em nova
 * aba com rel="noopener noreferrer" (nenhuma credencial é repassada).
 */
export function SystemCard({ system, isFavorite }: SystemCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [error, setError] = useState<string | null>(null)
  const [isOpening, startOpening] = useTransition()
  const [isFavoriting, startFavoriting] = useTransition()

  const typeLabel = system.type === 'indicator' ? 'Indicador' : 'Sistema'

  function handleOpen() {
    setError(null)
    startOpening(async () => {
      const result = await registerSystemAccess(system.id)
      if (result.error || !result.url) {
        setError(result.error ?? 'Não foi possível abrir o sistema.')
        return
      }
      window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  function handleFavorite() {
    const next = !favorite
    setFavorite(next)
    startFavoriting(async () => {
      try {
        await toggleFavorite(system.id, favorite)
      } catch {
        setFavorite(!next)
        setError('Não foi possível atualizar o favorito.')
      }
    })
  }

  return (
    <article className="group flex h-full w-full flex-col rounded-[var(--radius-card)] border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] focus-within:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <SystemIcon icon={system.icon} className="h-5 w-5" />
        </span>

        <button
          type="button"
          onClick={handleFavorite}
          disabled={isFavoriting}
          aria-pressed={favorite}
          aria-label={favorite ? `Remover ${system.name} dos favoritos` : `Adicionar ${system.name} aos favoritos`}
          className="-m-1 rounded-lg p-1 text-ink-300 transition-colors hover:text-accent-500 disabled:opacity-50"
        >
          <Star
            className="h-5 w-5"
            strokeWidth={1.75}
            fill={favorite ? 'currentColor' : 'none'}
            aria-hidden="true"
            {...(favorite ? { color: 'var(--color-accent-500)' } : {})}
          />
        </button>
      </div>

      <h3 className="mt-4 text-base leading-snug font-semibold text-ink-900">{system.name}</h3>

      {system.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {system.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {system.category_name && (
          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
            {system.category_name}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            system.type === 'indicator'
              ? 'bg-accent-500/12 text-accent-600'
              : 'bg-brand-50 text-brand-700'
          }`}
        >
          {typeLabel}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={handleOpen}
          disabled={isOpening}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {isOpening ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
          )}
          {isOpening ? 'Abrindo…' : 'Acessar'}
          <span className="sr-only"> {system.name} em nova aba</span>
        </button>
      </div>
    </article>
  )
}
