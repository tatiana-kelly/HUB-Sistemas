/**
 * Regras do envio de marca pela administração. Ficam aqui, puras, para serem
 * testadas sem banco e para que o formulário e a Server Action usem exatamente
 * os mesmos limites — o navegador só filtra o que é conveniente; quem decide é
 * o servidor, e depois dele o próprio bucket (que repete tipo e tamanho).
 */

/**
 * SVG fica de fora de propósito: é um documento executável, e a URL pública do
 * Storage o abriria na origem do Supabase. As marcas em SVG continuam vindo de
 * /marcas, versionadas no repositório.
 */
export const BRAND_EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
}

/** 1 MB já é muito para uma marca de 88px — acima disso é arquivo errado. */
export const BRAND_MAX_BYTES = 1024 * 1024

/** Filtro do seletor de arquivo do navegador. */
export const BRAND_ACCEPT = '.png,.jpg,.jpeg,.webp,.ico'

export const BRAND_BUCKET = 'marcas'

/** Mensagem do problema, ou null quando o arquivo serve. */
export function brandFileError(type: string, size: number): string | null {
  if (!BRAND_EXTENSION_BY_MIME[type]) {
    return 'A imagem deve ser PNG, JPG, WEBP ou ICO. Para SVG, use o campo de endereço.'
  }
  if (size <= 0) return 'O arquivo enviado está vazio.'
  if (size > BRAND_MAX_BYTES) return 'A imagem deve ter no máximo 1 MB.'
  return null
}

/** Nome do objeto no bucket: legível, sem acento e único por envio. */
export function brandObjectName(systemName: string, type: string, now = Date.now()): string {
  const slug =
    systemName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'marca'

  return `${slug}-${now}.${BRAND_EXTENSION_BY_MIME[type] ?? 'png'}`
}
