'use client'

import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { SystemCard } from '@/components/SystemCard'
import { filterSystems } from '@/lib/access'
import type { SystemWithCategory } from '@/lib/types'

interface SystemsBrowserProps {
  systems: SystemWithCategory[]
  favoriteIds: string[]
  categories: string[]
}

/** Busca em tempo real + filtro por categoria sobre os sistemas já autorizados. */
export function SystemsBrowser({ systems, favoriteIds, categories }: SystemsBrowserProps) {
  const [term, setTerm] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds])
  const visible = useMemo(() => filterSystems(systems, term, category), [systems, term, category])

  const filters: { label: string; value: string | null }[] = [
    { label: 'Todos', value: null },
    ...categories.map((name) => ({ label: name, value: name })),
  ]

  return (
    <section aria-labelledby="sistemas-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="sistemas-heading" className="text-lg font-semibold text-ink-900">
          Sistemas e Indicadores
        </h2>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <label htmlFor="busca-sistemas" className="sr-only">
            Buscar sistema ou indicador
          </label>
          <input
            id="busca-sistemas"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar sistema ou indicador..."
            autoComplete="off"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pr-3 pl-9 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="mt-4 -mx-1 flex flex-wrap gap-2 px-1"
      >
        {filters.map((filter) => {
          const isActive = category === filter.value
          return (
            <button
              key={filter.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => setCategory(filter.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center">
          <SearchX className="h-6 w-6 text-ink-400" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-700">Nenhum sistema encontrado.</p>
          <p className="text-sm text-ink-500">Ajuste a busca ou troque o filtro de categoria.</p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((system) => (
            <li key={system.id} className="flex">
              <SystemCard system={system} isFavorite={favorites.has(system.id)} />
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
