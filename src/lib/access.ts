import type { SystemWithCategory } from '@/lib/types'

/**
 * Regras puras de apresentação do portal — sem dependência de banco, para poder
 * ser testadas isoladamente. Nada aqui decide permissão: quem decide é o RLS.
 */

/** Normaliza texto para busca: minúsculas e sem acento. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Busca em tempo real por nome, descrição e categoria. */
export function filterSystems(
  systems: SystemWithCategory[],
  term: string,
  categoryName: string | null,
): SystemWithCategory[] {
  const query = normalize(term)

  return systems.filter((system) => {
    if (categoryName && system.category_name !== categoryName) return false
    if (query === '') return true

    const haystack = normalize(
      [system.name, system.description ?? '', system.category_name ?? ''].join(' '),
    )
    return haystack.includes(query)
  })
}

export interface SystemGroup {
  category: string
  systems: SystemWithCategory[]
}

/** Agrupa por categoria preservando a ordem de exibição dos sistemas. */
export function groupByCategory(systems: SystemWithCategory[]): SystemGroup[] {
  const groups = new Map<string, SystemWithCategory[]>()

  for (const system of systems) {
    const key = system.category_name ?? 'Outros'
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(system)
    } else {
      groups.set(key, [system])
    }
  }

  return [...groups.entries()].map(([category, items]) => ({ category, systems: items }))
}

/** Saudação conforme o horário local. */
export function greeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Primeiro nome, para uso na saudação. */
export function firstName(name: string | null | undefined, email?: string | null): string {
  const source = name?.trim() || email?.split('@')[0] || ''
  const first = source.split(/\s+/)[0] ?? ''
  if (first === '') return 'colaborador'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

/** "hoje 13:20" / "ontem 17:30" / "23/09 08:14" — formato dos últimos acessos. */
export function formatAccessMoment(value: string | Date, now: Date = new Date()): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)

  if (diffDays === 0) return `hoje ${time}`
  if (diffDays === 1) return `ontem ${time}`

  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${day} ${time}`
}

/**
 * Deduplica o histórico de acessos mantendo apenas o acesso mais recente de cada
 * sistema, limitado a `limit` itens. A lista de entrada deve vir ordenada do mais
 * recente para o mais antigo.
 */
export function lastAccessesBySystem<T extends { system_id: string }>(
  logs: T[],
  limit = 8,
): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const log of logs) {
    if (seen.has(log.system_id)) continue
    seen.add(log.system_id)
    result.push(log)
    if (result.length >= limit) break
  }

  return result
}

/** Valida URL externa de sistema: só http/https é aceito. */
export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
