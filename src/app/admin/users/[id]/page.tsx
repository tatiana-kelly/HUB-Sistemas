import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getProfileById, getSystemsForRole } from '@/lib/queries'
import { Badge, EmptyState, Panel } from '@/components/ui'

export const metadata: Metadata = { title: 'Usuário — Administração SAL HUB' }

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const profile = await getProfileById(id)
  if (!profile) notFound()

  const systems = profile.role_id ? await getSystemsForRole(profile.role_id) : []

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
        Todos os usuários
      </Link>

      <Panel title={profile.name ?? 'Usuário sem nome'} description={profile.email ?? undefined}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Perfil</dt>
            <dd className="mt-1">
              <Badge tone="brand">{profile.role_name ?? 'Sem perfil'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Status</dt>
            <dd className="mt-1">
              {profile.active ? <Badge tone="success">Ativo</Badge> : <Badge tone="muted">Inativo</Badge>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
              Cadastrado em
            </dt>
            <dd className="mt-1 text-sm text-ink-700">
              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Sistemas permitidos"
        description="Determinados pelas permissões do perfil deste usuário."
      >
        {systems.length === 0 ? (
          <EmptyState>
            Nenhum sistema liberado para este perfil.{' '}
            <Link href="/admin/permissions" className="font-medium text-brand-700 hover:underline">
              Ajustar permissões
            </Link>
            .
          </EmptyState>
        ) : (
          <>
            <ul className="space-y-2">
              {systems.map((system) => (
                <li key={system.id} className="flex items-center gap-2 text-sm text-ink-800">
                  <Check
                    className="h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                    strokeWidth={2.25}
                  />
                  {system.name}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium text-ink-600">
              {systems.length} {systems.length === 1 ? 'sistema disponível' : 'sistemas disponíveis'}
            </p>
          </>
        )}
      </Panel>
    </div>
  )
}
