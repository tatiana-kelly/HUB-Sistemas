import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function NotFound() {
  return (
    <main className="hub-backdrop flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="lg" withSubtitle />
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Página não encontrada</h1>
        <p className="mt-1 text-sm text-ink-500">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>
      <Link
        href="/home"
        className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
      >
        Voltar ao portal
      </Link>
    </main>
  )
}
