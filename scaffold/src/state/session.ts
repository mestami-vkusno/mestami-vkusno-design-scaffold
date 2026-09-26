import { computed, shallowRef } from 'vue'
import { onMockReset } from './reset'
import { readStored, writeStored } from './storage'

/*
  Сессия мока: гость или тестовый пользователь «Мария» (`MOCK_USER`). Лёгкий модуль основного чанка —
  данных моков он не импортирует: идентификатор и имя лежат здесь константами, а совпадение идентификатора
  с `MOCK_USER_ID` проверяет компилятор в `library-state.ts`.
*/

/** Идентификатор тестового пользователя; должен совпадать с `MOCK_USER_ID` из `@/mocks/library`. */
export const VIEWER_ID = 'u-maria'

/** Вошедший пользователь для шапки и страниц. */
export interface SessionViewer {
  readonly id: typeof VIEWER_ID
  readonly name: string
}

const MOCK_VIEWER: SessionViewer = { id: VIEWER_ID, name: 'Мария' }

interface StoredSession {
  readonly userId: typeof VIEWER_ID | null
}

function isStoredSession(value: unknown): value is StoredSession {
  return typeof value === 'object' && value !== null && 'userId' in value && (value.userId === VIEWER_ID || value.userId === null)
}

const viewer = shallowRef<SessionViewer | null>(readStored('local', 'session', isStoredSession)?.userId === VIEWER_ID ? MOCK_VIEWER : null)

function persist(): void {
  writeStored('local', 'session', { userId: viewer.value?.id ?? null } satisfies StoredSession)
}

onMockReset(() => {
  viewer.value = null
})

/** Вход в моке: без почты и кода ставит тестового пользователя. Настоящий экран входа — страница `/auth` (задача 0009). */
export function signIn(): SessionViewer {
  viewer.value = MOCK_VIEWER
  persist()
  return MOCK_VIEWER
}

/** Выход: возвращает гостя. Библиотека пользователя сохраняется и снова видна после входа. */
export function signOut(): void {
  viewer.value = null
  persist()
}

/** `true` для вошедшего; читается реактивно (`.value`). */
export const isSignedIn = computed<boolean>(() => viewer.value !== null)

/** Идентификатор вошедшего пользователя; у гостя — `null`. Для селекторов, которым нужен `userId`. */
export const currentUserId = computed<typeof VIEWER_ID | null>(() => viewer.value?.id ?? null)

/** Сессия: гость (`viewer === null`) или тестовый пользователь. */
export function useViewer() {
  return { viewer: computed(() => viewer.value), userId: currentUserId, isSignedIn, signIn, signOut }
}
