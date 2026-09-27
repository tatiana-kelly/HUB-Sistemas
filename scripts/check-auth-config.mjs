#!/usr/bin/env node
/**
 * Confere supabase/config.toml antes de `supabase config push`.
 *
 * Existe porque o push aplica o arquivo INTEIRO, sem confirmação: todo campo
 * não declarado volta ao padrão da CLI. Na prática isso já derrubou o login do
 * portal e desligou MFA sem ninguém pedir. As regras abaixo são exatamente
 * esses acidentes, transformados em verificação.
 *
 *   node scripts/check-auth-config.mjs
 */

import { readFileSync } from 'node:fs'

const CAMINHO = new URL('../supabase/config.toml', import.meta.url)

/**
 * Leitor de TOML suficiente para este arquivo: seções [a.b] e pares
 * chave = valor. Evita uma dependência nova só para validar um arquivo nosso.
 */
export function parseToml(texto) {
  const dados = {}
  let secao = ''

  for (const linhaBruta of texto.split(/\r?\n/)) {
    const linha = linhaBruta.trim()
    if (linha === '' || linha.startsWith('#')) continue

    const cabecalho = /^\[([^\]]+)\]$/.exec(linha)
    if (cabecalho) {
      secao = cabecalho[1]
      continue
    }

    const par = /^([A-Za-z0-9_]+)\s*=\s*(.+)$/.exec(linha)
    if (!par) continue

    const [, chave, valorBruto] = par
    const caminho = secao ? `${secao}.${chave}` : chave
    const valor = valorBruto.trim()

    if (valor === 'true' || valor === 'false') dados[caminho] = valor === 'true'
    else if (/^-?\d+$/.test(valor)) dados[caminho] = Number(valor)
    else dados[caminho] = valor.replace(/^["']|["'],?$/g, '')
  }

  return dados
}

/** Campos que precisam estar declarados para não voltarem ao padrão da CLI. */
const OBRIGATORIOS = [
  ['auth.site_url', 'sem isso os e-mails apontam para localhost'],
  ['auth.enable_signup', 'sem isso o cadastro público volta a ser liberado'],
  ['auth.mfa.totp.enroll_enabled', 'sem isso o MFA do projeto é desligado'],
  ['auth.mfa.totp.verify_enabled', 'sem isso o MFA do projeto é desligado'],
  ['auth.email.enable_confirmations', 'sem isso a confirmação de e-mail é desligada'],
  ['auth.email.max_frequency', 'sem isso o limite de envio cai para 1s'],
  ['auth.email.otp_length', 'sem isso o código de e-mail encurta'],
]

export function verificar(config) {
  const erros = []

  // A armadilha que derrubou o login: este campo é o provedor inteiro.
  if (config['auth.email.enable_signup'] === false) {
    erros.push(
      '[auth.email] enable_signup = false desliga o PROVEDOR de e-mail — ninguém consegue fazer login. ' +
        'Para bloquear cadastro público, use enable_signup na seção [auth].',
    )
  }

  if (config['auth.enable_signup'] !== false) {
    erros.push(
      '[auth] enable_signup deveria ser false: o portal não tem cadastro público, ' +
        'usuários entram por convite do administrador.',
    )
  }

  for (const [campo, motivo] of OBRIGATORIOS) {
    if (config[campo] === undefined) {
      erros.push(`${campo} não está declarado — ${motivo}.`)
    }
  }

  const siteUrl = config['auth.site_url']
  if (typeof siteUrl === 'string' && siteUrl.includes('localhost')) {
    erros.push(`[auth] site_url aponta para localhost (${siteUrl}) — os e-mails sairiam quebrados.`)
  }

  return erros
}

// Só executa a verificação quando chamado direto, não quando importado no teste.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const erros = verificar(parseToml(readFileSync(CAMINHO, 'utf8')))

  if (erros.length > 0) {
    console.error('config.toml reprovado:\n')
    for (const erro of erros) console.error(`  - ${erro}`)
    console.error('\nCorrija antes de rodar `supabase config push`.')
    process.exit(1)
  }

  console.log('config.toml aprovado. Pode rodar: supabase config push')
}
