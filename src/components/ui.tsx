/**
 * Design system do SAL HUB.
 *
 * Todo estilo compartilhado mora aqui: as telas compõem estes blocos em vez de
 * repetir classes. Os componentes só usam tokens semânticos (surface, line, fg,
 * muted…), então light e dark saem do mesmo código.
 */

// ─── Botões ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-e1 hover:bg-primary-hover active:translate-y-px dark:text-on-inverse',
  secondary:
    'border border-line bg-surface text-fg hover:border-line-strong hover:bg-hover active:translate-y-px',
  ghost: 'text-muted hover:bg-hover hover:text-fg',
  danger: 'border border-line bg-surface text-danger hover:border-danger hover:bg-danger-soft',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[0.8125rem]',
  md: 'h-9.5 px-3.5 text-sm',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`
}

// ─── Campos ──────────────────────────────────────────────────────────────────

export const inputClass =
  'w-full rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors placeholder:text-subtle hover:border-line-strong focus:border-line-accent focus:outline-none'

export const selectClass = `${inputClass} cursor-pointer pr-8`

export const checkboxClass =
  'h-4 w-4 shrink-0 cursor-pointer rounded-[var(--radius-xs)] border-line-strong text-primary accent-[var(--primary)]'

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-medium text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  )
}

// ─── Superfícies ─────────────────────────────────────────────────────────────

export const cardClass =
  'rounded-[var(--radius-lg)] border border-line bg-surface shadow-e1'

export function Panel({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className={cardClass}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold tracking-tight text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-[0.8125rem] text-muted">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  )
}

export function SectionHeading({
  icon,
  children,
  aside,
  id,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  aside?: React.ReactNode
  id?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2 text-sm font-semibold tracking-tight text-fg">
        {icon}
        {children}
      </h2>
      {aside}
    </div>
  )
}

// ─── Indicadores ─────────────────────────────────────────────────────────────

type BadgeTone = 'neutral' | 'success' | 'muted' | 'brand' | 'accent'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-muted',
  muted: 'bg-sunken text-subtle',
  success: 'bg-success-soft text-success',
  brand: 'bg-primary-soft text-primary-soft-fg',
  accent: 'bg-accent-soft text-accent',
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: BadgeTone
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  )
}

/** Status com forma própria, para não depender só da cor. */
export function StatusDot({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-line-strong'}`}
      />
      {label ?? (active ? 'Ativo' : 'Inativo')}
    </span>
  )
}

// ─── Tabelas ─────────────────────────────────────────────────────────────────

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
      <table className="w-full min-w-[42rem] text-left text-sm">{children}</table>
    </div>
  )
}

export const thClass =
  'border-b border-line pb-2 pr-4 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase'

export const tdClass = 'border-b border-line py-2.5 pr-4 align-middle text-fg'

// ─── Estados ─────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[var(--radius-lg)] border border-dashed border-line px-5 py-7 text-center">
      {icon && <span className="mb-1 text-subtle">{icon}</span>}
      <p className="text-sm font-medium text-fg">{title}</p>
      {children && <p className="max-w-sm text-[0.8125rem] text-muted">{children}</p>}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`hub-skeleton block ${className}`} />
}
