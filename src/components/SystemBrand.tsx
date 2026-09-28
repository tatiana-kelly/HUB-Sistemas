'use client'

import { useEffect, useRef, useState } from 'react'
import { brandHue, brandInitials, brandSources } from '@/lib/brand'

interface SystemBrandProps {
  name: string
  url: string
  logoUrl: string | null
  /** Aresta do quadro da marca, em px. Todas as marcas ocupam a mesma caixa. */
  size?: number
  className?: string
}

/**
 * Ampliação máxima de uma arte pequena. Um favicon de 32px chega a 88px com
 * 2.75×, mantendo a marca no mesmo tamanho das outras sem virar mosaico. Acima
 * disso a arte é exibida menor, centralizada na mesma caixa.
 */
const AMPLIACAO_MAXIMA = 3

/**
 * Marca do sistema, em camadas: o monograma é desenhado sempre, e a imagem
 * entra por cima quando (e se) carregar. Isso evita o ícone de imagem quebrada
 * do navegador durante a cascata e o buraco no card quando tudo falha.
 *
 * A prontidão da imagem é verificada com `decode()` em vez de `onLoad`: uma
 * imagem vinda do cache costuma ficar pronta antes de o React anexar o handler,
 * e aí o evento nunca dispara — a marca ficava invisível.
 */
export function SystemBrand({ name, url, logoUrl, size = 36, className = '' }: SystemBrandProps) {
  const fontes = brandSources(logoUrl, url)
  const [tentativa, setTentativa] = useState(0)
  const [carregada, setCarregada] = useState(false)
  /** Teto de exibição quando a arte é pequena demais para preencher a caixa. */
  const [tetoPx, setTetoPx] = useState<number | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const fonte = fontes[tentativa]
  const hue = brandHue(name)

  useEffect(() => {
    const img = imgRef.current
    if (!img || !fonte) return

    let cancelado = false

    function aplicar() {
      if (cancelado || !img) return
      const maiorLado = Math.max(img.naturalWidth, img.naturalHeight)
      const limite = maiorLado * AMPLIACAO_MAXIMA
      setTetoPx(limite < size ? Math.round(limite) : null)
      setCarregada(true)
    }

    /** Passa para a próxima fonte da cascata; sem mais fontes, sobra o monograma. */
    function falhar() {
      if (cancelado) return
      setCarregada(false)
      setTetoPx(null)
      setTentativa((valor) => valor + 1)
    }

    // `complete` com naturalWidth 0 é falha, não "ainda carregando" — e é o
    // estado em que uma imagem quebrada costuma chegar aqui, antes de o React
    // anexar o onError. Sem tratar isso, a cascata trava na primeira fonte.
    if (img.complete) {
      if (img.naturalWidth === 0) falhar()
      else aplicar()
    } else {
      img.decode().then(aplicar, falhar)
    }

    return () => {
      cancelado = true
    }
  }, [fonte, size])

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
          ref={imgRef}
          src={fonte}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            setCarregada(false)
            setTetoPx(null)
            setTentativa((valor) => valor + 1)
          }}
          style={tetoPx ? { maxWidth: tetoPx, maxHeight: tetoPx } : undefined}
          className={`hub-brand-img absolute inset-0 m-auto object-contain transition-opacity duration-200 ${
            carregada ? 'opacity-100' : 'opacity-0'
          } ${tetoPx ? '' : 'h-full w-full'}`}
        />
      )}
    </span>
  )
}
