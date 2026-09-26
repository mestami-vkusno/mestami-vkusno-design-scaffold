/*
  Состояние ИИ для мока (AI1, AI2). Тяжёлый модуль: подтягивает данные моков, поэтому лежит только в чанках страниц ИИ.
  Ответы ИИ в моке не генерируются: сравнение собирается из данных заведений (§23.4, §23.6), а остальные ответы — заготовки
  из `mocks/ai.ts`. Доступ к генерации проверяет страница через `usePremium().canUseAi` (§23.1).
  Новые сообщения и новый диалог живут в памяти до перезагрузки (assumption: в ТЗ нет требований к хранению мока).
*/
import { computed, shallowRef, type ComputedRef } from 'vue'
import { aiConversations } from '@/mocks/ai'
import { formatDateShort, formatDistance, formatRatingValue, formatRub, formatCount, isRatingPublic } from '@/mocks/format'
import { MOCK_NOW_TIME, MOCK_TODAY, dateTimeAt, dayPart } from '@/mocks/time'
import type { AiAction, AiAssistantMessage, AiComparison, AiConversation, AiMessage, AiUserMessage, Venue } from '@/mocks/types'
import { getConversation } from '@/mocks/selectors/activity'
import { eventsByVenue, nextOccurrence } from '@/mocks/selectors/events'
import { allVenues, getVenue, openState, openStatusLabel, venueLocationLabel } from '@/mocks/selectors/places'
import { onMockReset } from '@/state/reset'
import { readStored, writeStored } from '@/state/storage'
import { useLibrary } from '@/state/useLibrary'
import { NOT_IN_DATA } from './copy'

// ── Разрешения на данные (§23.3) ──────────────────────────────────────────

export interface AiPermissions {
  /** `ai_personal_library_access`. */
  readonly library: boolean
  /** `ai_private_text_access`; по умолчанию выключено. */
  readonly privateText: boolean
}

function isPermissions(value: unknown): value is AiPermissions {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof AiPermissions, unknown>>
  return typeof item.library === 'boolean' && typeof item.privateText === 'boolean'
}

/** Исходные значения берутся из первого диалога мока; у пользователя без диалогов всё выключено. */
function initialPermissions(): AiPermissions {
  const first = aiConversations[0]
  return { library: first?.aiPersonalLibraryAccess ?? false, privateText: first?.aiPrivateTextAccess ?? false }
}

const permissions = shallowRef<AiPermissions>(readStored('local', 'ai-permissions', isPermissions) ?? initialPermissions())

onMockReset(() => {
  permissions.value = initialPermissions()
  extra.value = new Map()
  draft.value = null
})

export function useAiPermissions(): { permissions: ComputedRef<AiPermissions>; setLibrary: (on: boolean) => void; setPrivateText: (on: boolean) => void } {
  function update(next: AiPermissions): void {
    permissions.value = next
    writeStored('local', 'ai-permissions', next)
  }
  return {
    permissions: computed(() => permissions.value),
    setLibrary: (on) => update({ ...permissions.value, library: on }),
    setPrivateText: (on) => update({ ...permissions.value, privateText: on }),
  }
}

// ── Диалоги ───────────────────────────────────────────────────────────────

/** Диалог, который начат на `/ai` и открыт как `/ai/chat/new`. Один на вкладку. */
export const DRAFT_ID = 'new'

const draft = shallowRef<AiConversation | null>(null)
/** Сообщения, добавленные поверх мока, по идентификатору диалога. */
const extra = shallowRef<ReadonlyMap<string, readonly AiMessage[]>>(new Map())

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-local-${counter}`
}

/** Адрес вида `/ai/chat/1` из макета маршрутов открывает первый диалог мока (`ai-conv-1`). */
export function resolveConversation(param: string): AiConversation | undefined {
  if (param === DRAFT_ID) return draft.value ?? undefined
  return getConversation(param) ?? getConversation(`ai-conv-${param}`)
}

export function messagesOf(conversation: AiConversation): readonly AiMessage[] {
  return [...conversation.messages, ...(extra.value.get(conversation.id) ?? [])]
}

/** Реактивный список сообщений: `resolveConversation` читает реактивный черновик, `extra` — реактивная карта. */
export function useMessages(getId: () => string) {
  const conversation = computed(() => resolveConversation(getId()))
  const messages = computed(() => (conversation.value === undefined ? [] : messagesOf(conversation.value)))
  return { conversation, messages }
}

function userMessage(text: string): AiUserMessage {
  return { role: 'user', id: nextId('ai-u'), text, at: dateTimeAt(0, MOCK_NOW_TIME) }
}

function push(id: string, message: AiMessage): void {
  const next = new Map(extra.value)
  next.set(id, [...(next.get(id) ?? []), message])
  extra.value = next
}

/** Начинает новый диалог с вопроса пользователя; ответ добавляет `addReply`, пока страница показывает «печатает». */
export function startConversation(text: string, userId: string): void {
  const value = text.trim()
  const at = dateTimeAt(0, MOCK_NOW_TIME)
  draft.value = {
    id: DRAFT_ID,
    userId,
    title: value.length > 60 ? `${value.slice(0, 57)}…` : value,
    context: { kind: 'general' },
    aiPersonalLibraryAccess: permissions.value.library,
    aiPrivateTextAccess: permissions.value.privateText,
    messages: [{ role: 'user', id: nextId('ai-u'), text: value, at }],
    createdAt: at,
    updatedAt: at,
  }
}

export function addUserMessage(conversationId: string, text: string): void {
  push(conversationId, userMessage(text.trim()))
}

/** Нужен ли ответ: последнее сообщение — вопрос пользователя. */
export function awaitsReply(messages: readonly AiMessage[]): boolean {
  return messages[messages.length - 1]?.role === 'user'
}

export function addReply(conversationId: string, question: string): void {
  push(conversationId, replyFor(question))
}

// ── Ответ ─────────────────────────────────────────────────────────────────

/** Заведения, названные в тексте вопроса; порядок — как в тексте. */
function venuesMentioned(text: string): readonly Venue[] {
  const lower = text.toLowerCase()
  return allVenues()
    .map((venue) => ({ venue, at: lower.indexOf(venue.name.toLowerCase()) }))
    .filter((entry) => entry.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.venue)
}

function canned(kind: 'search' | 'compare'): AiAssistantMessage {
  const wanted = kind === 'compare' ? aiConversations[1] : aiConversations[0]
  const message = wanted?.messages.find((item): item is AiAssistantMessage => item.role === 'assistant')
  if (message === undefined) return emptyReply()
  return { ...message, id: nextId('ai-a'), at: dateTimeAt(0, MOCK_NOW_TIME) }
}

function emptyReply(): AiAssistantMessage {
  return { role: 'assistant', id: nextId('ai-a'), summary: NOT_IN_DATA, cards: [], actions: [], followUps: [], at: dateTimeAt(0, MOCK_NOW_TIME) }
}

function replyFor(question: string): AiAssistantMessage {
  const named = venuesMentioned(question)
  if (named.length >= 2) return comparisonReply(named.slice(0, 4).map((venue) => venue.id))
  return canned(/сравн/i.test(question) ? 'compare' : 'search')
}

/** Ссылка «открыть» для карточки: любое заведение, событие или подборка мока. */
export function openAction(label: string, kind: 'venue' | 'event' | 'collection', id: string): AiAction {
  return { kind: 'open', label, object: { kind, id } }
}

/** Значение строки сравнения: `null` — «В опубликованных данных сервиса не указано» (§23.6). */
function eventLine(venue: Venue): string {
  const upcoming = eventsByVenue(venue.id)
    .filter((event) => event.status === 'scheduled')
    .map((event) => ({ event, occurrence: nextOccurrence(event) }))
    .filter((entry) => entry.occurrence !== undefined && dayPart(entry.occurrence.startsAt) >= MOCK_TODAY)
    .sort((a, b) => a.occurrence!.startsAt.localeCompare(b.occurrence!.startsAt))[0]
  return upcoming === undefined ? 'Предстоящих событий нет' : `${upcoming.event.title}, ${formatDateShort(upcoming.occurrence!.startsAt)}`
}

/** Сравнение 2–4 заведений из данных сервиса (§23.6). Без победителя: подсказываем только факты («самый низкий чек»). */
export function comparisonReply(venueIds: readonly string[]): AiAssistantMessage {
  const venues = venueIds.map((id) => getVenue(id)).filter((venue): venue is Venue => venue !== undefined).slice(0, 4)
  if (venues.length < 2) return emptyReply()
  const library = useLibrary()
  const usePersonal = permissions.value.library

  const row = (criterion: string, read: (venue: Venue) => string | null): AiComparison['rows'][number] => ({
    criterion,
    values: Object.fromEntries(venues.map((venue) => [venue.id, read(venue)])),
  })

  const rows = [
    row('Средний чек на человека', (venue) => (venue.averageCheckRub === null ? null : `≈ ${formatRub(venue.averageCheckRub)}`)),
    row('Район', (venue) => venueLocationLabel(venue) || null),
    row('Расстояние', (venue) => formatDistance(venue.distanceKm)),
    row('Оценка', (venue) => (isRatingPublic(venue.rating) ? `${formatRatingValue(venue.rating.value)} (${formatCount(venue.rating.count, 'отзыв', 'отзыва', 'отзывов')})` : null)),
    row('Сейчас', (venue) => (openState(venue) === 'unknown' ? null : openStatusLabel(venue))),
    row('События', eventLine),
    ...(usePersonal
      ? [
          row('Ваши предпочтения', (venue) => {
            const rating = library.ratingOf(venue.id)
            const parts = [library.isFavorite(venue.id) ? 'В Избранном' : '', rating === undefined ? '' : `оценка ${rating.value}`].filter(Boolean)
            return parts.length > 0 ? parts.join(', ') : 'Отметок нет'
          }),
        ]
      : []),
  ]

  const priced = venues.filter((venue) => venue.averageCheckRub !== null)
  const cheapest = priced.length >= 2 ? priced.reduce((a, b) => (b.averageCheckRub! < a.averageCheckRub! ? b : a)) : undefined
  const names = venues.map((venue) => venue.name).join(', ')
  const summary = `Сравнили: ${names}.${cheapest === undefined ? '' : ` Самый низкий средний чек — у ${cheapest.name}.`} Общего победителя нет: выбор зависит от цены, расстояния и настроения вечера.`

  return {
    role: 'assistant',
    id: nextId('ai-a'),
    summary,
    cards: [],
    comparison: { venueIds: venues.map((venue) => venue.id), rows, note: 'Победителя объявлять не будем: выбор зависит от цены, расстояния и настроения вечера. Пустые значения — данных о них нет.' },
    actions: [...venues.map((venue) => openAction(`Открыть ${venue.name}`, 'venue', venue.id)), { kind: 'save_collection_draft', label: 'Собрать подборку из этих мест' }],
    followUps: ['Что лучше для свидания?', 'Покажи ещё места рядом'],
    at: dateTimeAt(0, MOCK_NOW_TIME),
  }
}

/** Заведения из вопроса для действия «Сравнить Birch и Harvest»: по названиям в подписи, иначе первые два из карточек. */
export function venuesForAction(label: string, cardVenueIds: readonly string[]): readonly string[] {
  const named = venuesMentioned(label).map((venue) => venue.id).filter((id) => cardVenueIds.includes(id))
  return (named.length >= 2 ? named : cardVenueIds.slice(0, 2)).slice(0, 4)
}
