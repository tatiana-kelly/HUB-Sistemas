'use client'

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { Menu, MenuLabel, menuItemClass } from '@/components/Menu'
import { useTheme } from '@/components/theme/ThemeProvider'
import type { ThemePreference } from '@/components/theme/theme'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Automático', Icon: Monitor },
]

/** Seletor de tema do cabeçalho: claro, escuro ou seguir o sistema. */
export function ThemeMenu() {
  const { preference, resolved, setPreference } = useTheme()
  const TriggerIcon = resolved === 'dark' ? Moon : Sun

  return (
    <Menu
      triggerLabel="Tema da interface"
      triggerClassName="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] text-muted transition-colors hover:bg-hover hover:text-fg"
      trigger={() => <TriggerIcon className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />}
    >
      {(close) => (
        <>
          <MenuLabel>Tema</MenuLabel>
          {OPTIONS.map(({ value, label, Icon }) => {
            const isActive = preference === value
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                data-menu-item
                onClick={() => {
                  setPreference(value)
                  close()
                }}
                className={menuItemClass}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-subtle'}`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {label}
                {isActive && (
                  <Check
                    className="ml-auto h-4 w-4 text-primary"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </>
      )}
    </Menu>
  )
}
