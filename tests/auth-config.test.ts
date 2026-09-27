import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as checagem from '../scripts/check-auth-config.mjs'

// O script é JS puro (roda sem build, antes do push); aqui damos forma ao que
// ele exporta para o teste ficar tipado.
const parseToml = checagem.parseToml as (texto: string) => Record<string, string | number | boolean>
const verificar = checagem.verificar as (
  config: Record<string, string | number | boolean>,
) => string[]

const CONFIG_REAL = readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8')

const BASE = `
project_id = "x"

[auth]
site_url = "https://sal-hub-alpha.vercel.app"
enable_signup = false
minimum_password_length = 6

[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

[auth.email]
enable_signup = true
enable_confirmations = true
max_frequency = "1m0s"
otp_length = 8
`

describe('config.toml do projeto', () => {
  it('passa na verificação', () => {
    expect(verificar(parseToml(CONFIG_REAL))).toEqual([])
  })

  it('bloqueia cadastro público e mantém o provedor de e-mail ligado', () => {
    const config = parseToml(CONFIG_REAL)
    expect(config['auth.enable_signup']).toBe(false)
    expect(config['auth.email.enable_signup']).toBe(true)
  })

  it('aponta o site_url para produção', () => {
    expect(parseToml(CONFIG_REAL)['auth.site_url']).toBe('https://sal-hub-alpha.vercel.app')
  })
})

describe('verificação do config de Auth', () => {
  it('pega o campo que derruba o login', () => {
    const quebrado = BASE.replace(
      '[auth.email]\nenable_signup = true',
      '[auth.email]\nenable_signup = false',
    )
    const erros = verificar(parseToml(quebrado))
    expect(erros.some((erro: string) => erro.includes('PROVEDOR de e-mail'))).toBe(true)
  })

  it('pega cadastro público liberado', () => {
    const quebrado = BASE.replace('enable_signup = false', 'enable_signup = true')
    expect(verificar(parseToml(quebrado)).some((e: string) => e.includes('cadastro público'))).toBe(
      true,
    )
  })

  it('pega campo omitido que voltaria ao padrão da CLI', () => {
    const semMfa = BASE.replace('enroll_enabled = true\n', '')
    expect(
      verificar(parseToml(semMfa)).some((e: string) => e.includes('mfa.totp.enroll_enabled')),
    ).toBe(true)
  })

  it('pega site_url apontando para localhost', () => {
    const local = BASE.replace('https://sal-hub-alpha.vercel.app', 'http://localhost:3000')
    expect(verificar(parseToml(local)).some((e: string) => e.includes('localhost'))).toBe(true)
  })
})
