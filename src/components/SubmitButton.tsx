'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
  pendingLabel?: string
}

/** Botão de submit com estado de carregamento derivado do próprio form. */
export function SubmitButton({
  children,
  className = 'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60',
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? (pendingLabel ?? 'Aguarde…') : children}
    </button>
  )
}
