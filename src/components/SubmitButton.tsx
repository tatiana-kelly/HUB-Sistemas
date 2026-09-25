'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { buttonClass } from '@/components/ui'

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
  pendingLabel?: string
  full?: boolean
}

/** Botão de submit com estado de carregamento derivado do próprio form. */
export function SubmitButton({ children, className, pendingLabel, full = true }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? `${buttonClass('primary')} ${full ? 'w-full' : ''}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? (pendingLabel ?? 'Aguarde…') : children}
    </button>
  )
}
