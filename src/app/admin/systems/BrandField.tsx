'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { SystemBrand } from '@/components/SystemBrand'
import { Alert } from '@/components/Alert'
import { inputClass } from '@/components/ui'
import { BRAND_ACCEPT, brandFileError } from '@/lib/brand-upload'

interface BrandFieldProps {
  /** Nome do sistema — alimenta o monograma quando não há imagem nenhuma. */
  systemName: string
  /** URL do sistema — a prévia tenta o favicon do domínio, como o card faz. */
  systemUrl: string
  defaultLogoUrl: string
}

/**
 * Marca do sistema no cadastro: envio de imagem, endereço manual e prévia.
 *
 * A prévia usa o mesmo componente do card, então o que aparece aqui é o que a
 * pessoa vai ver no portal — inclusive a queda para o favicon do domínio e,
 * em último caso, para o monograma.
 */
export function BrandField({ systemName, systemUrl, defaultLogoUrl }: BrandFieldProps) {
  const [previaArquivo, setPreviaArquivo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enderecoMarca, setEnderecoMarca] = useState(defaultLogoUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  // O object URL vive enquanto a prévia estiver na tela; sem revogar, o blob
  // fica preso na memória da aba a cada arquivo escolhido.
  useEffect(() => {
    if (!previaArquivo) return
    return () => URL.revokeObjectURL(previaArquivo)
  }, [previaArquivo])

  function escolher(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0]
    setErro(null)

    if (!arquivo) {
      setPreviaArquivo(null)
      return
    }

    // Mesma regra do servidor: aqui ela só evita a ida e volta inútil.
    const problema = brandFileError(arquivo.type, arquivo.size)
    if (problema) {
      setErro(problema)
      setPreviaArquivo(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setPreviaArquivo(URL.createObjectURL(arquivo))
  }

  function limpar() {
    if (inputRef.current) inputRef.current.value = ''
    setPreviaArquivo(null)
    setErro(null)
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-lg)] border border-line bg-surface p-3.5">
      <div className="flex items-start gap-3.5">
        <span className="shrink-0">
          {previaArquivo ? (
            <span className="hub-brand hub-brand-frame relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[var(--radius-md)]">
              {/* Prévia local do arquivo escolhido: blob da própria aba. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previaArquivo} alt="" className="h-full w-full object-contain" />
            </span>
          ) : (
            <SystemBrand
              name={systemName || 'Novo sistema'}
              url={systemUrl}
              logoUrl={enderecoMarca.trim() === '' ? null : enderecoMarca.trim()}
              size={72}
            />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="block text-[0.8125rem] font-medium text-muted">Marca do card</span>

          <input
            ref={inputRef}
            id="system-logo-file"
            name="logo_file"
            type="file"
            accept={BRAND_ACCEPT}
            onChange={escolher}
            className="block w-full text-[0.8125rem] text-muted file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border file:border-line file:bg-sunken file:px-3 file:py-1.5 file:text-[0.8125rem] file:font-medium file:text-fg hover:file:bg-hover"
          />

          <p className="text-xs text-subtle">
            PNG, JPG, WEBP ou ICO, até 1 MB. Prefira uma imagem quadrada e sem fundo branco.
          </p>

          {previaArquivo && (
            <button
              type="button"
              onClick={limpar}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-fg"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
              Descartar a imagem escolhida
            </button>
          )}
        </div>
      </div>

      {erro && <Alert tone="error">{erro}</Alert>}

      <div className="space-y-1.5">
        <label htmlFor="system-logo" className="block text-[0.8125rem] font-medium text-muted">
          Ou endereço da imagem
        </label>
        <input
          id="system-logo"
          name="logo_url"
          value={enderecoMarca}
          onChange={(event) => setEnderecoMarca(event.target.value)}
          placeholder="/marcas/exemplo.svg"
          className={inputClass}
        />
        <p className="text-xs text-subtle">
          Opcional. Vazio, o card usa o favicon do site e, se não houver, as iniciais do nome. Uma
          imagem enviada acima substitui este endereço.
        </p>
      </div>
    </div>
  )
}
