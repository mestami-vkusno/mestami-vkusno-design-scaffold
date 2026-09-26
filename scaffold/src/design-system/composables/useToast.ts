import { readonly, shallowReactive } from 'vue'
import type { ToastItem, ToastOptions } from '../components/molecules/UiToast/types'

/** По умолчанию тост живёт 4 с, а с кнопкой действия — 8 с: успеть прочитать и нажать. */
export const TOAST_DURATION_MS = 4000
export const TOAST_ACTION_DURATION_MS = 8000

// Один общий список на всё приложение: тосты показываются из любого места, а рисует их единственный UiToast.
const items = shallowReactive<ToastItem[]>([])
let counter = 0

/** Кто сейчас рисует тосты: регион монтируется один раз, лишние экземпляры молчат. */
let host: symbol | null = null

export function claimToastHost(id: symbol): boolean {
  if (host === null) host = id
  return host === id
}

export function releaseToastHost(id: symbol): void {
  if (host === id) host = null
}

export function isToastHost(id: symbol): boolean {
  return host === id
}

/**
 * Очередь уведомлений. `show()` возвращает id, по нему тост можно закрыть раньше срока.
 * Рисует их `<UiToast />`, который нужно смонтировать один раз в оболочке приложения.
 */
export function useToast() {
  function show(options: ToastOptions): number {
    const id = ++counter
    items.push({ ...options, id })
    return id
  }

  function dismiss(id: number): void {
    const index = items.findIndex((item) => item.id === id)
    if (index !== -1) items.splice(index, 1)
  }

  function clear(): void {
    items.splice(0, items.length)
  }

  return { toasts: readonly(items), show, dismiss, clear }
}
