import { Logo } from '@/components/Logo'
import { ThemeMenu } from '@/components/theme/ThemeMenu'
import { cardClass } from '@/components/ui'

/** Moldura comum das telas de autenticação: login, recuperação e nova senha. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="hub-ambient flex min-h-dvh flex-col">
      <div className="flex justify-end p-4">
        <ThemeMenu />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <Logo size="lg" withSubtitle />
          </div>

          <div className={`mt-7 p-6 sm:p-7 ${cardClass}`}>
            <h1 className="text-lg font-semibold tracking-tight text-fg">{title}</h1>
            <p className="mt-1 mb-5 text-[0.8125rem] text-muted">{description}</p>
            {children}
          </div>

          {footer}
        </div>
      </main>
    </div>
  )
}
