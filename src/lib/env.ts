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

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
