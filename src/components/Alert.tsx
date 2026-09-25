import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type AlertTone = 'error' | 'success' | 'info'

const TONES: Record<AlertTone, { wrapper: string; Icon: typeof Info }> = {
  error: { wrapper: 'border-red-200 bg-red-50 text-red-800', Icon: AlertCircle },
  success: { wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  info: { wrapper: 'border-brand-200 bg-brand-50 text-brand-800', Icon: Info },
}

interface AlertProps {
  tone?: AlertTone
  children: React.ReactNode
}

export function Alert({ tone = 'info', children }: AlertProps) {
  const { wrapper, Icon } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${wrapper}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2} />
      <span>{children}</span>
    </div>
  )
}
