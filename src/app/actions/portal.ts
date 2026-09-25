'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/auth'
import { isSafeExternalUrl } from '@/lib/access'

/**
 * Ações do portal para o usuário final: favoritar e registrar acesso.
 * Em todas elas a permissão é reavaliada no banco — o insert em access_logs e
 * favorites só passa se hub_can_view_system() autorizar.
 */

export async function toggleFavorite(systemId: string, isFavorite: boolean): Promise<void> {
  const session = await requireSession()
  const supabase = await createClient()

  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('system_id', systemId)
      .eq('user_id', session.userId)

    if (error) throw new Error(`Não foi possível remover o favorito: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ system_id: systemId, user_id: session.userId })

    if (error) throw new Error(`Não foi possível favoritar: ${error.message}`)
  }

  revalidatePath('/home')
}

export interface OpenSystemResult {
  url?: string
  error?: string
}

/**
 * Valida a permissão, registra o access_log e devolve a URL para o cliente abrir
 * em nova aba. Nenhuma credencial é repassada, nenhum login automático é tentado.
 */
export async function registerSystemAccess(systemId: string): Promise<OpenSystemResult> {
  const session = await requireSession()
  const supabase = await createClient()

  // O select abaixo já é filtrado pelo RLS: sem permissão, não retorna nada.
  const { data: system, error } = await supabase
    .from('systems')
    .select('id, url, active')
    .eq('id', systemId)
    .eq('active', true)
    .maybeSingle<{ id: string; url: string; active: boolean }>()

  if (error || !system) {
    return { error: 'Você não tem permissão para acessar este sistema.' }
  }

  if (!isSafeExternalUrl(system.url)) {
    return { error: 'O endereço cadastrado para este sistema é inválido.' }
  }

  const { error: logError } = await supabase
    .from('access_logs')
    .insert({ user_id: session.userId, system_id: system.id })

  if (logError) {
    // O RLS recusa o log quando não há permissão — então recusamos a abertura.
    return { error: 'Você não tem permissão para acessar este sistema.' }
  }

  revalidatePath('/home')
  return { url: system.url }
}
