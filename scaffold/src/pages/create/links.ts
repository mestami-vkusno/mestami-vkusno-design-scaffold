/*
  Адреса редакторов (C0, CR1–CR4) и вход в них. Лёгкий файл без данных и Vue-компонентов: его берут и страницы
  заведения, «Мое» и публикации, чтобы вести в редактор, не подтягивая сам редактор в свой чанк.
  Контекст (заведение, блюдо, событие, Посещение) передаётся в адресе и предзаполняет редактор (§13.2), а `draft` — открывает черновик.
*/
import type { Router } from 'vue-router'
import { requireAuth } from '@/state/auth-gate'
import type { SourceSurface } from '@/state/types'

export const POST_EDITOR = '/create/post'
export const COLLECTION_EDITOR = '/create/collection'
export const REVIEW_EDITOR = '/create/review'
export const VISIT_EDITOR = '/create/visit'

export interface PostEditorContext {
  readonly venueId?: string
  readonly menuItemId?: string
  readonly eventId?: string
  readonly visitId?: string
  readonly draftId?: string
  /** Видимость поверх значения по умолчанию: «Новая запись» в Дневнике — `private`, «Сделать публичной» — `public`. */
  readonly visibility?: 'public' | 'private'
}

function withQuery(path: string, params: Readonly<Record<string, string | undefined>>): string {
  const query = Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  return query === '' ? path : `${path}?${query}`
}

export function postEditorUrl({ venueId, menuItemId, eventId, visitId, draftId, visibility }: PostEditorContext = {}): string {
  return withQuery(POST_EDITOR, { draft: draftId, venue: venueId, item: menuItemId, event: eventId, visit: visitId, visibility })
}

export function collectionEditorUrl(draftId?: string): string {
  return withQuery(COLLECTION_EDITOR, { draft: draftId })
}

/** CR3: оценка и отзыв; `visit` — если пришли из Посещения. */
export function reviewEditorUrl(venueId?: string, visitId?: string): string {
  return withQuery(REVIEW_EDITOR, { venue: venueId, visit: visitId })
}

/** CR4: добавление Посещения; `event` — событие, `forDraft` — публикация, в которую вернуться с новым Посещением. */
export function visitEditorUrl(venueId?: string, options: { readonly eventId?: string; readonly forDraft?: string } = {}): string {
  return withQuery(VISIT_EDITOR, { venue: venueId, event: options.eventId, for: options.forDraft })
}

/**
 * Открывает редактор. Гость сначала проходит вход (O5, §5.1): действие «создать» запоминается,
 * после входа он возвращается прямо в редактор. Возвращает `false`, если открылся вход.
 */
export function openEditor(router: Router, url: string, surface: SourceSurface = 'other'): boolean {
  if (!requireAuth({ actionType: 'create', objectType: 'venue', objectId: null, returnUrl: url, sourceSurface: surface })) return false
  void router.push(url)
  return true
}

/**
 * Закрывает редактор: «Назад» браузера и крестик делают одно и то же — возвращают туда, откуда пришли.
 * Если истории нет (прямая ссылка), ведёт на запасной адрес.
 */
export function closeEditor(router: Router, fallback: string): void {
  const state: unknown = window.history.state
  const hasBack = typeof state === 'object' && state !== null && 'back' in state && typeof state.back === 'string'
  if (hasBack) router.back()
  else void router.push(fallback)
}
