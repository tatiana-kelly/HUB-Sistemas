import { createClient } from '@/lib/supabase/server'
import type {
  AccessLogEntry,
  Category,
  ProfileWithRole,
  Role,
  RoleSystemPermission,
  SystemWithCategory,
} from '@/lib/types'

/**
 * Leituras do portal. Todas passam pelo cliente do usuário autenticado, então o
 * RLS é quem define o que volta — em especial em `systems`, onde a política
 * hub_can_view_system() já elimina o que o perfil não pode ver.
 */

interface SystemRow {
  id: string
  name: string
  description: string | null
  url: string
  icon: string | null
  logo_url: string | null
  category_id: string | null
  type: 'system' | 'indicator'
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
  categories: { name: string } | null
}

function toSystem(row: SystemRow): SystemWithCategory {
  const { categories, ...rest } = row
  return { ...rest, category_name: categories?.name ?? null }
}

const SYSTEM_SELECT =
  'id, name, description, url, icon, logo_url, category_id, type, display_order, active, created_at, updated_at, categories(name)'

/** Sistemas que o usuário pode ver (ativos). A permissão vem do banco. */
export async function getVisibleSystems(): Promise<SystemWithCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('systems')
    .select(SYSTEM_SELECT)
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<SystemRow[]>()

  if (error) throw new Error(`Falha ao carregar sistemas: ${error.message}`)
  return (data ?? []).map(toSystem)
}

/** Todos os sistemas, inclusive inativos — usado na administração. */
export async function getAllSystems(): Promise<SystemWithCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('systems')
    .select(SYSTEM_SELECT)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<SystemRow[]>()

  if (error) throw new Error(`Falha ao carregar sistemas: ${error.message}`)
  return (data ?? []).map(toSystem)
}

export async function getCategories(onlyActive = true): Promise<Category[]> {
  const supabase = await createClient()

  let query = supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (onlyActive) query = query.eq('active', true)

  const { data, error } = await query.returns<Category[]>()
  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`)
  return data ?? []
}

export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })
    .returns<Role[]>()

  if (error) throw new Error(`Falha ao carregar perfis: ${error.message}`)
  return data ?? []
}

/** IDs dos sistemas favoritados pelo usuário atual. */
export async function getFavoriteSystemIds(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select('system_id')
    .returns<{ system_id: string }[]>()

  if (error) throw new Error(`Falha ao carregar favoritos: ${error.message}`)
  return (data ?? []).map((row) => row.system_id)
}

/** Histórico recente do próprio usuário (bruto, já ordenado). */
export async function getMyRecentAccesses(limit = 40) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('access_logs')
    .select('id, system_id, accessed_at, systems(name)')
    .order('accessed_at', { ascending: false })
    .limit(limit)
    .returns<{ id: string; system_id: string; accessed_at: string; systems: { name: string } | null }[]>()

  if (error) throw new Error(`Falha ao carregar últimos acessos: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    system_id: row.system_id,
    accessed_at: row.accessed_at,
    system_name: row.systems?.name ?? null,
  }))
}

export async function getProfiles(): Promise<ProfileWithRole[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role_id, active, created_at, updated_at, roles(name)')
    .order('name', { ascending: true })
    .returns<
      {
        id: string
        name: string | null
        email: string | null
        role_id: string | null
        active: boolean
        created_at: string
        updated_at: string
        roles: { name: string } | null
      }[]
    >()

  if (error) throw new Error(`Falha ao carregar usuários: ${error.message}`)

  return (data ?? []).map(({ roles, ...rest }) => ({ ...rest, role_name: roles?.name ?? null }))
}

export async function getProfileById(id: string): Promise<ProfileWithRole | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role_id, active, created_at, updated_at, roles(name)')
    .eq('id', id)
    .maybeSingle<{
      id: string
      name: string | null
      email: string | null
      role_id: string | null
      active: boolean
      created_at: string
      updated_at: string
      roles: { name: string } | null
    }>()

  if (error) throw new Error(`Falha ao carregar usuário: ${error.message}`)
  if (!data) return null

  const { roles, ...rest } = data
  return { ...rest, role_name: roles?.name ?? null }
}

export async function getRolePermissions(): Promise<RoleSystemPermission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('role_system_permissions')
    .select('*')
    .returns<RoleSystemPermission[]>()

  if (error) throw new Error(`Falha ao carregar permissões: ${error.message}`)
  return data ?? []
}

/** Sistemas liberados para um perfil específico (visão da administração). */
export async function getSystemsForRole(roleId: string): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('role_system_permissions')
    .select('can_view, systems(id, name, display_order, active)')
    .eq('role_id', roleId)
    .eq('can_view', true)
    .returns<
      {
        can_view: boolean
        systems: { id: string; name: string; display_order: number; active: boolean } | null
      }[]
    >()

  if (error) throw new Error(`Falha ao carregar sistemas do perfil: ${error.message}`)

  return (data ?? [])
    .map((row) => row.systems)
    .filter(
      (system): system is { id: string; name: string; display_order: number; active: boolean } =>
        system !== null && system.active,
    )
    .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name, 'pt-BR'))
    .map(({ id, name }) => ({ id, name }))
}

export interface AccessLogFilters {
  userId?: string
  systemId?: string
  from?: string
  to?: string
  limit?: number
}

/** Auditoria de acessos (ADMIN). O RLS impede que um não-admin leia de outros. */
export async function getAccessLogs(filters: AccessLogFilters = {}): Promise<AccessLogEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('access_logs')
    .select('id, user_id, system_id, accessed_at, systems(name), profiles(name, email)')
    .order('accessed_at', { ascending: false })
    .limit(filters.limit ?? 200)

  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.systemId) query = query.eq('system_id', filters.systemId)
  if (filters.from) query = query.gte('accessed_at', `${filters.from}T00:00:00`)
  if (filters.to) query = query.lte('accessed_at', `${filters.to}T23:59:59`)

  const { data, error } = await query.returns<
    {
      id: string
      user_id: string
      system_id: string
      accessed_at: string
      systems: { name: string } | null
      profiles: { name: string | null; email: string | null } | null
    }[]
  >()

  if (error) throw new Error(`Falha ao carregar logs de acesso: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    system_id: row.system_id,
    accessed_at: row.accessed_at,
    system_name: row.systems?.name ?? null,
    user_name: row.profiles?.name ?? null,
    user_email: row.profiles?.email ?? null,
  }))
}
