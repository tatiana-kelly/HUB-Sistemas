'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/users', label: 'Usuários' },
  { href: '/admin/systems', label: 'Sistemas' },
  { href: '/admin/categories', label: 'Categorias' },
  { href: '/admin/permissions', label: 'Permissões' },
  { href: '/admin/access-logs', label: 'Auditoria' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Seções da administração" className="mt-6 border-b border-ink-200">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-block border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-brand-700 text-brand-700'
                    : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800'
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
