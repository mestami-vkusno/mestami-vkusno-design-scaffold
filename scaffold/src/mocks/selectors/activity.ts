/* Селекторы Центра активности (§19) и диалогов ИИ (§23). */
import { aiConversations } from '../ai'
import { notifications } from '../activity'
import type {
  AiConversation,
  AiObjectRef,
  AppNotification,
  AuthorId,
  Collection,
  ConversationId,
  MenuItem,
  NotificationTab,
  Venue,
  VenueEvent,
} from '../types'
import { getCollection } from './collections'
import { getEvent } from './events'
import { getMenuItem } from './menu'
import { getVenue } from './places'

/** Вкладка «Все» — объединение остальных, свежие сверху. */
export function notificationsOf(userId: AuthorId | null, tab: NotificationTab | 'all' = 'all'): readonly AppNotification[] {
  if (userId === null) return []
  return notifications
    .filter((entry) => entry.userId === userId && (tab === 'all' || entry.tab === tab))
    .sort((a, b) => b.at.localeCompare(a.at))
}

export function unreadCount(userId: AuthorId | null, tab: NotificationTab | 'all' = 'all'): number {
  return notificationsOf(userId, tab).filter((entry) => !entry.read).length
}

export function conversationsOf(userId: AuthorId | null): readonly AiConversation[] {
  if (userId === null) return []
  return aiConversations.filter((conversation) => conversation.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getConversation(id: ConversationId): AiConversation | undefined {
  return aiConversations.find((conversation) => conversation.id === id)
}

export type ResolvedAiObject =
  | { readonly kind: 'venue'; readonly venue: Venue }
  | { readonly kind: 'menu_item'; readonly item: MenuItem; readonly venue: Venue | undefined }
  | { readonly kind: 'event'; readonly event: VenueEvent }
  | { readonly kind: 'collection'; readonly collection: Collection }

/** Карточка объекта в ответе ИИ: только существующие опубликованные данные (§23.4). */
export function resolveAiObject(ref: AiObjectRef): ResolvedAiObject | undefined {
  switch (ref.kind) {
    case 'venue': {
      const venue = getVenue(ref.id)
      return venue === undefined ? undefined : { kind: 'venue', venue }
    }
    case 'menu_item': {
      const item = getMenuItem(ref.id)
      return item === undefined ? undefined : { kind: 'menu_item', item, venue: getVenue(item.venueId) }
    }
    case 'event': {
      const event = getEvent(ref.id)
      return event === undefined ? undefined : { kind: 'event', event }
    }
    case 'collection': {
      const collection = getCollection(ref.id)
      return collection === undefined ? undefined : { kind: 'collection', collection }
    }
  }
}
