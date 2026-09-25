'use client'

import { ChevronDown, LogOut, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react'
import { Menu, MenuLabel, MenuSeparator, menuItemClass } from '@/components/Menu'
import { useTheme } from '@/components/theme/ThemeProvider'
import { signOut } from '@/app/actions/auth'
import type { ThemePreference } from '@/components/theme/theme'

interface UserMenuProps {
  name: string
  email: string | null
  roleName: string | null
  isAdmin: boolean
}

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Automático', Icon: Monitor },
]

/** Iniciais para o avatar — no máximo duas, do primeiro e do último nome. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function UserMenu({ name, email, roleName, isAdmin }: UserMenuProps) {
  const { preference, setPreference } = useTheme()

  return (
    <Menu
      triggerLabel={`Conta de ${name}`}
      triggerClassName="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-2 pl-1 transition-colors hover:border-line-strong hover:bg-hover"
      trigger={(open) => (
        <>
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-semibold text-primary-soft-fg"
          >
            {initials(name)}
          </span>
          <span className="hidden max-w-32 truncate text-[0.8125rem] font-medium text-fg sm:block">
            {name}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            strokeWidth={2}
            aria-hidden="true"
          />
        </>
      )}
    >
      {(close) => (
        <>
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-fg">{name}</p>
            {email && <p className="truncate text-xs text-muted">{email}</p>}
            {roleName && (
              <span className="mt-1.5 inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-primary-soft-fg">
                {roleName}
              </span>
            )}
          </div>

          {isAdmin && (
            <>
              <MenuSeparator />
              {/* Em telas estreitas o botão de administração vive só aqui. */}
              <span className="block lg:hidden">
                <a href="/admin" data-menu-item className={menuItemClass} role="menuitem">
                  <ShieldCheck className="h-4 w-4 text-subtle" strokeWidth={1.75} aria-hidden="true" />
                  Administração
                </a>
              </span>
            </>
          )}

          <MenuSeparator />
          <MenuLabel>Tema</MenuLabel>
          <div role="group" aria-label="Tema da interface" className="flex gap-1 px-1 pb-1">
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const isActive = preference === value
              return (
                <button
                  key={value}
                  type="button"
                  data-menu-item
                  aria-pressed={isActive}
                  onClick={() => setPreference(value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-sm)] border px-1 py-2 text-[0.6875rem] font-medium transition-colors ${
                    isActive
                      ? 'border-line-accent bg-primary-soft text-primary-soft-fg'
                      : 'border-transparent text-muted hover:bg-hover hover:text-fg'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </button>
              )
            })}
          </div>

          <MenuSeparator />
          <form action={signOut} onSubmit={close}>
            <button type="submit" data-menu-item role="menuitem" className={`${menuItemClass} w-full`}>
              <LogOut className="h-4 w-4 text-subtle" strokeWidth={1.75} aria-hidden="true" />
              Sair
            </button>
          </form>
        </>
      )}
    </Menu>
  )
}
