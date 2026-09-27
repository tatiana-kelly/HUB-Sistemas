import { afterEach, describe, expect, it } from 'vitest'
import { siteUrl } from '@/lib/env'

const ORIGINAIS = {
  site: process.env.NEXT_PUBLIC_SITE_URL,
  vercel: process.env.VERCEL_PROJECT_PRODUCTION_URL,
}

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGINAIS.site
  process.env.VERCEL_PROJECT_PRODUCTION_URL = ORIGINAIS.vercel
})

describe('siteUrl', () => {
  it('usa o valor explícito quando configurado', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hub.salexpress.com.br'
    expect(siteUrl()).toBe('https://hub.salexpress.com.br')
  })

  it('remove a barra final para não gerar link com barra dupla', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hub.salexpress.com.br/'
    expect(siteUrl()).toBe('https://hub.salexpress.com.br')
  })

  it('cai para o domínio de produção da Vercel quando não há valor explícito', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'sal-hub.vercel.app'
    expect(siteUrl()).toBe('https://sal-hub.vercel.app')
  })

  it('ignora valor explícito vazio', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '   '
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'sal-hub.vercel.app'
    expect(siteUrl()).toBe('https://sal-hub.vercel.app')
  })

  it('usa localhost no desenvolvimento local', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    expect(siteUrl()).toBe('http://localhost:3000')
  })
})
