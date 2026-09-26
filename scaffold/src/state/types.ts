/*
  Общие типы слоя состояния: результат мутации и отложенное действие гостя (ТЗ §5.2).
  Мутации не бросают исключений: ожидаемая неудача — обычный результат с причиной.
*/

/** Почему действие не выполнено. `auth_required` — гость отправлен на вход, действие сохранено как отложенное. */
export type FailureReason =
  | 'auth_required'
  | 'not_found'
  | 'blocked'
  | 'self_action'
  | 'invalid_value'
  | 'invalid_date'
  | 'future_date'
  | 'empty_text'
  | 'rating_required'
  | 'comments_disabled'
  | 'age_confirmation_required'
  | 'already_active'
  | 'not_active'
  | 'venue_required'
  | 'empty_content'
  | 'consent_required'
  | 'duplicate_venue'
  | 'title_required'
  | 'no_items'

export interface Failure {
  readonly ok: false
  readonly reason: FailureReason
}

export type Success<T extends object = object> = { readonly ok: true } & T

export type MutationResult<T extends object = object> = Success<T> | Failure

export function fail(reason: FailureReason): Failure {
  return { ok: false, reason }
}

export function succeed<T extends object = object>(value?: T): Success<T> {
  return { ok: true, ...value } as Success<T>
}

// ── Отложенное действие, §5.2 ─────────────────────────────────────────────

/** Значимые действия, которые запускают вход у гостя (§5.1). Повторно исполняются как «включить», а не «переключить». */
export type PendingActionType = 'favorite' | 'follow' | 'like' | 'comment' | 'save' | 'visit' | 'rating' | 'review' | 'create' | 'premium' | 'ai' | 'report' | 'hide'

export type PendingObjectType = 'venue' | 'author' | 'post' | 'collection' | 'event' | 'menu_item' | 'premium' | 'ai'

/** Откуда пришло действие (`source_surface`): экран, на котором гость нажал. */
export type SourceSurface = 'home' | 'search' | 'venue' | 'menu_item' | 'events' | 'event' | 'feed' | 'post' | 'author' | 'collection' | 'me' | 'premium' | 'ai' | 'other'

/** Параметры действия, которые нужны для повтора после входа: значение оценки, текст отзыва, дата Посещения. */
export type PendingPayload = Readonly<Record<string, string | number | boolean>>

/** Отложенное действие: поля §5.2 в camelCase. `expiresAt` — миллисекунды эпохи, действие живёт `PENDING_TTL_MS`. */
export interface PendingAction {
  readonly actionType: PendingActionType
  readonly objectType: PendingObjectType
  readonly objectId: string | null
  readonly returnUrl: string
  readonly sourceSurface: SourceSurface
  readonly expiresAt: number
  readonly payload?: PendingPayload
}

/** То, что передаёт страница: адрес возврата по умолчанию — текущий, экран — `other`. */
export type PendingActionInput = Omit<PendingAction, 'expiresAt' | 'returnUrl' | 'sourceSurface'> & {
  readonly returnUrl?: string
  readonly sourceSurface?: SourceSurface
}

/** Откуда пришло действие пользователя; страница передаёт, чтобы после входа вернуться на неё. */
export interface ActionOrigin {
  readonly returnUrl?: string
  readonly sourceSurface?: SourceSurface
}
