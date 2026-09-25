import { describe, expect, it } from 'vitest'
import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
} from '@/components/theme/theme'

describe('isThemePreference', () => {
  it('aceita apenas as três preferências válidas', () => {
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('system')).toBe(true)
  })

  it('rejeita valor corrompido vindo do storage', () => {
    expect(isThemePreference('escuro')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
    expect(isThemePreference(1)).toBe(false)
  })
})

describe('resolveTheme', () => {
  it('a escolha explícita ignora a preferência do sistema', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('no modo automático segue o sistema', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

describe('script de bootstrap do tema', () => {
  /**
   * Roda o script num DOM e localStorage falsos, do mesmo jeito que o navegador
   * faria antes da primeira pintura — é o que evita o flash de tela clara.
   */
  function run(stored: string | null, systemPrefersDark: boolean) {
    const attributes: Record<string, string> = {}
    const context = {
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: systemPrefersDark }),
      document: {
        documentElement: {
          setAttribute: (name: string, value: string) => {
            attributes[name] = value
          },
        },
      },
    }

    new Function('window', 'localStorage', 'document', THEME_BOOTSTRAP_SCRIPT)(
      context,
      context.localStorage,
      context.document,
    )

    return attributes
  }

  it('aplica a preferência salva antes da pintura', () => {
    expect(run('dark', false)['data-theme']).toBe('dark')
    expect(run('light', true)['data-theme']).toBe('light')
  })

  it('no modo automático resolve pela preferência do sistema', () => {
    expect(run('system', true)['data-theme']).toBe('dark')
    expect(run('system', false)['data-theme']).toBe('light')
  })

  it('sem nada salvo, assume automático', () => {
    const attributes = run(null, true)
    expect(attributes['data-theme']).toBe('dark')
    expect(attributes['data-theme-preference']).toBe('system')
  })

  it('valor inválido no storage não quebra a página', () => {
    const attributes = run('roxo', false)
    expect(attributes['data-theme']).toBe('light')
    expect(attributes['data-theme-preference']).toBe('system')
  })

  it('usa a mesma chave de storage que o provider', () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(JSON.stringify(THEME_STORAGE_KEY))
  })
})
