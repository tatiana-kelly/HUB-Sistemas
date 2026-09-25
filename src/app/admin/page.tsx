import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, FolderTree, KeyRound, LayoutGrid, Users } from 'lucide-react'
import { getAllSystems, getCategories, getProfiles, getRolePermissions } from '@/lib/queries'

export const metadata: Metadata = { title: 'Administração — SAL HUB' }

export default async function AdminHomePage() {
  const [profiles, systems, categories, permissions] = await Promise.all([
    getProfiles(),
    getAllSystems(),
    getCategories(false),
    getRolePermissions(),
  ])

  const cards = [
    {
      href: '/admin/users',
      label: 'Usuários',
      value: `${profiles.filter((profile) => profile.active).length} ativos de ${profiles.length}`,
      Icon: Users,
    },
    {
      href: '/admin/systems',
      label: 'Sistemas',
      value: `${systems.filter((system) => system.active).length} ativos de ${systems.length}`,
      Icon: LayoutGrid,
    },
    {
      href: '/admin/categories',
      label: 'Categorias',
      value: `${categories.filter((category) => category.active).length} ativas de ${categories.length}`,
      Icon: FolderTree,
    },
    {
      href: '/admin/permissions',
      label: 'Permissões',
      value: `${permissions.filter((permission) => permission.can_view).length} liberações`,
      Icon: KeyRound,
    },
    {
      href: '/admin/access-logs',
      label: 'Auditoria',
      value: 'Histórico de acessos',
      Icon: ClipboardList,
    },
  ]

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ href, label, value, Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{label}</span>
              <span className="mt-0.5 block text-sm text-ink-500">{value}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
