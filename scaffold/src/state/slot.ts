import { onMockReset } from './reset'
import { readStored, removeStored, writeStored } from './storage'

/**
 * Одно значение с временем жизни в `sessionStorage` (отложенное действие, `premium_intent`).
 * Истёкшее значение игнорируется и стирается. `now` можно подставить: так проверяется срок.
 */
export function createSlot<T extends { readonly expiresAt: number }>(name: string, isValid: (value: unknown) => value is T) {
  let loaded = false
  let value: T | null = null

  function load(): void {
    if (loaded) return
    loaded = true
    value = readStored('session', name, isValid)
  }

  function clear(): void {
    loaded = true
    value = null
    removeStored('session', name)
  }

  function peek(now: number = Date.now()): T | null {
    load()
    if (value !== null && value.expiresAt <= now) clear()
    return value
  }

  function save(next: T): void {
    loaded = true
    value = next
    writeStored('session', name, next)
  }

  /** Возвращает значение и стирает его: повторный вызов вернёт `null`. */
  function take(now: number = Date.now()): T | null {
    const current = peek(now)
    if (current !== null) clear()
    return current
  }

  // Хранилище к этому моменту уже стёрто: достаточно забыть память и перечитать при следующем обращении.
  onMockReset(() => {
    loaded = false
    value = null
  })

  return { peek, save, take, clear }
}
