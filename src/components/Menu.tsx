'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface MenuProps {
  /** Conteúdo do gatilho. Recebe o estado aberto para animar o chevron. */
  trigger: (open: boolean) => React.ReactNode
  triggerLabel: string
  triggerClassName?: string
  children: (close: () => void) => React.ReactNode
  align?: 'start' | 'end'
  className?: string
}

/**
 * Menu suspenso acessível usado pelo cabeçalho.
 *
 * Fecha com Esc, com clique fora e ao mover o foco para fora; devolve o foco ao
 * gatilho quando fechado pelo teclado. As setas navegam entre os itens.
 */
export function Menu({
  trigger,
  triggerLabel,
  triggerClassName,
  children,
  align = 'end',
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()

    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [],
    )
    if (items.length === 0) return

    const index = items.indexOf(document.activeElement as HTMLElement)
    const next =
      event.key === 'ArrowDown'
        ? items[(index + 1 + items.length) % items.length]
        : items[(index - 1 + items.length) % items.length]

    next?.focus()
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={onMenuKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger(open)}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={triggerLabel}
          className={`absolute top-[calc(100%+0.5rem)] z-50 min-w-56 origin-top rounded-[var(--radius-lg)] border border-line bg-surface p-1.5 shadow-pop ${
            align === 'end' ? 'right-0' : 'left-0'
          } ${className ?? ''}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pt-1.5 pb-1 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
      {children}
    </p>
  )
}

export function MenuSeparator() {
  return <div role="none" className="my-1.5 h-px bg-line" />
}

export const menuItemClass =
  'flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm font-medium text-fg transition-colors hover:bg-hover focus-visible:bg-hover'
