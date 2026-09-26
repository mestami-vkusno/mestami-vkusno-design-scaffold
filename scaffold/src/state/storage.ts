/*
  Хранилище состояния мока: `localStorage` (переживает перезагрузку) и `sessionStorage` (живёт, пока открыта вкладка).
  Доступ к ним может быть закрыт (приватный режим, запрет сайта, переполнение) — тогда каждая операция молча
  ничего не делает, а состояние живёт в памяти до перезагрузки. Значение лежит в конверте с версией схемы:
  при смене версии старые данные игнорируются, а не ломают страницу.
*/

/** Все ключи мока начинаются с этого префикса — по нему `clearStored()` находит их и стирает. */
const PREFIX = 'mv-state:'
/** Поднимать при несовместимом изменении формы хранимых данных. */
const SCHEMA_VERSION = 1

export type StorageArea = 'local' | 'session'

interface Envelope {
  v: number
  data: unknown
}

function open(area: StorageArea): Storage | null {
  try {
    return area === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

function isEnvelope(value: unknown): value is Envelope {
  return typeof value === 'object' && value !== null && 'v' in value && 'data' in value
}

/** Читает значение и проверяет его форму; при любой неудаче (нет доступа, битый JSON, чужая версия, не та форма) — `null`. */
export function readStored<T>(area: StorageArea, name: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = open(area)?.getItem(PREFIX + name)
    if (raw === null || raw === undefined) return null
    const envelope: unknown = JSON.parse(raw)
    if (!isEnvelope(envelope) || envelope.v !== SCHEMA_VERSION) return null
    return isValid(envelope.data) ? envelope.data : null
  } catch {
    return null
  }
}

/** Записывает значение; `false`, если хранилище недоступно (состояние остаётся только в памяти). */
export function writeStored(area: StorageArea, name: string, data: unknown): boolean {
  try {
    const storage = open(area)
    if (storage === null) return false
    storage.setItem(PREFIX + name, JSON.stringify({ v: SCHEMA_VERSION, data } satisfies Envelope))
    return true
  } catch {
    return false
  }
}

export function removeStored(area: StorageArea, name: string): void {
  try {
    open(area)?.removeItem(PREFIX + name)
  } catch {
    /* хранилище недоступно: удалять нечего */
  }
}

/** Стирает всё состояние мока в обеих областях. Чужие ключи (например, выбор города) не трогает. */
export function clearStored(): void {
  for (const area of ['local', 'session'] as const) {
    try {
      const storage = open(area)
      if (storage === null) continue
      const keys: string[] = []
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (key !== null && key.startsWith(PREFIX)) keys.push(key)
      }
      for (const key of keys) storage.removeItem(key)
    } catch {
      /* хранилище недоступно: стирать нечего */
    }
  }
}
