import { computed, shallowRef } from 'vue'
import { COMPLAINT_CONTENT_REASONS, COMPLAINT_VENUE_REASONS } from '@/mocks/dictionaries'
import { notificationsOf } from '@/mocks/selectors/activity'
import { getEvent } from '@/mocks/selectors/events'
import type { AppNotification, IsoDateTime, NotificationTab, NotificationTarget } from '@/mocks/types'
import { mockClock } from './clock'
import { library } from './library-state'
import { onMockReset } from './reset'
import { VIEWER_ID, isSignedIn } from './session'
import { readStored, writeStored } from './storage'

/*
  Центр активности (AC1, §19) и жалобы (O9, §21). Уведомления мока читаются селектором `notificationsOf`; сверху лежит
  живое состояние: что прочитано, жалобы пользователя (каждая жалоба на контент даёт системное уведомление со статусом, J12)
  и события, которые пользователь сохранил, а они перенесены или отменены (J5, §11.1) — для них уведомление появляется само,
  если его нет в данных мока. Тяжёлый модуль: тянет данные моков, лежит только в чанках страниц и оверлеев.
*/

export type ComplaintFlow = 'content' | 'data'
export type ComplaintKind = 'post' | 'review' | 'comment' | 'profile' | 'venue' | 'event'

/** Что жалоба затрагивает: тип, идентификатор и название для человека. */
export interface ComplaintTarget {
  readonly kind: ComplaintKind
  readonly id: string
  readonly title: string
  /** Куда вести из уведомления: публикация комментария, заведение отзыва и т. п. */
  readonly notify?: NotificationTarget
}

export interface ComplaintCategory {
  readonly id: string
  readonly label: string
  readonly description?: string
}

/** Категории жалобы на контент и на данные заведения — справочники мока (`COMPLAINT_CONTENT_REASONS`, `COMPLAINT_VENUE_REASONS`, §21.2, §21.3). */
export const CONTENT_COMPLAINT_CATEGORIES: readonly ComplaintCategory[] = COMPLAINT_CONTENT_REASONS
export const VENUE_DATA_CATEGORIES: readonly ComplaintCategory[] = COMPLAINT_VENUE_REASONS

/** Категории для события: дата, время и стоимость называются в §21.3 отдельно, справочника у события нет. */
export const EVENT_DATA_CATEGORIES: readonly ComplaintCategory[] = [
  { id: 'when_price', label: 'Неверные дата, время или стоимость' },
  { id: 'cancelled', label: 'Событие отменено или перенесено' },
  { id: 'address', label: 'Неверный адрес' },
  { id: 'other', label: 'Другое' },
]

export interface Complaint {
  readonly id: string
  readonly flow: ComplaintFlow
  readonly target: ComplaintTarget
  readonly categoryId: string
  readonly categoryLabel: string
  readonly description: string
  readonly createdAt: IsoDateTime
  /** Статус для пользователя. Решения модерации в моке заранее заданы данными (`n-14`), новые жалобы остаются «принята». */
  readonly status: 'received'
}

interface ActivityData {
  readonly readIds: readonly string[]
  readonly complaints: readonly Complaint[]
}

function initialData(): ActivityData {
  return { readIds: [], complaints: [] }
}

function isActivityData(value: unknown): value is ActivityData {
  return typeof value === 'object' && value !== null && Array.isArray((value as Partial<ActivityData>).readIds) && Array.isArray((value as Partial<ActivityData>).complaints)
}

const state = shallowRef<ActivityData>(readStored('local', 'activity', isActivityData) ?? initialData())

function update(patch: Partial<ActivityData>): void {
  state.value = { ...state.value, ...patch }
  writeStored('local', 'activity', state.value)
}

onMockReset(() => {
  state.value = initialData()
})

// ── Уведомления ───────────────────────────────────────────────────────────

function complaintNotification(complaint: Complaint): AppNotification {
  return {
    id: `n-${complaint.id}`,
    userId: VIEWER_ID,
    tab: 'system',
    kind: 'complaint_result',
    title: 'Жалоба принята',
    body: `Мы получили вашу жалобу на «${complaint.target.title}» (${complaint.categoryLabel}). Когда модерация её рассмотрит, результат появится здесь.`,
    at: complaint.createdAt,
    read: false,
    ...(complaint.target.notify === undefined ? {} : { target: complaint.target.notify }),
  }
}

/**
 * J5 (§11.1): сохранённое событие перенесли или отменили — приходит системное уведомление. В данных мока оно есть у двух
 * событий (`n-10`, `n-11`); здесь оно заводится для любого другого сохранённого события с таким статусом.
 */
function savedEventNotifications(seeded: readonly AppNotification[]): AppNotification[] {
  const covered = new Set(seeded.filter((item) => item.target?.kind === 'event').map((item) => item.target?.id))
  return library.value.savedEvents.flatMap((saved): AppNotification[] => {
    const event = getEvent(saved.id)
    if (event === undefined || covered.has(event.id)) return []
    if (event.status !== 'cancelled' && event.status !== 'rescheduled') return []
    const cancelled = event.status === 'cancelled'
    return [
      {
        id: `n-event-${event.id}`,
        userId: VIEWER_ID,
        tab: 'system',
        kind: cancelled ? 'event_cancelled' : 'event_rescheduled',
        title: cancelled ? 'Событие отменено' : 'Событие перенесено',
        body: cancelled ? `«${event.title}» отменено. Событие осталось в сохранённых с пометкой.` : `«${event.title}» перенесено на новую дату. Проверьте её на странице события.`,
        at: saved.savedAt,
        read: false,
        target: { kind: 'event', id: event.id },
      },
    ]
  })
}

function all(): readonly AppNotification[] {
  const seeded = notificationsOf(VIEWER_ID)
  const read = new Set(state.value.readIds)
  return [...state.value.complaints.filter((item) => item.flow === 'content').map(complaintNotification), ...savedEventNotifications(seeded), ...seeded]
    .map((item) => (read.has(item.id) ? { ...item, read: true } : item))
    .sort((a, b) => b.at.localeCompare(a.at))
}

function inTab(tab: NotificationTab | 'all'): readonly AppNotification[] {
  return all().filter((item) => tab === 'all' || item.tab === tab)
}

/** Центр активности для страницы. Гостю уведомлений нет. */
export function useActivity() {
  const notifications = computed(() => (isSignedIn.value ? all() : []))
  const complaints = computed(() => (isSignedIn.value ? state.value.complaints : []))

  return {
    notifications,
    complaints,
    inTab: (tab: NotificationTab | 'all') => (isSignedIn.value ? inTab(tab) : []),
    unreadCount: (tab: NotificationTab | 'all' = 'all') => (isSignedIn.value ? inTab(tab).filter((item) => !item.read).length : 0),
    markRead(id: string): void {
      if (!state.value.readIds.includes(id)) update({ readIds: [...state.value.readIds, id] })
    },
    markAllRead(): void {
      update({ readIds: [...new Set([...state.value.readIds, ...all().map((item) => item.id)])] })
    },
    /** Отправляет жалобу (O9): в моке принимается всегда; для жалобы на контент заводится уведомление «Системные» (J12). */
    submitComplaint(input: { flow: ComplaintFlow; target: ComplaintTarget; category: ComplaintCategory; description: string }): Complaint {
      const complaint: Complaint = {
        id: `complaint-${state.value.complaints.length + 1}`,
        flow: input.flow,
        target: input.target,
        categoryId: input.category.id,
        categoryLabel: input.category.label,
        description: input.description.trim(),
        createdAt: mockClock(),
        status: 'received',
      }
      update({ complaints: [complaint, ...state.value.complaints] })
      return complaint
    },
  }
}
