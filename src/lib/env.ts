/**
 * Leitura centralizada e validada das variáveis de ambiente.
 * Falhar cedo e com mensagem clara é melhor do que quebrar em runtime dentro do
 * cliente Supabase.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Copie env.example para .env.local e preencha os valores.`,
    )
  }
  return value
}

export const supabaseUrl = () =>
  required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabaseAnonKey = () =>
  required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/** Somente servidor. Nunca exponha esta chave no browser. */
export const supabaseServiceRoleKey = () =>
  required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)

/**
 * Base dos links de convite e de recuperação de senha.
 *
 * A ordem evita o erro clássico de apontar o e-mail para o domínio errado:
 * o valor explícito vence; na Vercel, o domínio de produção do projeto é
 * injetado automaticamente; e no desenvolvimento local sobra o localhost.
 */
export const siteUrl = (): string => {
  const explicito = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicito) return explicito.replace(/\/$/, '')

  const producaoVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (producaoVercel) return `https://${producaoVercel.replace(/\/$/, '')}`

  return 'http://localhost:3000'
}
