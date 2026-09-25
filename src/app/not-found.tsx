import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { buttonClass } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="hub-ambient flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size="lg" withSubtitle />

      <span className="grid h-11 w-11 place-items-center rounded-full bg-sunken text-subtle">
        <Compass className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
      </span>

      <div>
        <h1 className="text-lg font-semibold tracking-tight text-fg">Página não encontrada</h1>
        <p className="mt-1 text-[0.8125rem] text-muted">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>

      <Link href="/home" className={buttonClass('primary')}>
        Voltar ao portal
      </Link>
    </main>
  )
}
