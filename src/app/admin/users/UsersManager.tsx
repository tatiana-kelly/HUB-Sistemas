'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { Alert } from '@/components/Alert'
import { SubmitButton } from '@/components/SubmitButton'
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
    <div className="space-y-6">
      <Panel
        title="Novo usuário"
        description="O usuário recebe um convite por e-mail e define a própria senha. Nenhuma senha é criada aqui."
      >
        {!serviceRoleAvailable && (
          <div className="mb-4">
            <Alert tone="info">
              Para convidar usuários pelo portal, configure a variável de servidor
              <code className="mx-1 rounded bg-white px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>
              . Sem ela, os usuários precisam ser criados no painel do Supabase.
            </Alert>
          </div>
        )}

        <form action={createAction} className="space-y-4">
          {createState.error && <Alert tone="error">{createState.error}</Alert>}
          {createState.success && <Alert tone="success">{createState.success}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

          <div className="sm:w-56">
            <SubmitButton pendingLabel="Convidando…">
              <UserPlus className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              Convidar usuário
            </SubmitButton>
          </div>
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
          <EmptyState>Nenhum usuário cadastrado ainda.</EmptyState>
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
                      className="font-medium text-brand-700 underline-offset-2 hover:underline"
                    >
                      {profile.name ?? '—'}
                    </Link>
                    {profile.id === currentUserId && (
                      <span className="ml-2 text-xs text-ink-400">(você)</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-ink-600`}>{profile.email ?? '—'}</td>
                  <td className={tdClass}>
                    <form action={roleAction} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={profile.id} />
                      <label className="sr-only" htmlFor={`role-${profile.id}`}>
                        Perfil de {profile.name ?? profile.email}
                      </label>
                      <select
                        id={`role-${profile.id}`}
                        name="role_id"
                        defaultValue={profile.role_id ?? ''}
                        className={`${selectClass} w-40 py-1.5`}
                      >
                        <option value="">Sem perfil</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                      >
                        Salvar
                      </button>
                    </form>
                  </td>
                  <td className={tdClass}>
                    {profile.active ? (
                      <Badge tone="success">Ativo</Badge>
                    ) : (
                      <Badge tone="muted">Inativo</Badge>
                    )}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <form action={activeAction} className="inline">
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="active" value={String(profile.active)} />
                      <button
                        type="submit"
                        disabled={profile.id === currentUserId}
                        className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
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
