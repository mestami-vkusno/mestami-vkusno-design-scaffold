import { getAuthor } from '@/mocks/selectors/social'
import { getCollection } from '@/mocks/selectors/collections'
import { getEvent } from '@/mocks/selectors/events'
import { getVenue } from '@/mocks/selectors/places'
import type { PendingAction, PendingActionType } from '@/state/auth-gate'

/*
  Тексты потока авторизации (A1–A4, §5.1–5.8). Только формулировки и подписи объекта отложенного действия
  (§5.2): страница сама решает, что показать, эти функции только достают название объекта.
*/

/** Имена пользователей, которые нельзя занять (§5.5). В ТЗ список не задан: рабочий дефолт для мока. */
export const RESERVED_USERNAMES: readonly string[] = ['admin', 'support', 'help', 'moderator', 'mestami', 'official', 'root', 'api', 'user', 'vsem']

const USERNAME_PATTERN = /^[a-z0-9_]+$/i

export function isUsernameFormatValid(value: string): boolean {
  return value.length >= 3 && value.length <= 24 && USERNAME_PATTERN.test(value)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmailValid(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Название объекта отложенного действия — для контекстной строки (A1) и результата (A4). Пусто, если объект не нашёлся. */
export function pendingObjectLabel(action: PendingAction): string {
  if (action.objectId === null) return ''
  switch (action.objectType) {
    case 'venue':
      return getVenue(action.objectId)?.name ?? ''
    case 'author':
      return getAuthor(action.objectId)?.displayName ?? ''
    case 'event':
      return getEvent(action.objectId)?.title ?? ''
    case 'collection':
      return getCollection(action.objectId)?.title ?? ''
    case 'post':
      return 'публикацию'
    default:
      return ''
  }
}

const ACTION_VERB: Record<PendingActionType, (label: string) => string> = {
  favorite: (label) => `добавить ${label} в избранное`,
  follow: (label) => `подписаться на ${label}`,
  like: () => 'оценить публикацию',
  comment: () => 'оставить комментарий',
  save: (label) => `сохранить ${label}`,
  visit: (label) => `отметить посещение места «${label}»`,
  rating: (label) => `оценить ${label}`,
  review: (label) => `оставить отзыв о месте «${label}»`,
  create: () => 'опубликовать',
  premium: () => 'оформить Премиум',
  ai: () => 'задать вопрос ИИ',
  report: () => 'отправить жалобу',
  hide: () => 'скрыть или заблокировать',
}

/** Контекстная строка под логотипом (§5.2): «Чтобы добавить Birch в избранное, войдите». Без действия — пусто. */
export function pendingContextText(action: PendingAction): string {
  const label = pendingObjectLabel(action)
  const verb = ACTION_VERB[action.actionType](label || 'это')
  return `Чтобы ${verb}, войдите`
}

/** Заголовок результата на A4: «Birch добавлен в избранное». Пусто, если действие не library-типа или не удалось. */
export function pendingResultText(action: PendingAction): string {
  const label = pendingObjectLabel(action) || 'Готово'
  switch (action.actionType) {
    case 'favorite':
      return `${label} добавлен${label === 'Готово' ? 'о' : ''} в избранное`
    case 'follow':
      return `Вы подписались: ${label}`
    case 'like':
      return 'Отметка «нравится» поставлена'
    case 'save':
      return `${label} сохранён${label === 'Готово' ? 'о' : ''}`
    case 'visit':
      return `Посещение «${label}» добавлено`
    case 'rating':
      return `Оценка «${label}» сохранена`
    case 'review':
      return `Отзыв о «${label}» сохранён`
    case 'comment':
      return 'Комментарий опубликован'
    default:
      return ''
  }
}

/** Название объекта для кнопки «Вернуться к …»; пусто — тогда кнопка «Продолжить». */
export function returnLabel(action: PendingAction | null): string {
  if (action === null) return ''
  return pendingObjectLabel(action)
}
