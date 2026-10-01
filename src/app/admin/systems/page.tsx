import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getAllSystems, getCategories, getRolePermissions, getRoles } from '@/lib/queries'
import { SystemsManager } from '@/app/admin/systems/SystemsManager'

export const metadata: Metadata = { title: 'Sistemas — Administração SAL HUB' }

export default async function AdminSystemsPage() {
  await requireAdmin()
  const [systems, categories, roles, permissions] = await Promise.all([
    getAllSystems(),
    getCategories(false),
    getRoles(),
    getRolePermissions(),
  ])

  return (
    <SystemsManager
      systems={systems}
      categories={categories}
      roles={roles}
      permissions={permissions}
    />
  )
}
