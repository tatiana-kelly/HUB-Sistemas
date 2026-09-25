'use client'

import { useActionState } from 'react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import { SystemIcon } from '@/components/SystemIcon'
import { Badge, EmptyState, Panel, checkboxClass } from '@/components/ui'
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
    permissions
      .filter((permission) => permission.can_view)
      .map((permission) => `${permission.role_id}:${permission.system_id}`),
  )

  if (systems.length === 0) {
    return (
      <Panel title="Permissões por perfil">
        <EmptyState title="Cadastre sistemas antes de definir permissões." />
      </Panel>
    )
  }

  return (
    <div className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      {roles.map((role) => {
        const roleSystems = systems.filter((system) => granted.has(`${role.id}:${system.id}`)).length

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
            <form action={formAction} className="space-y-3.5">
              <input type="hidden" name="role_id" value={role.id} />

              <fieldset>
                <legend className="sr-only">Sistemas liberados para {role.name}</legend>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {systems.map((system) => {
                    const inputId = `perm-${role.id}-${system.id}`
                    return (
                      <li key={system.id}>
                        <label
                          htmlFor={inputId}
                          className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-line px-2.5 py-2 text-sm transition-colors hover:border-line-strong hover:bg-hover has-checked:border-line-accent has-checked:bg-primary-soft"
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            name="system_ids"
                            value={system.id}
                            defaultChecked={granted.has(`${role.id}:${system.id}`)}
                            className={checkboxClass}
                          />
                          <SystemIcon icon={system.icon} className="h-4 w-4 shrink-0 text-subtle" />
                          <span className="min-w-0">
                            <span className="block truncate text-[0.8125rem] font-medium text-fg">
                              {system.name}
                            </span>
                            <span className="block truncate text-[0.6875rem] text-subtle">
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

              <SubmitButton full={false} pendingLabel="Salvando…">
                Salvar permissões de {role.name}
              </SubmitButton>
            </form>
          </Panel>
        )
      })}
    </div>
  )
}
