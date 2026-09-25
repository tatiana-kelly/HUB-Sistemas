import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getAllSystems, getRolePermissions, getRoles } from '@/lib/queries'
import { PermissionsManager } from '@/app/admin/permissions/PermissionsManager'

export const metadata: Metadata = { title: 'Permissões — Administração SAL HUB' }

export default async function AdminPermissionsPage() {
  await requireAdmin()
  const [roles, systems, permissions] = await Promise.all([
    getRoles(),
    getAllSystems(),
    getRolePermissions(),
  ])

  return <PermissionsManager roles={roles} systems={systems} permissions={permissions} />
}
