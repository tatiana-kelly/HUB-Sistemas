import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getCategories } from '@/lib/queries'
import { CategoriesManager } from '@/app/admin/categories/CategoriesManager'

export const metadata: Metadata = { title: 'Categorias — Administração SAL HUB' }

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await getCategories(false)

  return <CategoriesManager categories={categories} />
}
