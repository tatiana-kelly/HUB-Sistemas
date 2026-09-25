'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, hasServiceRoleKey } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { isSafeExternalUrl } from '@/lib/access'
import { siteUrl } from '@/lib/env'
import type { ActionState } from '@/app/actions/auth'

/**
 * Ações de administração. Cada uma começa por requireAdmin(): a checagem de
 * perfil acontece no servidor. Ainda assim, o RLS é a barreira final — mesmo uma
 * chamada que escapasse daqui seria recusada pelo banco.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function optionalText(formData: FormData, key: string): string | null {
  const value = text(formData, key)
  return value === '' ? null : value
}

function integer(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(text(formData, key), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function checkbox(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  return value === 'on' || value === 'true' || value === '1'
}

// ─── Sistemas ────────────────────────────────────────────────────────────────

export async function saveSystem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  const id = optionalText(formData, 'id')
  const name = text(formData, 'name')
  const url = text(formData, 'url')

  if (!name) return { error: 'Informe o nome do sistema.' }
  if (!isSafeExternalUrl(url)) return { error: 'Informe uma URL válida iniciando com http ou https.' }

  const payload = {
    name,
    description: optionalText(formData, 'description'),
    url,
    icon: optionalText(formData, 'icon'),
    category_id: optionalText(formData, 'category_id'),
    type: text(formData, 'type') === 'indicator' ? 'indicator' : 'system',
    display_order: integer(formData, 'display_order'),
    active: checkbox(formData, 'active'),
  }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('systems').update(payload).eq('id', id)
    : await supabase.from('systems').insert(payload)

  if (error) return { error: `Não foi possível salvar o sistema: ${error.message}` }

  revalidatePath('/admin/systems')
  revalidatePath('/home')
  return { success: id ? 'Sistema atualizado.' : 'Sistema criado.' }
}

export async function deleteSystem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  if (!id) return { error: 'Sistema não informado.' }

  const supabase = await createClient()
  const { error } = await supabase.from('systems').delete().eq('id', id)

  if (error) return { error: `Não foi possível excluir o sistema: ${error.message}` }

  revalidatePath('/admin/systems')
  revalidatePath('/home')
  return { success: 'Sistema excluído.' }
}

export async function toggleSystemActive(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const active = checkbox(formData, 'active')

  const supabase = await createClient()
  const { error } = await supabase.from('systems').update({ active: !active }).eq('id', id)

  if (error) return { error: `Não foi possível alterar o status: ${error.message}` }

  revalidatePath('/admin/systems')
  revalidatePath('/home')
  return { success: active ? 'Sistema desativado.' : 'Sistema ativado.' }
}

export async function moveSystem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const direction = text(formData, 'direction') === 'up' ? -1 : 1
  const current = integer(formData, 'display_order')

  const supabase = await createClient()
  const { error } = await supabase
    .from('systems')
    .update({ display_order: Math.max(0, current + direction) })
    .eq('id', id)

  if (error) return { error: `Não foi possível alterar a ordem: ${error.message}` }

  revalidatePath('/admin/systems')
  revalidatePath('/home')
  return { success: 'Ordem atualizada.' }
}

// ─── Categorias ──────────────────────────────────────────────────────────────

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  const id = optionalText(formData, 'id')
  const name = text(formData, 'name')
  if (!name) return { error: 'Informe o nome da categoria.' }

  const payload = {
    name,
    description: optionalText(formData, 'description'),
    icon: optionalText(formData, 'icon'),
    display_order: integer(formData, 'display_order'),
    active: checkbox(formData, 'active'),
  }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('categories').update(payload).eq('id', id)
    : await supabase.from('categories').insert(payload)

  if (error) return { error: `Não foi possível salvar a categoria: ${error.message}` }

  revalidatePath('/admin/categories')
  revalidatePath('/home')
  return { success: id ? 'Categoria atualizada.' : 'Categoria criada.' }
}

export async function toggleCategoryActive(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const active = checkbox(formData, 'active')

  const supabase = await createClient()
  const { error } = await supabase.from('categories').update({ active: !active }).eq('id', id)

  if (error) return { error: `Não foi possível alterar o status: ${error.message}` }

  revalidatePath('/admin/categories')
  revalidatePath('/home')
  return { success: active ? 'Categoria desativada.' : 'Categoria ativada.' }
}

// ─── Permissões ──────────────────────────────────────────────────────────────

/**
 * Regrava as permissões de um perfil a partir dos checkboxes marcados.
 * É isto que faz a quantidade de sistemas por perfil ser dado, não código.
 */
export async function saveRolePermissions(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const roleId = text(formData, 'role_id')
  if (!roleId) return { error: 'Perfil não informado.' }

  const selected = new Set(formData.getAll('system_ids').map((value) => String(value)))
  const supabase = await createClient()

  const { data: allSystems, error: systemsError } = await supabase
    .from('systems')
    .select('id')
    .returns<{ id: string }[]>()

  if (systemsError) return { error: `Não foi possível carregar os sistemas: ${systemsError.message}` }

  const toGrant = (allSystems ?? []).filter((system) => selected.has(system.id))
  const toRevoke = (allSystems ?? []).filter((system) => !selected.has(system.id))

  if (toGrant.length > 0) {
    const { error } = await supabase.from('role_system_permissions').upsert(
      toGrant.map((system) => ({ role_id: roleId, system_id: system.id, can_view: true })),
      { onConflict: 'role_id,system_id' },
    )
    if (error) return { error: `Não foi possível salvar as permissões: ${error.message}` }
  }

  if (toRevoke.length > 0) {
    const { error } = await supabase
      .from('role_system_permissions')
      .delete()
      .eq('role_id', roleId)
      .in(
        'system_id',
        toRevoke.map((system) => system.id),
      )
    if (error) return { error: `Não foi possível remover permissões: ${error.message}` }
  }

  revalidatePath('/admin/permissions')
  revalidatePath('/home')
  return { success: 'Permissões atualizadas.' }
}

// ─── Usuários ────────────────────────────────────────────────────────────────

export async function updateUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  const userId = text(formData, 'user_id')
  const roleId = text(formData, 'role_id')
  if (!userId || !roleId) return { error: 'Usuário ou perfil não informado.' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId)

  if (error) return { error: `Não foi possível alterar o perfil: ${error.message}` }

  revalidatePath('/admin/users')
  return { success: 'Perfil do usuário atualizado.' }
}

export async function toggleUserActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin()

  const userId = text(formData, 'user_id')
  const active = checkbox(formData, 'active')

  if (userId === admin.userId) {
    return { error: 'Você não pode desativar o seu próprio acesso.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ active: !active }).eq('id', userId)

  if (error) return { error: `Não foi possível alterar o status: ${error.message}` }

  revalidatePath('/admin/users')
  return { success: active ? 'Usuário desativado.' : 'Usuário ativado.' }
}

/**
 * Cria o usuário no Supabase Auth e envia convite por e-mail para ele definir a
 * própria senha. Nenhuma senha é gerada, transportada ou armazenada aqui.
 * Exige SUPABASE_SERVICE_ROLE_KEY (somente servidor).
 */
export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()

  if (!hasServiceRoleKey()) {
    return {
      error:
        'Criação de usuário indisponível: a variável SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor.',
    }
  }

  const email = text(formData, 'email').toLowerCase()
  const name = text(formData, 'name')
  const roleId = text(formData, 'role_id')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' }
  if (!name) return { error: 'Informe o nome do usuário.' }
  if (!roleId) return { error: 'Selecione o perfil de acesso.' }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  })

  if (error || !data.user) {
    return { error: `Não foi possível convidar o usuário: ${error?.message ?? 'erro desconhecido'}` }
  }

  // O trigger hub_handle_new_user já criou o profile; aqui só aplicamos o perfil
  // escolhido pelo administrador.
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ name, role_id: roleId })
    .eq('id', data.user.id)

  if (profileError) {
    return {
      error: `Usuário convidado, mas o perfil não pôde ser aplicado: ${profileError.message}`,
    }
  }

  revalidatePath('/admin/users')
  return { success: `Convite enviado para ${email}. O usuário define a própria senha pelo link.` }
}
