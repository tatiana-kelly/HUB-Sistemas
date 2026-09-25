import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/env'

/**
 * Cliente administrativo (service role). SOMENTE servidor.
 *
 * Existe para uma única finalidade: operações que a API pública não permite,
 * como criar usuário no Auth. Toda chamada a este cliente precisa estar atrás de
 * uma verificação de ADMIN feita antes (ver requireAdmin em @/lib/auth).
 *
 * O import 'server-only' garante erro de build se alguém tentar usar no browser.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Permite à UI avisar que a funcionalidade exige a chave de serviço. */
export function hasServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return typeof key === 'string' && key.trim() !== ''
}
