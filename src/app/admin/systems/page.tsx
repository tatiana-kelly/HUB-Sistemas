import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getAllSystems, getCategories } from '@/lib/queries'
import { SystemsManager } from '@/app/admin/systems/SystemsManager'

export const metadata: Metadata = { title: 'Sistemas — Administração SAL HUB' }

export default async function AdminSystemsPage() {
  await requireAdmin()
  const [systems, categories] = await Promise.all([getAllSystems(), getCategories(false)])

  return <SystemsManager systems={systems} categories={categories} />
}
