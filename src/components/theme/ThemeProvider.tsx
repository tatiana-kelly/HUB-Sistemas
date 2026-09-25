'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/components/theme/theme'

interface ThemeContextValue {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

/*
 * O tema é estado do navegador (localStorage + preferência do sistema), não do
 * React. Por isso ele é lido com useSyncExternalStore: nada de efeito que
 * sincroniza estado depois da montagem, e a leitura no servidor é explícita.
 * O snapshot é uma string "preferência|resolvido" para manter a identidade
 * estável entre renders.
 */

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  // No modo automático, a troca de tema do sistema precisa repintar o documento,
  // não só avisar o React — o atributo no <html> é quem comanda os tokens.
  const media = window.matchMedia(DARK_QUERY)
  function onMediaChange() {
    applyToDocument(readPreference())
    emit()
  }
  media.addEventListener('change', onMediaChange)

  // Mantém as abas abertas em sincronia.
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY) {
      applyToDocument(readPreference())
      emit()
    }
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(onStoreChange)
    media.removeEventListener('change', onMediaChange)
    window.removeEventListener('storage', onStorage)
  }
}

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function applyToDocument(preference: ThemePreference): ResolvedTheme {
  const theme = resolveTheme(preference, window.matchMedia(DARK_QUERY).matches)
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-theme-preference', preference)
  return theme
}

function getSnapshot(): string {
  const preference = readPreference()
  const resolved = resolveTheme(preference, window.matchMedia(DARK_QUERY).matches)
  return `${preference}|${resolved}`
}

/** No servidor não há preferência conhecida; o script de bootstrap corrige antes da pintura. */
function getServerSnapshot(): string {
  return 'system|light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [preference, resolved] = snapshot.split('|') as [ThemePreference, ResolvedTheme]

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Navegação privada ou storage bloqueado: o tema vale para esta sessão.
    }
    applyToDocument(next)
    emit()
  }, [])

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return context
}
