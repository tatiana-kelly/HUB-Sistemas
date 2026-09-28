'use client'

import { useCallback, useState } from 'react'
import { brandHue, brandInitials, brandSources } from '@/lib/brand'

interface SystemBrandProps {
  name: string
  url: string
  logoUrl: string | null
  /** Aresta do quadro da marca, em px. */
  size?: number
  className?: string
}

/** Abaixo disto a imagem é um favicon de barra de endereço, não uma marca. */
const RESOLUCAO_MINIMA = 64

/**
 * Marca do sistema, em camadas: o monograma é desenhado sempre, e a imagem
 * entra por cima quando (e se) carregar.
 *
 * Fazer assim evita os dois defeitos da versão em cascata simples: o ícone de
 * imagem quebrada do navegador enquanto as fontes são tentadas, e o buraco no
 * card quando todas falham. A troca de fonte acontece no onError, do maior
 * ícone para o menor.
 *
 * Um favicon de 32px esticado para 88px borra e entrega amadorismo. Quando a
 * imagem que chega é pequena demais, ela aparece perto do tamanho nativo,
 * centralizada, em vez de ampliada.
 */
export function SystemBrand({ name, url, logoUrl, size = 36, className = '' }: SystemBrandProps) {
  const fontes = brandSources(logoUrl, url)
  const [tentativa, setTentativa] = useState(0)
  const [carregada, setCarregada] = useState(false)
  const [baixaResolucao, setBaixaResolucao] = useState(false)

  const fonte = fontes[tentativa]
  const hue = brandHue(name)

  /**
   * Imagem vinda do cache já chega completa antes de o React anexar o onLoad —
   * e o handler nunca dispara, deixando a marca invisível. Por isso a avaliação
   * roda também no ref, que corre na fase de commit.
   */
  const avaliar = useCallback((img: HTMLImageElement | null) => {
    if (!img || !img.complete || img.naturalWidth === 0) return
    setBaixaResolucao(img.naturalWidth < RESOLUCAO_MINIMA)
    setCarregada(true)
  }, [])

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, '--brand-hue': hue } as React.CSSProperties}
      className={`hub-brand relative grid shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)] font-semibold ${
        carregada ? 'hub-brand-frame' : 'hub-monogram'
      } ${className}`}
    >
      {!carregada && (
        <span style={{ fontSize: size * 0.36 }} className="tracking-tight">
          {brandInitials(name)}
        </span>
      )}

      {fonte && (
        /* Marca externa: <img> simples porque a origem é de terceiros e varia
           por cadastro — otimização do Next exigiria allowlist de domínios. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={fonte}
          src={fonte}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          ref={avaliar}
          onLoad={(evento) => avaliar(evento.currentTarget)}
          onError={() => {
            setCarregada(false)
            setBaixaResolucao(false)
            setTentativa((valor) => valor + 1)
          }}
          style={
            baixaResolucao
              ? { maxWidth: Math.min(size, 44), maxHeight: Math.min(size, 44) }
              : undefined
          }
          className={`hub-brand-img absolute inset-0 m-auto object-contain transition-opacity duration-200 ${
            carregada ? 'opacity-100' : 'opacity-0'
          } ${baixaResolucao ? '' : 'h-full w-full'}`}
        />
      )}
    </span>
  )
}
