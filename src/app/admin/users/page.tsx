import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getProfiles, getRoles } from '@/lib/queries'
import { hasServiceRoleKey } from '@/lib/supabase/admin'
import { UsersManager } from '@/app/admin/users/UsersManager'

export const metadata: Metadata = { title: 'Usuários — Administração SAL HUB' }

export default async function AdminUsersPage() {
  const session = await requireAdmin()
  const [profiles, roles] = await Promise.all([getProfiles(), getRoles()])

  return (
    <UsersManager
      profiles={profiles}
      roles={roles}
      currentUserId={session.userId}
      serviceRoleAvailable={hasServiceRoleKey()}
    />
  )
}
