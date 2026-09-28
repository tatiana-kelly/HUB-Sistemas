'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SearchX, X } from 'lucide-react'
import { SystemCard } from '@/components/SystemCard'
import { EmptyState, SectionHeading } from '@/components/ui'
import { filterSystems } from '@/lib/access'
import type { SystemWithCategory } from '@/lib/types'

interface SystemsBrowserProps {
  systems: SystemWithCategory[]
  favoriteIds: string[]
  categories: string[]
}

/**
 * Catálogo de sistemas: busca em tempo real, filtro por categoria com contagem e
 * grade que adensa conforme a largura — pensada para continuar organizada com
 * dezenas de sistemas, não só com cinco.
 */
export function SystemsBrowser({ systems, favoriteIds, categories }: SystemsBrowserProps) {
  const [term, setTerm] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds])
  const visible = useMemo(() => filterSystems(systems, term, category), [systems, term, category])

  // Ctrl/⌘ + K foca a busca. Ignorado quando o foco já está num campo, para não
  // atrapalhar quem digita em um formulário.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return

      const active = document.activeElement
      const isTyping =
        active instanceof HTMLElement &&
        (active.tagName === 'TEXTAREA' ||
          active.isContentEditable ||
          (active.tagName === 'INPUT' && active !== inputRef.current))

      if (isTyping) return

      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filters: { label: string; value: string | null; count: number }[] = [
    { label: 'Todos', value: null, count: systems.length },
    ...categories.map((name) => ({
      label: name,
      value: name,
      count: systems.filter((system) => system.category_name === name).length,
    })),
  ]

  return (
    <section aria-labelledby="sistemas-heading">
      <SectionHeading
        id="sistemas-heading"
        aside={
          <span className="text-xs text-subtle tabular-nums">
            {visible.length} de {systems.length}
          </span>
        }
      >
        Sistemas e indicadores
      </SectionHeading>

      <div className="mt-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        {/* Com dezenas de sistemas, buscar é o caminho real — por isso o campo
            tem presença de ferramenta, não de filtro auxiliar. */}
        <div className="relative lg:w-96 lg:shrink-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="busca-sistemas" className="sr-only">
            Buscar sistema ou indicador
          </label>
          <input
            ref={inputRef}
            id="busca-sistemas"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar sistema ou indicador..."
            autoComplete="off"
            className="h-11 w-full rounded-[var(--radius-md)] border border-line bg-surface pr-16 pl-10.5 text-[0.9375rem] text-fg shadow-e1 transition-colors placeholder:text-subtle hover:border-line-strong focus:border-line-accent focus:outline-none"
          />

          {term ? (
            <button
              type="button"
              onClick={() => {
                setTerm('')
                inputRef.current?.focus()
              }}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[var(--radius-xs)] text-subtle transition-colors hover:bg-hover hover:text-fg"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-line bg-sunken px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-subtle lg:block"
            >
              Ctrl K
            </kbd>
          )}
        </div>

        <div
          role="group"
          aria-label="Filtrar por categoria"
          className="hub-scroll-x -mx-0.5 flex gap-1.5 px-0.5 pb-0.5"
        >
          {filters.map((filter) => {
            const isActive = category === filter.value
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(filter.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors ${
                  isActive
                    ? 'bg-inverse text-on-inverse'
                    : 'text-muted hover:bg-hover hover:text-fg'
                }`}
              >
                {filter.label}
                <span
                  className={`text-[0.6875rem] tabular-nums ${isActive ? 'opacity-60' : 'text-subtle'}`}
                >
                  {filter.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<SearchX className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />}
            title="Nenhum sistema encontrado."
          >
            Ajuste a busca ou troque o filtro de categoria.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((system, index) => (
            <li key={system.id} className="flex">
              <SystemCard
                system={system}
                isFavorite={favorites.has(system.id)}
                index={index}
              />
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="sr-only">
        {visible.length} sistemas exibidos.
      </p>
    </section>
  )
}
