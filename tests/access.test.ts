import { describe, expect, it } from 'vitest'
import {
  filterSystems,
  firstName,
  formatAccessMoment,
  greeting,
  groupByCategory,
  isSafeExternalUrl,
  lastAccessesBySystem,
  normalize,
} from '@/lib/access'
import type { SystemWithCategory } from '@/lib/types'

function system(overrides: Partial<SystemWithCategory>): SystemWithCategory {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? 'Sistema',
    description: overrides.description ?? null,
    url: overrides.url ?? 'https://exemplo.com',
    icon: overrides.icon ?? null,
    category_id: overrides.category_id ?? null,
    type: overrides.type ?? 'system',
    display_order: overrides.display_order ?? 1,
    active: overrides.active ?? true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    category_name: overrides.category_name ?? null,
  }
}

const CATALOGO: SystemWithCategory[] = [
  system({ id: '1', name: 'SSW', description: 'Sistema operacional', category_name: 'Operações' }),
  system({
    id: '2',
    name: 'Agente Rastreamento de Cargas',
    description: 'Rastreamento em tempo real',
    category_name: 'Operações',
  }),
  system({
    id: '3',
    name: 'DRE Operacional',
    description: 'Resultado por filial',
    category_name: 'Gestão',
    type: 'indicator',
  }),
  system({ id: '4', name: 'Rota People', description: 'Gente e gestão', category_name: 'RH / DP' }),
  system({
    id: '5',
    name: 'Power BI',
    description: 'Painéis analíticos',
    category_name: 'Indicadores',
    type: 'indicator',
  }),
]

describe('normalize', () => {
  it('remove acento e caixa para permitir busca tolerante', () => {
    expect(normalize('Operações')).toBe('operacoes')
    expect(normalize('  Gestão ')).toBe('gestao')
  })
})

describe('filterSystems', () => {
  it('devolve tudo quando não há busca nem filtro', () => {
    expect(filterSystems(CATALOGO, '', null)).toHaveLength(5)
  })

  it('busca por nome ignorando acento e caixa', () => {
    const result = filterSystems(CATALOGO, 'rastreamento', null)
    expect(result.map((item) => item.name)).toEqual(['Agente Rastreamento de Cargas'])
  })

  it('busca por descrição', () => {
    const result = filterSystems(CATALOGO, 'resultado por filial', null)
    expect(result.map((item) => item.id)).toEqual(['3'])
  })

  it('busca por categoria', () => {
    const result = filterSystems(CATALOGO, 'operacoes', null)
    expect(result.map((item) => item.id)).toEqual(['1', '2'])
  })

  it('filtra por categoria selecionada', () => {
    const result = filterSystems(CATALOGO, '', 'Indicadores')
    expect(result.map((item) => item.name)).toEqual(['Power BI'])
  })

  it('combina filtro de categoria com busca', () => {
    expect(filterSystems(CATALOGO, 'ssw', 'Gestão')).toHaveLength(0)
    expect(filterSystems(CATALOGO, 'dre', 'Gestão')).toHaveLength(1)
  })
})

describe('groupByCategory', () => {
  it('agrupa mantendo a ordem de entrada e usa Outros para sistema sem categoria', () => {
    const grupos = groupByCategory([...CATALOGO, system({ id: '6', name: 'Avulso' })])
    expect(grupos.map((grupo) => grupo.category)).toEqual([
      'Operações',
      'Gestão',
      'RH / DP',
      'Indicadores',
      'Outros',
    ])
    expect(grupos[0]?.systems).toHaveLength(2)
  })
})

describe('greeting', () => {
  it('varia conforme o horário', () => {
    expect(greeting(new Date(2026, 0, 1, 8, 0))).toBe('Bom dia')
    expect(greeting(new Date(2026, 0, 1, 13, 0))).toBe('Boa tarde')
    expect(greeting(new Date(2026, 0, 1, 20, 0))).toBe('Boa noite')
  })
})

describe('firstName', () => {
  it('usa o primeiro nome capitalizado', () => {
    expect(firstName('tatiana silva')).toBe('Tatiana')
  })

  it('cai para o usuário do e-mail quando não há nome', () => {
    expect(firstName(null, 'joao.silva@salexpress.com.br')).toBe('Joao.silva')
  })

  it('tem fallback genérico', () => {
    expect(firstName(null, null)).toBe('colaborador')
  })
})

describe('formatAccessMoment', () => {
  const agora = new Date(2026, 8, 25, 15, 0)

  it('marca acessos do mesmo dia como hoje', () => {
    expect(formatAccessMoment(new Date(2026, 8, 25, 13, 20), agora)).toBe('hoje 13:20')
  })

  it('marca o dia anterior como ontem', () => {
    expect(formatAccessMoment(new Date(2026, 8, 24, 17, 30), agora)).toBe('ontem 17:30')
  })

  it('usa dia/mês para datas mais antigas', () => {
    expect(formatAccessMoment(new Date(2026, 8, 20, 8, 5), agora)).toBe('20/09 08:05')
  })

  it('não quebra com valor inválido', () => {
    expect(formatAccessMoment('data-invalida', agora)).toBe('—')
  })
})

describe('lastAccessesBySystem', () => {
  it('mantém apenas o acesso mais recente de cada sistema', () => {
    const logs = [
      { id: 'a', system_id: '1' },
      { id: 'b', system_id: '2' },
      { id: 'c', system_id: '1' },
      { id: 'd', system_id: '3' },
    ]
    expect(lastAccessesBySystem(logs).map((log) => log.id)).toEqual(['a', 'b', 'd'])
  })

  it('respeita o limite de itens', () => {
    const logs = Array.from({ length: 20 }, (_, index) => ({
      id: String(index),
      system_id: String(index),
    }))
    expect(lastAccessesBySystem(logs, 8)).toHaveLength(8)
  })
})

describe('isSafeExternalUrl', () => {
  it('aceita apenas http e https', () => {
    expect(isSafeExternalUrl('https://sistema.ssw.inf.br/bin/ssw0422')).toBe(true)
    expect(isSafeExternalUrl('http://interno.local')).toBe(true)
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('data:text/html,<script>')).toBe(false)
    expect(isSafeExternalUrl('ssw0422')).toBe(false)
  })
})
