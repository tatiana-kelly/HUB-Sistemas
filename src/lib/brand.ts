/**
 * Identidade visual de um sistema no card, em cascata:
 *
 *   1. logo_url cadastrado pelo administrador — inclui as marcas próprias dos
 *      sistemas da SAL, servidas de /marcas;
 *   2. favicon do próprio domínio do sistema — é a marca oficial, servida pela
 *      origem, sem intermediário e sem cópia local;
 *   3. monograma gerado do nome — nenhum sistema novo fica sem identidade,
 *      mesmo cadastrado às pressas e sem arte.
 */

/** Favicon na raiz do domínio do sistema. Null quando a URL não é http(s). */
export function faviconUrl(systemUrl: string): string | null {
  try {
    const parsed = new URL(systemUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return `${parsed.origin}/favicon.ico`
  } catch {
    return null
  }
}

/**
 * Ordem de tentativas da marca, da maior resolução para a menor.
 *
 * O card mostra a marca a 88px, e `favicon.ico` costuma ter 32px — ampliado,
 * borra. Por isso o apple-touch-icon (180px de praxe) vem antes. Sites em SPA
 * ainda respondem o index.html em qualquer um desses caminhos: a imagem falha
 * ao decodificar, a próxima fonte entra, e no fim sobra o monograma.
 */
export function brandSources(logoUrl: string | null, systemUrl: string): string[] {
  const fontes: string[] = []
  if (logoUrl && logoUrl.trim() !== '') fontes.push(logoUrl.trim())

  const favicon = faviconUrl(systemUrl)
  if (favicon) {
    fontes.push(favicon.replace(/favicon\.ico$/, 'apple-touch-icon.png'))
    fontes.push(favicon.replace(/\.ico$/, '.png'))
    fontes.push(favicon)
  }

  return fontes
}

/** Palavras que não ajudam a identificar o sistema num monograma de 2 letras. */
const IGNORADAS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'para', 'por',
])

/**
 * Iniciais do sistema: duas letras, ignorando conectivos.
 * "Agente Rastreamento de Cargas" -> "AR"; "SSW" -> "SS"; "Power BI" -> "PB".
 */
export function brandInitials(name: string): string {
  const palavras = name
    .trim()
    .split(/[\s/\-–—]+/)
    .filter((palavra) => palavra.length > 0 && !IGNORADAS.has(palavra.toLowerCase()))

  if (palavras.length === 0) return '?'

  if (palavras.length === 1) {
    const unica = palavras[0] ?? ''
    return unica.slice(0, 2).toUpperCase()
  }

  const primeira = palavras[0]?.[0] ?? ''
  const segunda = palavras[1]?.[0] ?? ''
  return (primeira + segunda).toUpperCase()
}

/**
 * Matiz estável derivada do nome (0–359). O mesmo sistema mostra sempre a mesma
 * cor, em qualquer sessão e em qualquer máquina, sem guardar nada no banco.
 * A saturação e a luminosidade ficam no CSS, que as ajusta por tema.
 */
export function brandHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360000
  }
  return hash % 360
}
