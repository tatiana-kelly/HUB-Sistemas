'use client'

import { useActionState, useState } from 'react'
import { Pencil, Plus, X } from 'lucide-react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { ICON_OPTIONS, SystemIcon } from '@/components/SystemIcon'
import {
  Badge,
  EmptyState,
  Field,
  Panel,
  TableWrapper,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui'
import { saveCategory, toggleCategoryActive } from '@/app/actions/admin'
import type { ActionState } from '@/app/actions/auth'
import type { Category } from '@/lib/types'

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [saveState, saveAction] = useActionState<ActionState, FormData>(saveCategory, {})
  const [toggleState, toggleAction] = useActionState<ActionState, FormData>(
    toggleCategoryActive,
    {},
  )

  const feedback = [saveState, toggleState].find((state) => state.error || state.success)
  const formOpen = isCreating || editing !== null
  const current = editing

  function closeForm() {
    setEditing(null)
    setIsCreating(false)
  }

  return (
    <Panel
      title="Categorias"
      description="Organizam os sistemas na home e alimentam os filtros do portal."
      actions={
        formOpen ? (
          <button
            type="button"
            onClick={closeForm}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <X className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            Fechar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
            Nova categoria
          </button>
        )
      }
    >
      {feedback && (
        <div className="mb-4">
          <Alert tone={feedback.error ? 'error' : 'success'}>
            {feedback.error ?? feedback.success}
          </Alert>
        </div>
      )}

      {formOpen && (
        <form
          action={saveAction}
          key={current?.id ?? 'nova'}
          className="mb-6 space-y-4 rounded-lg border border-ink-200 bg-ink-50/60 p-4"
        >
          {current && <input type="hidden" name="id" value={current.id} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="category-name">
              <input
                id="category-name"
                name="name"
                required
                defaultValue={current?.name ?? ''}
                className={inputClass}
              />
            </Field>

            <Field label="Descrição" htmlFor="category-description">
              <input
                id="category-description"
                name="description"
                defaultValue={current?.description ?? ''}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ícone" htmlFor="category-icon">
              <select
                id="category-icon"
                name="icon"
                defaultValue={current?.icon ?? ''}
                className={selectClass}
              >
                <option value="">Padrão</option>
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ordem" htmlFor="category-order">
              <input
                id="category-order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={current?.display_order ?? categories.length + 1}
                className={inputClass}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="active"
              defaultChecked={current?.active ?? true}
              className="h-4 w-4 rounded border-ink-300 text-brand-700 focus:ring-brand-300"
            />
            Ativa
          </label>

          <div className="sm:w-48">
            <SubmitButton pendingLabel="Salvando…">
              {current ? 'Salvar alterações' : 'Criar categoria'}
            </SubmitButton>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <EmptyState>Nenhuma categoria cadastrada.</EmptyState>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th className={thClass}>Categoria</th>
              <th className={thClass}>Descrição</th>
              <th className={thClass}>Ordem</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className={tdClass}>
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <SystemIcon icon={category.icon} className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </span>
                </td>
                <td className={`${tdClass} text-ink-600`}>{category.description ?? '—'}</td>
                <td className={`${tdClass} tabular-nums`}>{category.display_order}</td>
                <td className={tdClass}>
                  {category.active ? (
                    <Badge tone="success">Ativa</Badge>
                  ) : (
                    <Badge tone="muted">Inativa</Badge>
                  )}
                </td>
                <td className={`${tdClass} text-right whitespace-nowrap`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setEditing(category)
                    }}
                    className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Editar
                  </button>

                  <form action={toggleAction} className="ml-1.5 inline">
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="active" value={String(category.active)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                    >
                      {category.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}
    </Panel>
  )
}
