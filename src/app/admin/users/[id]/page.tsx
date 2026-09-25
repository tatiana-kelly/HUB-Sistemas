import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getProfileById, getSystemsForRole } from '@/lib/queries'
import { Badge, EmptyState, Panel, StatusDot } from '@/components/ui'

export const metadata: Metadata = { title: 'Usuário — Administração SAL HUB' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const profile = await getProfileById(id)
  if (!profile) notFound()

  const systems = profile.role_id ? await getSystemsForRole(profile.role_id) : []

  return (
    <div className="space-y-4">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
        Todos os usuários
      </Link>

      <Panel title={profile.name ?? 'Usuário sem nome'} description={profile.email ?? undefined}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
              Perfil
            </dt>
            <dd className="mt-1.5">
              <Badge tone="brand">{profile.role_name ?? 'Sem perfil'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
              Status
            </dt>
            <dd className="mt-1.5">
              <StatusDot active={profile.active} />
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
              Cadastrado em
            </dt>
            <dd className="mt-1.5 text-[0.8125rem] text-fg tabular-nums">
              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Sistemas permitidos"
        description="Determinados pelas permissões do perfil deste usuário."
        actions={
          systems.length > 0 ? (
            <Badge tone="neutral">
              {systems.length} {systems.length === 1 ? 'disponível' : 'disponíveis'}
            </Badge>
          ) : undefined
        }
      >
        {systems.length === 0 ? (
          <EmptyState title="Nenhum sistema liberado para este perfil.">
            <Link href="/admin/permissions" className="font-medium text-primary hover:underline">
              Ajustar permissões
            </Link>
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {systems.map((system) => (
              <li
                key={system.id}
                className="flex items-center gap-2 border-b border-line py-2 text-[0.8125rem] text-fg"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" strokeWidth={2.5} />
                {system.name}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
