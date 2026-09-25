import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type AlertTone = 'error' | 'success' | 'info'

const TONES: Record<AlertTone, { wrapper: string; icon: string; Icon: typeof Info }> = {
  error: { wrapper: 'bg-danger-soft text-danger', icon: 'text-danger', Icon: AlertCircle },
  success: { wrapper: 'bg-success-soft text-success', icon: 'text-success', Icon: CheckCircle2 },
  info: { wrapper: 'bg-primary-soft text-primary-soft-fg', icon: 'text-primary', Icon: Info },
}

export function Alert({ tone = 'info', children }: { tone?: AlertTone; children: React.ReactNode }) {
  const { wrapper, icon, Icon } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.8125rem] font-medium ${wrapper}`}
    >
      <Icon className={`mt-px h-4 w-4 shrink-0 ${icon}`} aria-hidden="true" strokeWidth={2} />
      <span className="min-w-0">{children}</span>
    </div>
  )
}
