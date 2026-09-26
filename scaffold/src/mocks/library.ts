/*
  Текущий пользователь мока: гость (`null`) или зарегистрированный тестовый пользователь «Мария» с личной библиотекой:
  избранное, подписки, сохранённое, посещения, недавно просмотренное. Как хранить сеанс — забота приложения, здесь только данные.
  Личные объекты Марии (черновики, дневник, оценки, отзывы) лежат рядом с остальными данными:
  публикации — в `posts.ts`, оценки и отзывы — в `reviews.ts`, подборки — в `collections.ts`, диалоги — в `ai.ts`.
*/
import { dateAt, dateTimeAt } from './time'
import type { PremiumEntitlement, UserAccount, UserLibrary, Visit } from './types'

export const MOCK_USER_ID = 'u-maria'

/** Текущий пользователь по умолчанию: гость. Значение `MOCK_USER` — вход под тестовой учётной записью. */
export const GUEST = null

export const premiumStates = {
  none: { status: 'none' },
  active: { status: 'active', activeUntil: dateAt(30), autoRenew: true },
  expired: { status: 'expired', activeUntil: dateAt(-14), autoRenew: false },
} as const satisfies Record<string, PremiumEntitlement>

export const MOCK_USER: UserAccount = {
  id: MOCK_USER_ID,
  authorId: MOCK_USER_ID,
  email: 'maria@example.com',
  activeCityId: 'spb',
  // Премиум закончился: старые диалоги ИИ читаются, новые сообщения блокируются предложением подписки (§23.8).
  premium: premiumStates.expired,
  createdAt: '2026-03-14',
  publicUgcLicenseAcceptedAt: dateTimeAt(-50, '18:00'),
  settings: {
    profileVisibility: 'public',
    defaultPostVisibility: 'public',
    personalization: true,
    aiPersonalLibraryAccess: true,
    // По умолчанию выключено (§23.3).
    aiPrivateTextAccess: false,
    notifications: { social: true, venueUpdates: true, events: true, recommendationsAndMarketing: false, system: true },
    hiddenAuthorIds: ['u-ivan'],
    hiddenVenueIds: ['lilo'],
    blockedAuthorIds: ['u-igor'],
  },
}

/** Посещения — приватные ручные факты; повторные разрешены, будущих дат нет (§16.3). */
export const visits: readonly Visit[] = [
  { id: 'visit-1', userId: MOCK_USER_ID, venueId: 'birch', visitedOn: dateAt(-6) },
  { id: 'visit-2', userId: MOCK_USER_ID, venueId: 'sintoho', visitedOn: dateAt(-20), note: 'Сет от шефа.' },
  { id: 'visit-3', userId: MOCK_USER_ID, venueId: 'harvest', visitedOn: dateAt(-31) },
  { id: 'visit-4', userId: MOCK_USER_ID, venueId: 'osteria-da-bruno', visitedOn: dateAt(-45) },
  { id: 'visit-5', userId: MOCK_USER_ID, venueId: 'forno-napoli', visitedOn: dateAt(-12) },
  { id: 'visit-6', userId: MOCK_USER_ID, venueId: 'kitchen-22', visitedOn: dateAt(-2) },
  { id: 'visit-7', userId: MOCK_USER_ID, venueId: 'kofe-and-more', visitedOn: dateAt(-4) },
  // Повторное посещение Birch: нового отзыва оно не создаёт.
  { id: 'visit-8', userId: MOCK_USER_ID, venueId: 'birch', visitedOn: dateAt(-60) },
  // Посещение события (`event_id` необязателен).
  { id: 'visit-9', userId: MOCK_USER_ID, venueId: 'tokio', visitedOn: dateAt(-3), eventId: 'event-business-lunch-tokio' },
]

export const MOCK_LIBRARY: UserLibrary = {
  userId: MOCK_USER_ID,
  favorites: [
    { venueId: 'birch', addedAt: dateTimeAt(-40, '19:00') },
    { venueId: 'harvest', addedAt: dateTimeAt(-31, '20:00') },
    { venueId: 'osteria-da-bruno', addedAt: dateTimeAt(-45, '21:00') },
    { venueId: 'kofe-and-more', addedAt: dateTimeAt(-4, '10:30') },
    { venueId: 'panorama-360', addedAt: dateTimeAt(-12, '22:00') },
    { venueId: 'forno-napoli', addedAt: dateTimeAt(-12, '18:30') },
  ],
  followedAuthorIds: ['u-anna', 'u-dmitry', 'u-elena', 'u-pavel'],
  followedVenueIds: ['birch', 'harvest', 'forno-napoli', 'el-copitas-bar', 'nola'],
  savedPosts: [
    { id: 'post-03', savedAt: dateTimeAt(-2, '21:30') },
    { id: 'post-07', savedAt: dateTimeAt(-2, '15:00') },
    { id: 'post-11', savedAt: dateTimeAt(-10, '20:20') },
  ],
  savedCollections: [
    { id: 'col-ed-date', savedAt: dateTimeAt(-14, '12:00') },
    { id: 'col-u-dmitry-chef', savedAt: dateTimeAt(-8, '14:10') },
  ],
  savedEvents: [
    { id: 'event-guest-dinner-harvest', savedAt: dateTimeAt(-1, '15:40') },
    { id: 'event-sicilian-osteria', savedAt: dateTimeAt(-6, '19:00') },
    { id: 'event-dj-futura', savedAt: dateTimeAt(-7, '18:00') },
    { id: 'event-pasta-masterclass-birch', savedAt: dateTimeAt(-3, '20:00') },
    { id: 'event-jazz-copitas', savedAt: dateTimeAt(-4, '23:30') },
  ],
  likedPostIds: ['post-01', 'post-03', 'post-11', 'post-17'],
  visits,
  recentlyViewed: [
    { kind: 'venue', id: 'sintoho', viewedAt: dateTimeAt(0, '10:15') },
    { kind: 'event', id: 'event-gastro-set-sintoho', viewedAt: dateTimeAt(0, '10:10') },
    { kind: 'menu_item', id: 'osteria-da-bruno-penne-arrabbiata', viewedAt: dateTimeAt(-1, '20:30') },
    { kind: 'collection', id: 'col-ed-breakfast', viewedAt: dateTimeAt(-1, '09:00') },
    { kind: 'venue', id: 'terrace-17', viewedAt: dateTimeAt(-2, '22:00') },
    { kind: 'venue', id: 'remeslo', viewedAt: dateTimeAt(-3, '08:30') },
  ],
}
