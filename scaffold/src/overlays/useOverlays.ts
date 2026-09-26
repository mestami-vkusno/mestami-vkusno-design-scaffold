import { reactive, readonly } from 'vue'
import { SHARE_EVENT, type ShareTarget } from '@/features/ShareButton/types'
import type { ComplaintTarget } from '@/state/activity'
import type { PendingObjectType } from '@/state/types'

/*
  Оверлеи без своего маршрута (§7 `screens-without-reference.md`): «Поделиться» (O7), жалобы (O9а и O9б),
  меню публикации (O10), правка профиля. Лёгкий модуль основного чанка: хранит только «что открыть», сами окна лежат в
  отдельном чанке `OverlayHost` и подгружаются при первом открытии. Данные заведений и состояние библиотеки он не импортирует
  (типы — только `import type`).
  Подтверждение (O12) — `pages/create/components/ConfirmSheet.vue`, пояснение перед геолокацией (O3) — `pages/search/components/GeoConsentSheet.vue`,
  запрос управления заведением (O11) — `pages/venue/components/VenueClaimPanel.vue`: они уже есть и здесь не дублируются.
*/

/** О чём O9б: заведение или событие (§21.3). */
export interface DataReportSubject {
  readonly kind: 'venue' | 'event'
  readonly id: string
  readonly title: string
}

export interface PostMenuRequest {
  readonly postId: string
  /** Вызывается после действия, из-за которого страницу публикации нужно покинуть (удалили свою). */
  readonly onRemoved?: () => void
}

interface OverlayState {
  /** Хоть один оверлей открывали: с этого момента подгружен чанк `OverlayHost` и остаётся смонтированным. */
  requested: boolean
  share: { open: boolean; target: ShareTarget | null }
  reportContent: { open: boolean; target: ComplaintTarget | null }
  reportData: { open: boolean; subject: DataReportSubject | null }
  postMenu: { open: boolean; request: PostMenuRequest | null }
  profileEdit: { open: boolean }
}

// Цель остаётся после закрытия: окно не размонтируется посреди анимации закрытия и открывается снова без перезагрузки чанка.
const state = reactive<OverlayState>({
  requested: false,
  share: { open: false, target: null },
  reportContent: { open: false, target: null },
  reportData: { open: false, subject: null },
  postMenu: { open: false, request: null },
  profileEdit: { open: false },
})

export function openShare(target: ShareTarget): void {
  state.requested = true
  state.share.target = target
  state.share.open = true
}

const KIND_TO_OBJECT: Record<ComplaintTarget['kind'], PendingObjectType> = { post: 'post', comment: 'post', review: 'venue', profile: 'author', venue: 'venue', event: 'event' }

/**
 * Гость проходит вход (O5): жалоба от гостя открыла бы путь скоординированным жалобам (§21.2, assumption). `false` — открыт вход.
 * Гейт подгружается при вызове, а не с основным чанком: он тянет сессию и хранилище отложенного действия.
 */
async function gate(kind: ComplaintTarget['kind'], id: string): Promise<boolean> {
  const { requireAuth } = await import('@/state/auth-gate')
  return requireAuth({ actionType: 'report', objectType: KIND_TO_OBJECT[kind], objectId: id })
}

/** O9а: пожаловаться на публикацию, отзыв, комментарий или профиль. */
export async function openReportContent(target: ComplaintTarget): Promise<void> {
  if (!(await gate(target.kind, target.id))) return
  state.requested = true
  state.reportContent.target = target
  state.reportContent.open = true
}

/** O9б: сообщить о неточности данных заведения или события. */
export async function openReportData(subject: DataReportSubject): Promise<void> {
  if (!(await gate(subject.kind, subject.id))) return
  state.requested = true
  state.reportData.subject = subject
  state.reportData.open = true
}

/** O10: меню публикации (⋯). */
export function openPostMenu(request: PostMenuRequest): void {
  state.requested = true
  state.postMenu.request = request
  state.postMenu.open = true
}

export function openProfileEdit(): void {
  state.requested = true
  state.profileEdit.open = true
}

/** Оверлеи для страниц: открыть, и состояние для `OverlayHost`. */
export function useOverlays() {
  return { state, view: readonly(state), openShare, openReportContent, openReportData, openPostMenu, openProfileEdit }
}

let installed = false

/**
 * «Поделиться» (O7): общий блок `ShareButton` шлёт на `window` отменяемое событие `mv:share`. Слушатель забирает его
 * себе и открывает шторку; без него (в витрине блоков) блок сам копирует ссылку. Ставится один раз в оболочке.
 */
export function installShareListener(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener(SHARE_EVENT, (event) => {
    if (!(event instanceof CustomEvent)) return
    event.preventDefault()
    openShare(event.detail as ShareTarget)
  })
}
