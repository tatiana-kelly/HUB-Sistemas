'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
import {
  EmptyState,
  Field,
  Panel,
  StatusDot,
  TableWrapper,
  buttonClass,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui'
import { createUser, toggleUserActive, updateUserRole } from '@/app/actions/admin'
import type { ActionState } from '@/app/actions/auth'
import type { ProfileWithRole, Role } from '@/lib/types'

interface UsersManagerProps {
  profiles: ProfileWithRole[]
  roles: Role[]
  currentUserId: string
  serviceRoleAvailable: boolean
}

export function UsersManager({
  profiles,
  roles,
  currentUserId,
  serviceRoleAvailable,
}: UsersManagerProps) {
  const [createState, createAction] = useActionState<ActionState, FormData>(createUser, {})
  const [roleState, roleAction] = useActionState<ActionState, FormData>(updateUserRole, {})
  const [activeState, activeAction] = useActionState<ActionState, FormData>(toggleUserActive, {})

  const feedback = [roleState, activeState].find((state) => state.error || state.success)

  return (
    <div className="space-y-4">
      <Panel
        title="Novo usuário"
        description="O usuário recebe um convite por e-mail e define a própria senha."
      >
        {!serviceRoleAvailable && (
          <div className="mb-4">
            <Alert tone="info">
              Para convidar usuários pelo portal, configure a variável de servidor
              <code className="mx-1 rounded bg-surface px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>
              . Sem ela, os usuários precisam ser criados no painel do Supabase.
            </Alert>
          </div>
        )}

        <form action={createAction} className="space-y-3.5">
          {createState.error && <Alert tone="error">{createState.error}</Alert>}
          {createState.success && <Alert tone="success">{createState.success}</Alert>}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Field label="Nome" htmlFor="new-user-name">
              <input id="new-user-name" name="name" required className={inputClass} />
            </Field>

            <Field label="E-mail" htmlFor="new-user-email">
              <input
                id="new-user-email"
                name="email"
                type="email"
                required
                placeholder="nome@salexpress.com.br"
                className={inputClass}
              />
            </Field>

            <Field label="Perfil" htmlFor="new-user-role">
              <select id="new-user-role" name="role_id" required className={selectClass}>
                <option value="">Selecione…</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <SubmitButton full={false} pendingLabel="Convidando…">
            <UserPlus className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            Convidar usuário
          </SubmitButton>
        </form>
      </Panel>

      <Panel title="Usuários" description={`${profiles.length} cadastrados`}>
        {feedback && (
          <div className="mb-4">
            <Alert tone={feedback.error ? 'error' : 'success'}>
              {feedback.error ?? feedback.success}
            </Alert>
          </div>
        )}

        {profiles.length === 0 ? (
          <EmptyState title="Nenhum usuário cadastrado ainda." />
        ) : (
          <TableWrapper>
            <thead>
              <tr>
                <th className={thClass}>Nome</th>
                <th className={thClass}>E-mail</th>
                <th className={thClass}>Perfil</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className={tdClass}>
                    <Link
                      href={`/admin/users/${profile.id}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {profile.name ?? '—'}
                    </Link>
                    {profile.id === currentUserId && (
                      <span className="ml-2 text-xs text-subtle">(você)</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-muted`}>{profile.email ?? '—'}</td>
                  <td className={tdClass}>
                    <form action={roleAction} className="flex items-center gap-1.5">
                      <input type="hidden" name="user_id" value={profile.id} />
                      <label className="sr-only" htmlFor={`role-${profile.id}`}>
                        Perfil de {profile.name ?? profile.email}
                      </label>
                      <select
                        id={`role-${profile.id}`}
                        name="role_id"
                        defaultValue={profile.role_id ?? ''}
                        className={`${selectClass} h-8 w-36 py-0`}
                      >
                        <option value="">Sem perfil</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={buttonClass('secondary', 'sm')}>
                        Salvar
                      </button>
                    </form>
                  </td>
                  <td className={tdClass}>
                    <StatusDot active={profile.active} />
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <form action={activeAction} className="inline">
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="active" value={String(profile.active)} />
                      <button
                        type="submit"
                        disabled={profile.id === currentUserId}
                        className={buttonClass('secondary', 'sm')}
                      >
                        {profile.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        )}
      </Panel>
    </div>
  )
}
