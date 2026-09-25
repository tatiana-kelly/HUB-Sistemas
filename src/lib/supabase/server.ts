import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Atua sempre como o usuário autenticado: as políticas de RLS continuam valendo,
 * então o servidor não é um caminho para contornar permissão.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components não podem escrever cookies; o proxy já cuida
          // da renovação da sessão.
        }
      },
    },
  })
}
