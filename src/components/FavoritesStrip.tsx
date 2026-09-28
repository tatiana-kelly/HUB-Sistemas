'use client'

import { useState, useTransition } from 'react'
import { Loader2, Star, X } from 'lucide-react'
import { SystemBrand } from '@/components/SystemBrand'
import { EmptyState, SectionHeading } from '@/components/ui'
import { registerSystemAccess, toggleFavorite } from '@/app/actions/portal'
import type { SystemWithCategory } from '@/lib/types'

/**
 * Atalhos favoritos em faixa horizontal. Ocupa uma única linha por design: é um
 * atalho, não a seção principal — e continua legível com 3 ou com 30 favoritos,
 * rolando na horizontal.
 */
export function FavoritesStrip({ systems }: { systems: SystemWithCategory[] }) {
  if (systems.length === 0) {
    return (
      <section aria-labelledby="favoritos-heading">
        <SectionHeading
          id="favoritos-heading"
          icon={<Star className="h-4 w-4 text-accent" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />}
        >
          Meus acessos
        </SectionHeading>

        <div className="mt-2.5">
          <EmptyState title="Seus acessos favoritos aparecerão aqui.">
            Marque a estrela dos sistemas que você mais utiliza.
          </EmptyState>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="favoritos-heading">
      <SectionHeading
        id="favoritos-heading"
        icon={<Star className="h-4 w-4 text-accent" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />}
        aside={
          <span className="text-xs text-subtle tabular-nums">
            {systems.length} {systems.length === 1 ? 'atalho' : 'atalhos'}
          </span>
        }
      >
        Meus acessos
      </SectionHeading>

      <ul className="hub-scroll-x mt-2.5 -mx-1 flex gap-2 px-1 pb-1.5">
        {systems.map((system, index) => (
          <li
            key={system.id}
            style={{ '--index': index } as React.CSSProperties}
            className="hub-rise shrink-0 snap-start"
          >
            <FavoriteChip system={system} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FavoriteChip({ system }: { system: SystemWithCategory }) {
  const [removed, setRemoved] = useState(false)
  const [isOpening, startOpening] = useTransition()
  const [, startRemoving] = useTransition()

  if (removed) return null

  function open() {
    startOpening(async () => {
      const result = await registerSystemAccess(system.id)
      if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  function remove() {
    setRemoved(true)
    startRemoving(async () => {
      try {
        await toggleFavorite(system.id, true)
      } catch {
        setRemoved(false)
      }
    })
  }

  return (
    <div className="group relative flex items-center rounded-full border border-line bg-surface pr-1 pl-1.5 transition-[border-color,box-shadow] duration-150 hover:border-line-accent hover:shadow-e2 focus-within:border-line-accent">
      <button
        type="button"
        onClick={open}
        disabled={isOpening}
        className="flex items-center gap-2 rounded-full py-1.5 pr-2 pl-1 text-[0.8125rem] font-medium text-fg disabled:opacity-60"
      >
        {isOpening ? (
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunken text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          </span>
        ) : (
          <SystemBrand
            name={system.name}
            url={system.url}
            logoUrl={system.logo_url}
            size={24}
            className="!rounded-full"
          />
        )}
        <span className="max-w-44 truncate">{system.name}</span>
        <span className="sr-only">— abrir em nova aba</span>
      </button>

      <button
        type="button"
        onClick={remove}
        aria-label={`Remover ${system.name} dos favoritos`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-danger"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
