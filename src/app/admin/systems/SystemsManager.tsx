'use client'

import { useActionState, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { SystemIcon, ICON_OPTIONS } from '@/components/SystemIcon'
import {
  Badge,
  EmptyState,
  Field,
  Panel,
  StatusDot,
  TableWrapper,
  buttonClass,
  checkboxClass,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui'
import { deleteSystem, moveSystem, saveSystem, toggleSystemActive } from '@/app/actions/admin'
import type { ActionState } from '@/app/actions/auth'
import type { Category, SystemWithCategory } from '@/lib/types'

interface SystemsManagerProps {
  systems: SystemWithCategory[]
  categories: Category[]
}

export function SystemsManager({ systems, categories }: SystemsManagerProps) {
  const [editing, setEditing] = useState<SystemWithCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [saveState, saveAction] = useActionState<ActionState, FormData>(saveSystem, {})
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(deleteSystem, {})
  const [toggleState, toggleAction] = useActionState<ActionState, FormData>(toggleSystemActive, {})
  const [moveState, moveAction] = useActionState<ActionState, FormData>(moveSystem, {})

  const feedback = [saveState, deleteState, toggleState, moveState].find(
    (state) => state.error || state.success,
  )

  const formOpen = isCreating || editing !== null
  const current = editing

  function closeForm() {
    setEditing(null)
    setIsCreating(false)
  }

  return (
    <Panel
      title="Sistemas e indicadores"
      description="Cadastre novos acessos sem precisar de alteração de código."
      actions={
        formOpen ? (
          <button type="button" onClick={closeForm} className={buttonClass('secondary', 'sm')}>
            <X className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            Fechar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className={buttonClass('primary', 'sm')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
            Novo sistema
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
          key={current?.id ?? 'novo'}
          className="mb-5 space-y-3.5 rounded-[var(--radius-lg)] border border-line bg-sunken p-4"
        >
          {current && <input type="hidden" name="id" value={current.id} />}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Nome" htmlFor="system-name">
              <input
                id="system-name"
                name="name"
                required
                defaultValue={current?.name ?? ''}
                className={inputClass}
              />
            </Field>

            <Field label="URL" htmlFor="system-url" hint="Endereço completo, com https://">
              <input
                id="system-url"
                name="url"
                type="url"
                required
                defaultValue={current?.url ?? ''}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Descrição" htmlFor="system-description">
            <input
              id="system-description"
              name="description"
              defaultValue={current?.description ?? ''}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <Field label="Categoria" htmlFor="system-category">
              <select
                id="system-category"
                name="category_id"
                defaultValue={current?.category_id ?? ''}
                className={selectClass}
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo" htmlFor="system-type">
              <select
                id="system-type"
                name="type"
                defaultValue={current?.type ?? 'system'}
                className={selectClass}
              >
                <option value="system">Sistema</option>
                <option value="indicator">Indicador</option>
              </select>
            </Field>

            <Field label="Ícone" htmlFor="system-icon">
              <select
                id="system-icon"
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

            <Field label="Ordem" htmlFor="system-order">
              <input
                id="system-order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={current?.display_order ?? systems.length + 1}
                className={inputClass}
              />
            </Field>
          </div>

          <label className="flex w-fit items-center gap-2 text-[0.8125rem] font-medium text-muted">
            <input
              type="checkbox"
              name="active"
              defaultChecked={current?.active ?? true}
              className={checkboxClass}
            />
            Ativo
          </label>

          <SubmitButton full={false} pendingLabel="Salvando…">
            {current ? 'Salvar alterações' : 'Criar sistema'}
          </SubmitButton>
        </form>
      )}

      {systems.length === 0 ? (
        <EmptyState title="Nenhum sistema cadastrado.">
          Use o botão “Novo sistema” para adicionar o primeiro acesso.
        </EmptyState>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th className={thClass}>Sistema</th>
              <th className={thClass}>Categoria</th>
              <th className={thClass}>Tipo</th>
              <th className={thClass}>Ordem</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system.id}>
                <td className={tdClass}>
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-sunken text-muted">
                      <SystemIcon icon={system.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{system.name}</span>
                      <span className="block max-w-[18rem] truncate text-xs text-subtle">
                        {system.url}
                      </span>
                    </span>
                  </span>
                </td>
                <td className={`${tdClass} text-muted`}>{system.category_name ?? '—'}</td>
                <td className={tdClass}>
                  <Badge tone={system.type === 'indicator' ? 'accent' : 'neutral'}>
                    {system.type === 'indicator' ? 'Indicador' : 'Sistema'}
                  </Badge>
                </td>
                <td className={tdClass}>
                  <span className="flex items-center gap-0.5">
                    <span className="w-5 text-center tabular-nums">{system.display_order}</span>
                    <form action={moveAction} className="inline">
                      <input type="hidden" name="id" value={system.id} />
                      <input type="hidden" name="display_order" value={system.display_order} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        aria-label={`Subir ${system.name}`}
                        className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-subtle transition-colors hover:bg-hover hover:text-fg"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
                      </button>
                    </form>
                    <form action={moveAction} className="inline">
                      <input type="hidden" name="id" value={system.id} />
                      <input type="hidden" name="display_order" value={system.display_order} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        aria-label={`Descer ${system.name}`}
                        className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-subtle transition-colors hover:bg-hover hover:text-fg"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
                      </button>
                    </form>
                  </span>
                </td>
                <td className={tdClass}>
                  <StatusDot active={system.active} />
                </td>
                <td className={`${tdClass} text-right whitespace-nowrap`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setEditing(system)
                    }}
                    className={buttonClass('secondary', 'sm')}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                    Editar
                  </button>

                  <form action={toggleAction} className="ml-1.5 inline">
                    <input type="hidden" name="id" value={system.id} />
                    <input type="hidden" name="active" value={String(system.active)} />
                    <button type="submit" className={buttonClass('secondary', 'sm')}>
                      {system.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </form>

                  <form
                    action={deleteAction}
                    className="ml-1.5 inline"
                    onSubmit={(event) => {
                      if (
                        !window.confirm(
                          `Excluir "${system.name}"? O histórico de acessos e os favoritos deste sistema também serão removidos.`,
                        )
                      ) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={system.id} />
                    <button
                      type="submit"
                      aria-label={`Excluir ${system.name}`}
                      className={buttonClass('danger', 'sm')}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
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
