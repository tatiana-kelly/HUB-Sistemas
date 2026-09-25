interface LogoProps {
  /** 'lg' nas telas de autenticação, 'sm' no cabeçalho. */
  size?: 'sm' | 'lg'
  withSubtitle?: boolean
  /** Classe extra do subtítulo — o cabeçalho o esconde em telas muito estreitas. */
  subtitleClassName?: string
}

export function Logo({ size = 'sm', withSubtitle = false, subtitleClassName = '' }: LogoProps) {
  const isLarge = size === 'lg'

  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-[var(--radius-md)] bg-primary font-bold tracking-tight text-white dark:text-on-inverse ${
          isLarge ? 'h-11 w-11 text-base' : 'h-8 w-8 text-[0.6875rem]'
        }`}
      >
        SAL
      </span>
      <span className="min-w-0">
        <span
          className={`block leading-none font-semibold tracking-tight whitespace-nowrap text-fg ${
            isLarge ? 'text-xl' : 'text-[0.9375rem]'
          }`}
        >
          SAL HUB
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
