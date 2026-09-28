'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ArrowUpRight, Loader2, Star } from 'lucide-react'
import { SystemBrand } from '@/components/SystemBrand'
import { registerSystemAccess, toggleFavorite } from '@/app/actions/portal'
import type { SystemWithCategory } from '@/lib/types'

interface SystemCardProps {
  system: SystemWithCategory
  isFavorite: boolean
  /** Posição na grade — escalona a entrada em cascata. */
  index?: number
}

/**
 * Card de sistema: marca grande no centro, nome embaixo, card inteiro clicável.
 *
 * A descrição não aparece — o reconhecimento vem da marca, que é como a pessoa
 * já identifica o sistema no dia a dia. Ela continua no DOM para leitor de tela
 * e continua alimentando a busca.
 *
 * O botão de abrir ocupa toda a área do card; a estrela fica acima dele, então
 * não há interativo aninhado e o teclado alcança os dois separadamente.
 */
export function SystemCard({ system, isFavorite, index = 0 }: SystemCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [error, setError] = useState<string | null>(null)
  const [isOpening, startOpening] = useTransition()
  const [, startFavoriting] = useTransition()

  // Só anima a estrela depois de uma interação real: sem isso, todos os
  // favoritos "pipocariam" ao carregar a página.
  const interagiu = useRef(false)
  const [pulso, setPulso] = useState(false)

  useEffect(() => {
    if (!pulso) return
    // Acompanha a duração de .hub-pop, com uma folga para o fim da animação.
    const id = window.setTimeout(() => setPulso(false), 280)
    return () => window.clearTimeout(id)
  }, [pulso])

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
    interagiu.current = true
    setFavorite(next)
    if (next) setPulso(true)

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
    <article
      style={{ '--index': index } as React.CSSProperties}
      className={`hub-rise hub-tile group relative flex h-full w-full flex-col items-center justify-center rounded-[var(--radius-xl)] border border-line bg-surface px-5 pt-10 pb-11 text-center transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-accent hover:shadow-e3 focus-within:border-line-accent focus-within:shadow-e3 ${
        isOpening ? 'hub-progress' : ''
      }`}
    >
      <SystemBrand
        name={system.name}
        url={system.url}
        logoUrl={system.logo_url}
        size={88}
        className="hub-tile-brand"
      />

      <h3 className="mt-5 text-[1.0625rem] leading-tight font-semibold text-balance text-fg">
        {system.name}
      </h3>

      {/* Fora da vista, mas presente para leitor de tela. */}
      {system.description && <span className="sr-only">{system.description}</span>}
      <span className="sr-only">
        {system.category_name ?? 'Outros'} ·{' '}
        {system.type === 'indicator' ? 'Indicador' : 'Sistema'}
      </span>

      <button
        type="button"
        onClick={handleFavorite}
        aria-pressed={favorite}
        aria-label={
          favorite
            ? `Remover ${system.name} dos favoritos`
            : `Adicionar ${system.name} aos favoritos`
        }
        className={`hub-fav absolute top-2 right-2 z-20 grid h-11 w-11 place-items-center rounded-[var(--radius-md)] transition-[color,opacity] ${
          favorite ? 'text-accent' : 'text-subtle hover:text-accent'
        }`}
      >
        <Star
          className={`h-5 w-5 ${pulso ? 'hub-pop' : ''}`}
          strokeWidth={1.75}
          fill={favorite ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>

      {/* Ação principal: o botão É o card. Ele cobre toda a área e alinha a seta
          no canto, em vez de ser um alvo pequeno no canto. A estrela fica acima
          dele (z maior) para continuar clicável de forma independente. */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={isOpening}
        className="absolute inset-0 z-10 flex items-end justify-end rounded-[inherit] p-3 text-subtle transition-colors group-hover:text-primary disabled:opacity-70"
      >
        <span className="grid h-9 w-9 place-items-center">
          {isOpening ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight
              className="hub-arrow h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </span>
        <span className="sr-only">Acessar {system.name} em nova aba</span>
      </button>

      {error && (
        <p role="alert" className="relative z-20 mt-3 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </article>
  )
}
