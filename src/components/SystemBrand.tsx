'use client'

import { useState } from 'react'
import { brandHue, brandInitials, brandSources } from '@/lib/brand'

interface SystemBrandProps {
  name: string
  url: string
  logoUrl: string | null
  /** Aresta do quadro da marca, em px. */
  size?: number
  className?: string
}

/**
 * Marca do sistema. Tenta o logo cadastrado, depois o favicon do domínio, e só
 * então desenha o monograma — a troca acontece no onError da imagem, então uma
 * marca que sai do ar nunca deixa um buraco no card.
 */
export function SystemBrand({ name, url, logoUrl, size = 36, className = '' }: SystemBrandProps) {
  const fontes = brandSources(logoUrl, url)
  const [tentativa, setTentativa] = useState(0)

  const fonte = fontes[tentativa]
  const hue = brandHue(name)

  const moldura = `hub-brand grid shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)] ${className}`
  const dimensao = { width: size, height: size }

  if (!fonte) {
    return (
      <span
        aria-hidden="true"
        style={{ ...dimensao, '--brand-hue': hue } as React.CSSProperties}
        className={`${moldura} hub-monogram font-semibold`}
      >
        <span style={{ fontSize: size * 0.36 }} className="tracking-tight">
          {brandInitials(name)}
        </span>
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...dimensao, '--brand-hue': hue } as React.CSSProperties}
      className={`${moldura} hub-brand-frame`}
    >
      {/* Marca externa: <img> simples porque a origem é de terceiros e varia por
          cadastro — otimização do Next exigiria allowlist de domínios. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fonte}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setTentativa((valor) => valor + 1)}
        className="hub-brand-img h-full w-full object-contain"
      />
    </span>
  )
}
