import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLE_ADMIN, type HubSession, type ProfileWithRole } from '@/lib/types'

interface ProfileRow {
  id: string
  name: string | null
  email: string | null
  role_id: string | null
  active: boolean
  created_at: string
  updated_at: string
  roles: { name: string } | null
}

/**
 * Resolve a sessão do HUB: usuário do Auth + profile + perfil (role).
 * Retorna null quando não há sessão válida.
 */
export async function getSession(): Promise<HubSession | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, name, email, role_id, active, created_at, updated_at, roles(name)')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>()

  if (!data) return null

  const profile: ProfileWithRole = {
    id: data.id,
    name: data.name,
    email: data.email,
    role_id: data.role_id,
    active: data.active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    role_name: data.roles?.name ?? null,
  }

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    isAdmin: profile.active && profile.role_name === ROLE_ADMIN,
  }
}

/** Exige sessão válida e ativa. Redireciona para /login caso contrário. */
export async function requireSession(): Promise<HubSession> {
  const session = await getSession()

  if (!session) redirect('/login')
  if (!session.profile.active) redirect('/login?erro=inativo')

  return session
}

/**
 * Exige perfil ADMIN. Um não-admin é devolvido para /home — e, mesmo que
 * burlasse esta checagem, o RLS bloquearia toda escrita administrativa.
 */
export async function requireAdmin(): Promise<HubSession> {
  const session = await requireSession()
  if (!session.isAdmin) redirect('/home?erro=sem-permissao')
  return session
}
