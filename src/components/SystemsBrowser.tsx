'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SearchX, X } from 'lucide-react'
import { SystemCard } from '@/components/SystemCard'
import { EmptyState } from '@/components/ui'
import { filterSystems } from '@/lib/access'
import type { SystemWithCategory } from '@/lib/types'

interface SystemsBrowserProps {
  systems: SystemWithCategory[]
  favoriteIds: string[]
  categories: string[]
  /** Saudação/título da página, renderizada na mesma linha da busca. */
  heading: React.ReactNode
}

/**
 * Catálogo do portal: título e busca dividem a primeira linha, os filtros vêm
 * logo abaixo e a grade ocupa o resto. A busca sobe para o topo porque, com
 * dezenas de sistemas, ela é o caminho mais curto até um acesso específico.
 */
export function SystemsBrowser({ systems, favoriteIds, categories, heading }: SystemsBrowserProps) {
  const [term, setTerm] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds])

  // Sem bloco separado de favoritos, a estrela ganha função aqui: o que a pessoa
  // marcou vem primeiro, preservando a ordem de exibição dentro de cada grupo.
  const visible = useMemo(() => {
    const encontrados = filterSystems(systems, term, category)
    return [
      ...encontrados.filter((system) => favorites.has(system.id)),
      ...encontrados.filter((system) => !favorites.has(system.id)),
    ]
  }, [systems, term, category, favorites])

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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div id="sistemas-heading">{heading}</div>

        <div className="relative w-full lg:w-80 lg:shrink-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-subtle"
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
            placeholder="Buscar sistema..."
            autoComplete="off"
            className="h-12 w-full rounded-full border border-line bg-surface pr-16 pl-11 text-[0.9375rem] text-fg shadow-e1 transition-colors placeholder:text-subtle hover:border-line-strong focus:border-line-accent focus:outline-none"
          />

          {term ? (
            <button
              type="button"
              onClick={() => {
                setTerm('')
                inputRef.current?.focus()
              }}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-2.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-fg"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line bg-sunken px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-subtle lg:block"
            >
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="hub-scroll-x mt-6 -mx-0.5 flex gap-2 px-0.5 pb-1"
      >
        {filters.map((filter) => {
          const isActive = category === filter.value
          return (
            <button
              key={filter.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => setCategory(filter.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-white dark:text-on-inverse'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {filter.label}
              <span
                className={`text-[0.6875rem] tabular-nums ${isActive ? 'opacity-70' : 'text-subtle'}`}
              >
                {filter.count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<SearchX className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />}
            title="Nenhum sistema encontrado."
          >
            Ajuste a busca ou troque o filtro de categoria.
          </EmptyState>
        </div>
      ) : (
        // Flex em vez de grid: com 5 sistemas a última linha fica centralizada,
        // em vez de encostar à esquerda deixando um vão.
        <ul className="mt-6 flex flex-wrap justify-center gap-4">
          {visible.map((system, index) => (
            <li
              key={system.id}
              className="flex w-full max-w-[26rem] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] 2xl:w-[calc(25%-0.75rem)]"
            >
              <SystemCard system={system} isFavorite={favorites.has(system.id)} index={index} />
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
