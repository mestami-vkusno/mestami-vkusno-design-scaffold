import { getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { createSlot } from './slot'
import { isSignedIn } from './session'
import type { PendingAction, PendingActionInput, PendingActionType, PendingObjectType, SourceSurface } from './types'

/*
  Гейт авторизации (ТЗ §5.1–5.2). Стены регистрации нет: гость свободно смотрит, а на значимом действии
  `requireAuth` запоминает действие, ведёт на `/auth`, и после входа страница исполняет его через `consumePendingAction()`.
*/

export const AUTH_ROUTE = '/auth'

/** Сколько живёт отложенное действие; истёкшее игнорируется. */
export const PENDING_TTL_MS = 30 * 60 * 1000

const ACTION_TYPES: readonly PendingActionType[] = ['favorite', 'follow', 'like', 'comment', 'save', 'visit', 'rating', 'review', 'create', 'premium', 'ai', 'report', 'hide']
const OBJECT_TYPES: readonly PendingObjectType[] = ['venue', 'author', 'post', 'collection', 'event', 'menu_item', 'premium', 'ai']

/** Адрес возврата — только внутри приложения: `//host` и внешние ссылки заменяются на главную. */
export function safeReturnUrl(url: string | undefined): string {
  return url !== undefined && url.startsWith('/') && !url.startsWith('//') ? url : '/'
}

function currentUrl(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search + window.location.hash
}

function isPendingAction(value: unknown): value is PendingAction {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof PendingAction, unknown>>
  return (
    ACTION_TYPES.includes(item.actionType as PendingActionType) &&
    OBJECT_TYPES.includes(item.objectType as PendingObjectType) &&
    (item.objectId === null || typeof item.objectId === 'string') &&
    typeof item.returnUrl === 'string' &&
    typeof item.sourceSurface === 'string' &&
    typeof item.expiresAt === 'number'
  )
}

const slot = createSlot<PendingAction>('pending', isPendingAction)

type Navigate = (to: string) => void
let navigate: Navigate | null = null

/** Как вести на `/auth`. Обычно ставится сам (`bindRouter`), явный вызов нужен вне компонентов, например в проверочном скрипте. */
export function setAuthNavigator(next: Navigate | null): void {
  navigate = next
}

/** Подключает роутер приложения. Вызывается в `setup` из `useAuthGate`, `useLibrary`, `usePremium`; вне компонента ничего не делает. */
export function bindRouter(): void {
  if (navigate !== null || getCurrentInstance() === null) return
  const router = useRouter()
  navigate = (to) => void router.push(to)
}

function goTo(path: string): void {
  if (navigate !== null) navigate(path)
  else if (typeof window !== 'undefined') window.location.assign(path)
}

/**
 * Для значимого действия: вошедшему — `true` (выполняйте действие), гостю — `false`: действие сохранено
 * как отложенное, открыт `/auth`. Адрес возврата по умолчанию — текущая страница.
 */
export function requireAuth(input: PendingActionInput, now: number = Date.now()): boolean {
  if (isSignedIn.value) return true
  slot.save({
    ...input,
    returnUrl: safeReturnUrl(input.returnUrl ?? currentUrl()),
    sourceSurface: input.sourceSurface ?? 'other',
    expiresAt: now + PENDING_TTL_MS,
  })
  goTo(AUTH_ROUTE)
  return false
}

/**
 * После входа: возвращает отложенное действие (в нём `returnUrl`) и стирает его. У гостя и при истёкшем сроке — `null`,
 * действие гостя при этом не съедается: его заберёт вошедший.
 */
export function consumePendingAction(now: number = Date.now()): PendingAction | null {
  return isSignedIn.value ? slot.take(now) : null
}

/** Что ждёт входа, без стирания (экран входа может сказать «войдите, чтобы сохранить в Избранное»). */
export function peekPendingAction(now: number = Date.now()): PendingAction | null {
  return slot.peek(now)
}

/** Пользователь ушёл со входа, не завершив его: отложенное действие больше не нужно. */
export function discardPendingAction(): void {
  slot.clear()
}

export type { PendingAction, PendingActionInput, PendingActionType, PendingObjectType, SourceSurface }

export function useAuthGate() {
  bindRouter()
  return { requireAuth, consumePendingAction, peekPendingAction, discardPendingAction, isSignedIn }
}
