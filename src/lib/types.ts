/**
 * Tipos do domínio do SAL HUB.
 *
 * A cadeia de autorização do portal é sempre:
 *   USER -> ROLE -> PERMISSIONS -> SYSTEMS
 * Nenhuma regra de negócio depende do NOME do perfil: a lista de sistemas de
 * cada perfil vem de role_system_permissions, gerenciada pela administração.
 */

export const ROLE_ADMIN = 'ADMIN' as const

export type SystemType = 'system' | 'indicator'

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SystemRecord {
  id: string
  name: string
  description: string | null
  url: string
  icon: string | null
  /** Marca exibida no card; vazio cai para o favicon do dominio e depois monograma. */
  logo_url: string | null
  category_id: string | null
  type: SystemType
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

/** Sistema já resolvido com o nome da categoria, como a UI consome. */
export interface SystemWithCategory extends SystemRecord {
  category_name: string | null
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

/** Profile com o nome do perfil resolvido. */
export interface ProfileWithRole extends Profile {
  role_name: string | null
}

export interface RoleSystemPermission {
  id: string
  role_id: string
  system_id: string
  can_view: boolean
  created_at: string
}

export interface AccessLog {
  id: string
  user_id: string
  system_id: string
  accessed_at: string
}

export interface AccessLogEntry extends AccessLog {
  system_name: string | null
  user_name: string | null
  user_email: string | null
}

export interface Favorite {
  id: string
  user_id: string
  system_id: string
  created_at: string
}

/** Sessão resolvida do usuário autenticado, usada pelas páginas do servidor. */
export interface HubSession {
  userId: string
  email: string | null
  profile: ProfileWithRole
  isAdmin: boolean
}
