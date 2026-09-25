'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { Badge, EmptyState, Panel } from '@/components/ui'
import { saveRolePermissions } from '@/app/actions/admin'
import type { ActionState } from '@/app/actions/auth'
import type { Role, RoleSystemPermission, SystemWithCategory } from '@/lib/types'

interface PermissionsManagerProps {
  roles: Role[]
  systems: SystemWithCategory[]
  permissions: RoleSystemPermission[]
}

/**
 * Matriz visual de permissões. Marcar/desmarcar altera role_system_permissions —
 * é aqui que se define quantos e quais sistemas cada perfil enxerga, sem código.
 */
export function PermissionsManager({ roles, systems, permissions }: PermissionsManagerProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveRolePermissions, {})

  const granted = new Set(
    permissions.filter((permission) => permission.can_view).map((p) => `${p.role_id}:${p.system_id}`),
  )

  if (systems.length === 0) {
    return (
      <Panel title="Permissões por perfil">
        <EmptyState>Cadastre sistemas antes de definir permissões.</EmptyState>
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      {roles.map((role) => {
        const roleSystems = systems.filter((system) =>
          granted.has(`${role.id}:${system.id}`),
        ).length

        return (
          <Panel
            key={role.id}
            title={role.name}
            description={role.description ?? undefined}
            actions={
              <Badge tone="brand">
                {roleSystems} de {systems.length} liberados
              </Badge>
            }
          >
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="role_id" value={role.id} />

              <fieldset>
                <legend className="sr-only">Sistemas liberados para {role.name}</legend>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {systems.map((system) => {
                    const inputId = `perm-${role.id}-${system.id}`
                    return (
                      <li key={system.id}>
                        <label
                          htmlFor={inputId}
                          className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-ink-200 px-3 py-2.5 text-sm transition-colors hover:border-brand-300 has-checked:border-brand-400 has-checked:bg-brand-50"
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            name="system_ids"
                            value={system.id}
                            defaultChecked={granted.has(`${role.id}:${system.id}`)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-700 focus:ring-brand-300"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-ink-800">{system.name}</span>
                            <span className="block text-xs text-ink-500">
                              {system.category_name ?? 'Sem categoria'}
                              {!system.active && ' · inativo'}
                            </span>
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>

              <div className="sm:w-56">
                <SubmitButton pendingLabel="Salvando…">Salvar permissões de {role.name}</SubmitButton>
              </div>
            </form>
          </Panel>
        )
      })}
    </div>
  )
}
