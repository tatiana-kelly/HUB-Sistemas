'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, FolderTree, KeyRound, LayoutGrid, Users } from 'lucide-react'

const LINKS = [
  { href: '/admin/users', label: 'Usuários', Icon: Users },
  { href: '/admin/systems', label: 'Sistemas', Icon: LayoutGrid },
  { href: '/admin/categories', label: 'Categorias', Icon: FolderTree },
  { href: '/admin/permissions', label: 'Permissões', Icon: KeyRound },
  { href: '/admin/access-logs', label: 'Auditoria', Icon: ClipboardList },
]

/** Navegação da administração como segmented control, não como abas pesadas. */
export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Seções da administração" className="mt-4">
      <ul className="hub-scroll-x flex gap-1 rounded-[var(--radius-lg)] border border-line bg-surface p-1">
        {LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-soft text-primary-soft-fg'
                    : 'text-muted hover:bg-hover hover:text-fg'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? '' : 'text-subtle'}`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
