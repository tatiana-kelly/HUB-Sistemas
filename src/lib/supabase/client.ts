'use client'

import { createBrowserClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'

/**
 * Cliente Supabase do browser. Usa apenas a chave publicável — todo o controle
 * de acesso real acontece no banco, via RLS.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey())
}
