/** Blocos visuais compartilhados pela administração. */

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
    <section className="rounded-[var(--radius-card)] border border-ink-200 bg-white shadow-[var(--shadow-card)]">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

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
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none'

export const selectClass = `${inputClass} pr-8`

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'muted' | 'brand'
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    muted: 'bg-ink-100 text-ink-500',
    brand: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
  } as const

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[42rem] text-left text-sm">{children}</table>
    </div>
  )
}

export const thClass =
  'border-b border-ink-200 pb-2 pr-4 text-xs font-semibold tracking-wide text-ink-500 uppercase'
export const tdClass = 'border-b border-ink-100 py-3 pr-4 align-middle text-ink-800'

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-500">
      {children}
    </p>
  )
}
