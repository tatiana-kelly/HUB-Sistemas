import { describe, expect, it } from 'vitest'
import { brandHue, brandInitials, brandSources, faviconUrl } from '@/lib/brand'

describe('brandSources', () => {
  it('põe o logo cadastrado na frente de tudo', () => {
    const fontes = brandSources('/marcas/rota-people.svg', 'https://rota-people.vercel.app/')
    expect(fontes[0]).toBe('/marcas/rota-people.svg')
  })

  it('tenta ico, png e apple-touch-icon quando não há logo', () => {
    expect(brandSources(null, 'https://app.powerbi.com/home')).toEqual([
      'https://app.powerbi.com/favicon.ico',
      'https://app.powerbi.com/favicon.png',
      'https://app.powerbi.com/apple-touch-icon.png',
    ])
  })

  it('fica sem fontes quando a URL não serve imagem', () => {
    expect(brandSources(null, 'javascript:alert(1)')).toEqual([])
  })

  it('ignora logo em branco', () => {
    expect(brandSources('   ', 'https://exemplo.com/')[0]).toBe('https://exemplo.com/favicon.ico')
  })
})

describe('faviconUrl', () => {
  it('aponta para a raiz do domínio do sistema', () => {
    expect(faviconUrl('https://sistema.ssw.inf.br/bin/ssw0422')).toBe(
      'https://sistema.ssw.inf.br/favicon.ico',
    )
  })

  it('ignora caminho e query', () => {
    expect(faviconUrl('https://app.powerbi.com/home?experience=power-bi')).toBe(
      'https://app.powerbi.com/favicon.ico',
    )
  })

  it('recusa esquema que não seja http(s)', () => {
    expect(faviconUrl('javascript:alert(1)')).toBeNull()
    expect(faviconUrl('data:text/html,<script>')).toBeNull()
    expect(faviconUrl('nao-e-url')).toBeNull()
  })
})

describe('brandInitials', () => {
  it('usa a inicial das duas primeiras palavras relevantes', () => {
    expect(brandInitials('Agente Rastreamento de Cargas')).toBe('AR')
    expect(brandInitials('Power BI')).toBe('PB')
    expect(brandInitials('Rota People')).toBe('RP')
  })

  it('ignora conectivos', () => {
    expect(brandInitials('Contas a Pagar')).toBe('CP')
    expect(brandInitials('Portal do Motorista')).toBe('PM')
  })

  it('usa duas letras quando há só uma palavra', () => {
    expect(brandInitials('SSW')).toBe('SS')
    expect(brandInitials('Armazém')).toBe('AR')
  })

  it('trata separadores de categoria composta', () => {
    expect(brandInitials('RH / DP')).toBe('RD')
  })

  it('não quebra com nome vazio', () => {
    expect(brandInitials('   ')).toBe('?')
  })
})

describe('brandHue', () => {
  it('é estável para o mesmo nome', () => {
    expect(brandHue('SSW')).toBe(brandHue('SSW'))
    expect(brandHue('DRE Operacional')).toBe(brandHue('DRE Operacional'))
  })

  it('fica sempre dentro do círculo cromático', () => {
    for (const nome of ['SSW', 'Power BI', 'Rota People', 'Armazém', 'x', '']) {
      const hue = brandHue(nome)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })

  it('separa nomes diferentes', () => {
    const hues = ['SSW', 'Power BI', 'DRE Operacional', 'Rota People'].map(brandHue)
    expect(new Set(hues).size).toBe(hues.length)
  })
})
