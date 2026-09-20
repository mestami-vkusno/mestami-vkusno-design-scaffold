import { nextTick, readonly, ref } from 'vue'
import { cubicBezierCss, DURATION, EASE } from '../motion'
import type { ThemeName } from '../types'
import { useMotion } from './useMotion'

const STORAGE_KEY = 'mv-theme'
const THEME_COLOR: Record<ThemeName, string> = { dark: '#0D0D0D', light: '#FFFFFF' }

/** `reveal` — круг от места нажатия, `fade` — плавное затухание, `none` — мгновенно. */
export type ThemeTransitionMode = 'reveal' | 'fade' | 'none'

const theme = ref<ThemeName>('dark')
const transitionMode = ref<ThemeTransitionMode>('reveal')
const pointer = { x: 0, y: 0 }

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
  // Круг перерисовывает весь экран на каждом кадре: на телефонах по умолчанию дешёвое затухание.
  transitionMode.value = window.matchMedia('(pointer: coarse)').matches ? 'fade' : 'reveal'
  pointer.x = window.innerWidth / 2
  window.addEventListener(
    'pointerdown',
    (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    },
    { capture: true, passive: true },
  )
}

/**
 * Тема по умолчанию тёмная и не зависит от настроек системы; выбор пользователя запоминается.
 * Смена темы идёт через View Transitions API: там, где его нет, тема меняется мгновенно.
 */
export function useTheme() {
  const { isReduced, scale } = useMotion()

  function commit(next: ThemeName): void {
    theme.value = next
    applyToDocument(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* хранилище недоступно: тема живёт до перезагрузки */
    }
  }

  function setTheme(next: ThemeName): void {
    if (next === theme.value) return
    const root = document.documentElement
    const mode = transitionMode.value
    if (mode === 'none' || typeof document.startViewTransition !== 'function') {
      commit(next)
      return
    }

    // При уменьшенном движении круг заменяется затуханием: меняется только прозрачность.
    const effective = mode === 'reveal' && isReduced.value ? 'fade' : mode
    root.setAttribute('data-theme-transition', effective)
    const transition = document.startViewTransition(async () => {
      commit(next)
      await nextTick()
    })

    if (effective === 'reveal') {
      const { x, y } = pointer
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      void transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: DURATION.theme * 1000 * scale.value, easing: cubicBezierCss(EASE.out), pseudoElement: '::view-transition-new(root)' },
        )
      }, () => undefined)
    }

    void transition.finished.finally(() => root.removeAttribute('data-theme-transition'))
  }

  return {
    theme: readonly(theme),
    setTheme,
    transitionMode,
    setTransitionMode: (mode: ThemeTransitionMode) => {
      transitionMode.value = mode
    },
  }
}
