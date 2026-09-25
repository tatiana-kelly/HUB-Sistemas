export const THEME_STORAGE_KEY = 'sal-hub-theme'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}

/**
 * Script inline executado antes da primeira pintura: lê a preferência salva e já
 * aplica o atributo no <html>. Sem isso, o dark mode piscaria branco a cada
 * navegação. Mantido como string para rodar antes do bundle do React.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var p=localStorage.getItem(k);
if(p!=='light'&&p!=='dark'&&p!=='system')p='system';
var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
var e=document.documentElement;
e.setAttribute('data-theme',d?'dark':'light');
e.setAttribute('data-theme-preference',p);
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`
