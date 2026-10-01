import { describe, expect, it } from 'vitest'
import { BRAND_MAX_BYTES, brandFileError, brandObjectName } from '@/lib/brand-upload'

describe('brandFileError', () => {
  it('aceita os formatos de imagem do cadastro', () => {
    expect(brandFileError('image/png', 50_000)).toBeNull()
    expect(brandFileError('image/jpeg', 50_000)).toBeNull()
    expect(brandFileError('image/webp', 50_000)).toBeNull()
    expect(brandFileError('image/x-icon', 50_000)).toBeNull()
  })

  it('recusa SVG: é documento executável servido de origem pública', () => {
    expect(brandFileError('image/svg+xml', 1_000)).toMatch(/PNG, JPG, WEBP ou ICO/)
  })

  it('recusa o que não é imagem', () => {
    expect(brandFileError('application/pdf', 1_000)).not.toBeNull()
    expect(brandFileError('', 1_000)).not.toBeNull()
  })

  it('recusa arquivo vazio e acima de 1 MB', () => {
    expect(brandFileError('image/png', 0)).toMatch(/vazio/)
    expect(brandFileError('image/png', BRAND_MAX_BYTES)).toBeNull()
    expect(brandFileError('image/png', BRAND_MAX_BYTES + 1)).toMatch(/1 MB/)
  })
})

describe('brandObjectName', () => {
  it('gera nome legível, sem acento e com a extensão do tipo', () => {
    expect(brandObjectName('ROTEIRIZADOR INTELIGENTE', 'image/png', 1_700_000_000_000)).toBe(
      'roteirizador-inteligente-1700000000000.png',
    )
    expect(brandObjectName('PENDÊNCIAS', 'image/jpeg', 1)).toBe('pendencias-1.jpg')
  })

  it('não deixa o nome vazio quando o sistema só tem símbolos', () => {
    expect(brandObjectName('***', 'image/webp', 7)).toBe('marca-7.webp')
  })

  it('separa envios do mesmo sistema pelo instante, sem sobrescrever o anterior', () => {
    const primeiro = brandObjectName('Power BI', 'image/png', 1)
    const segundo = brandObjectName('Power BI', 'image/png', 2)
    expect(primeiro).not.toBe(segundo)
  })
})
