import { readonly, ref } from 'vue'
import type { ThemeName } from '../types'

const STORAGE_KEY = 'mv-theme'
const THEME_COLOR: Record<ThemeName, string> = { dark: '#0D0D0D', light: '#FFFFFF' }

const theme = ref<ThemeName>('dark')

function readSaved(): ThemeName {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function applyToDocument(next: ThemeName): void {
  document.documentElement.setAttribute('data-theme', next)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next])
}

/** Вызывается один раз до монтирования приложения: применяет сохранённую тему без мигания. */
export function initTheme(): void {
  theme.value = readSaved()
  applyToDocument(theme.value)
}

/** Тема по умолчанию тёмная и не зависит от настроек системы; выбор пользователя запоминается. */
export function useTheme() {
  function setTheme(next: ThemeName): void {
    theme.value = next
    applyToDocument(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* хранилище недоступно: тема живёт до перезагрузки */
    }
  }

  return { theme: readonly(theme), setTheme }
}
