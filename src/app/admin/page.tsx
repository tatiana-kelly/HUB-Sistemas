import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ClipboardList, FolderTree, KeyRound, LayoutGrid, Users } from 'lucide-react'
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
      value: profiles.filter((profile) => profile.active).length,
      total: profiles.length,
      unit: 'ativos',
      Icon: Users,
    },
    {
      href: '/admin/systems',
      label: 'Sistemas',
      value: systems.filter((system) => system.active).length,
      total: systems.length,
      unit: 'ativos',
      Icon: LayoutGrid,
    },
    {
      href: '/admin/categories',
      label: 'Categorias',
      value: categories.filter((category) => category.active).length,
      total: categories.length,
      unit: 'ativas',
      Icon: FolderTree,
    },
    {
      href: '/admin/permissions',
      label: 'Permissões',
      value: permissions.filter((permission) => permission.can_view).length,
      unit: 'liberações',
      Icon: KeyRound,
    },
    {
      href: '/admin/access-logs',
      label: 'Auditoria',
      unit: 'Histórico de acessos',
      Icon: ClipboardList,
    },
  ]

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ href, label, value, total, unit, Icon }) => (
        <li key={href} className="flex">
          <Link
            href={href}
            className="group flex h-full w-full flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-accent hover:shadow-e3"
          >
            <span className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-sunken text-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary-soft-fg">
                <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <ArrowRight
                className="h-4 w-4 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
                strokeWidth={1.75}
              />
            </span>

            <span>
              <span className="block text-[0.8125rem] font-medium text-muted">{label}</span>
              {value === undefined ? (
                <span className="mt-0.5 block text-[0.8125rem] text-subtle">{unit}</span>
              ) : (
                <span className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold tracking-tight text-fg tabular-nums">
                    {value}
                  </span>
                  <span className="text-xs text-subtle">
                    {total === undefined ? unit : `${unit} de ${total}`}
                  </span>
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
