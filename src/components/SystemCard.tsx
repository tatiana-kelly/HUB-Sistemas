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
 * Card de sistema. O card inteiro é a ação principal — o botão cobre a área com
 * `hub-stretch`, e a estrela fica acima dele, então não há elemento interativo
 * aninhado e a navegação por teclado alcança os dois separadamente.
 *
 * O clique não navega pela URL direto: chama o servidor, que revalida a
 * permissão, grava o access_log e devolve a URL para abrir em nova aba.
 */
export function SystemCard({ system, isFavorite }: SystemCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [error, setError] = useState<string | null>(null)
  const [isOpening, startOpening] = useTransition()
  const [, startFavoriting] = useTransition()

  const isIndicator = system.type === 'indicator'

  function handleOpen() {
    setError(null)
    startOpening(async () => {
      const result = await registerSystemAccess(system.id)
      if (result.error || !result.url) {
        setError(result.error ?? 'Não foi possível abrir o sistema agora. Tente de novo.')
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
    <article className="group relative flex h-full w-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-accent hover:shadow-e3 focus-within:border-line-accent focus-within:shadow-e3">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] transition-colors duration-200 ${
            isIndicator
              ? 'bg-accent-soft text-accent'
              : 'bg-sunken text-muted group-hover:bg-primary-soft group-hover:text-primary-soft-fg'
          }`}
        >
          <SystemIcon icon={system.icon} className="h-4.5 w-4.5" />
        </span>

        <div className="min-w-0 flex-1 pr-7">
          <h3 className="truncate text-[0.9375rem] leading-tight font-semibold text-fg">
            {system.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-muted">
            {system.description ?? 'Acesso corporativo'}
          </p>
        </div>
      </div>

      {/* Acima do card clicável, para poder ser acionada de forma independente. */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-pressed={favorite}
        aria-label={
          favorite ? `Remover ${system.name} dos favoritos` : `Adicionar ${system.name} aos favoritos`
        }
        className={`absolute top-2.5 right-2.5 z-20 grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] transition-colors ${
          favorite ? 'text-accent' : 'text-subtle opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-accent'
        }`}
      >
        <Star className="h-4 w-4" strokeWidth={1.75} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] font-medium text-subtle">
          <span className="truncate">{system.category_name ?? 'Outros'}</span>
          <span aria-hidden="true" className="text-line-strong">
            ·
          </span>
          <span className="shrink-0">{isIndicator ? 'Indicador' : 'Sistema'}</span>
        </span>

        <button
          type="button"
          onClick={handleOpen}
          disabled={isOpening}
          className="hub-stretch z-10 inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-1 text-[0.8125rem] font-semibold text-primary transition-colors group-hover:text-primary-hover disabled:opacity-60"
        >
          {isOpening ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          )}
          {isOpening ? 'Abrindo' : 'Acessar'}
          <span className="sr-only"> {system.name} em nova aba</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="relative z-20 mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </article>
  )
}
