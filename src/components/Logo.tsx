interface LogoProps {
  /** 'lg' na tela de login, 'sm' no cabeçalho. */
  size?: 'sm' | 'lg'
  withSubtitle?: boolean
}

export function Logo({ size = 'sm', withSubtitle = false }: LogoProps) {
  const isLarge = size === 'lg'

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-xl bg-brand-700 font-bold text-white shadow-sm ${
          isLarge ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm'
        }`}
      >
        SAL
      </span>
      <span className="min-w-0">
        <span
          className={`block leading-tight font-semibold tracking-tight text-ink-900 ${
            isLarge ? 'text-2xl' : 'text-base'
          }`}
        >
          SAL HUB
        </span>
        {withSubtitle && (
          <span
            className={`block text-ink-500 ${isLarge ? 'text-sm' : 'text-xs'} leading-tight`}
          >
            Portal de Sistemas e Indicadores
          </span>
        )}
      </span>
    </div>
  )
}
