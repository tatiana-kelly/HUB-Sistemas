import Image from 'next/image'

interface LogoProps {
  /** 'lg' nas telas de autenticação, 'sm' no cabeçalho. */
  size?: 'sm' | 'lg'
  withSubtitle?: boolean
  /** Classe extra do subtítulo — o cabeçalho o esconde em telas muito estreitas. */
  subtitleClassName?: string
}

/** Proporção do arquivo oficial, já sem o fundo branco (520 × 285). */
const PROPORCAO = 520 / 285

/**
 * Marca do portal: logo oficial da SAL Express + o nome do produto.
 *
 * A logo já diz "SAL", então o texto ao lado é só "HUB" — escrever "SAL HUB"
 * aqui repetiria a palavra duas vezes lado a lado.
 */
export function Logo({ size = 'sm', withSubtitle = false, subtitleClassName = '' }: LogoProps) {
  const isLarge = size === 'lg'
  const altura = isLarge ? 44 : 30

  return (
    <span className={`flex items-center ${isLarge ? 'gap-3.5' : 'gap-2.5'}`}>
      <Image
        src="/marcas/sal-express.png"
        alt="SAL Express"
        width={Math.round(altura * PROPORCAO)}
        height={altura}
        priority
        className="shrink-0"
      />

      <span aria-hidden="true" className={`w-px self-stretch bg-line ${isLarge ? 'my-1' : ''}`} />

      <span className="min-w-0">
        <span
          className={`block leading-none font-semibold tracking-tight whitespace-nowrap text-fg ${
            isLarge ? 'text-xl' : 'text-[0.9375rem]'
          }`}
        >
          HUB
        </span>
        {withSubtitle && (
          <span
            className={`mt-1 block leading-none text-subtle ${isLarge ? 'text-[0.8125rem]' : 'text-[0.6875rem]'} ${subtitleClassName}`}
          >
            Portal de Sistemas e Indicadores
          </span>
        )}
      </span>
    </span>
  )
}
