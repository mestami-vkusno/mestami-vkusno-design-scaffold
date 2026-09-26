/*
  Состояние редактора публикации (CR1, §13): поля, предзаполнение из объекта, автосохранение черновика и «Опубликовать».
  Черновик — обычная публикация пользователя со статусом «черновик» в его библиотеке (`useLibrary().savePost`): он хранится в
  `localStorage`, поэтому переживает закрытие редактора и перезагрузку. Адрес получает `?draft=<id>` сразу после первого сохранения —
  так же его открывает «Продолжить» из «Мое → Черновики». Пустой редактор черновика не создаёт: сохраняется только то, что пользователь ввёл или выбрал.
*/
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MediaPickerItem } from '@/design-system'
import { settings } from '@/state/settings'
import { getEvent } from '@/mocks/selectors/events'
import { getMenuItem } from '@/mocks/selectors/menu'
import { getVenue } from '@/mocks/selectors/places'
import type { ModerationStatus, Photo, PostVisibility, UserPost } from '@/mocks/types'
import { mockClock } from '@/state/clock'
import { VIEWER_ID } from '@/state/session'
import { useLibrary } from '@/state/useLibrary'
import type { AutosaveState } from './components/AutosaveStatus.vue'
import { itemsToPhotos, photosToItems } from './photos'

/** Предел текста публикации: в ТЗ настраиваемый (§13.2), в моке — 2000 символов. */
export const MAX_POST_TEXT = 2000
/** Пауза после последней правки до сохранения. */
const AUTOSAVE_DELAY_MS = 500

export type PostEntry = 'blank' | 'venue' | 'dish' | 'event' | 'visit'

export function usePostEditor() {
  const route = useRoute()
  const router = useRouter()
  const library = useLibrary()

  // ── Поля ──────────────────────────────────────────────────────────────
  const text = ref('')
  const visibility = ref<PostVisibility>(settings.value.defaultPostVisibility)
  const venueId = ref<string | null>(null)
  const menuItemId = ref<string | null>(null)
  const eventId = ref<string | null>(null)
  const visitId = ref<string | null>(null)
  const withRating = ref(false)
  const commentsEnabled = ref(true)
  const mediaItems = ref<MediaPickerItem[]>([])
  /** Заглушки из открытого черновика: плитки `saved-N` возвращают свою заглушку как была. Не обновляется при сохранении. */
  const knownPhotos = shallowRef<readonly Photo[]>([])

  // ── Что за публикация ──────────────────────────────────────────────────
  const postId = ref<string | null>(null)
  const status = ref<ModerationStatus>('draft')
  const moderationNote = ref<string | undefined>(undefined)
  const createdAt = ref<string | null>(null)
  const likesCount = ref(0)
  const savedVisibility = ref<PostVisibility | null>(null)
  const restored = ref(false)
  const notFound = ref(false)
  /** Откуда предзаполнено: подпись «Из карточки заведения» у выбранного заведения. */
  const entry = ref<PostEntry>('blank')
  const prefilledVenueId = ref<string | null>(null)

  const photos = computed(() => itemsToPhotos(mediaItems.value, knownPhotos.value))

  const snapshot = (): string =>
    JSON.stringify([text.value, visibility.value, venueId.value, menuItemId.value, eventId.value, visitId.value, withRating.value, commentsEnabled.value, photos.value.map((photo) => photo.caption)])
  let baseline = ''

  // ── Загрузка: черновик из адреса или новый редактор с контекстом ─────────
  function queryText(key: string): string | null {
    const value = route.query[key]
    const first = Array.isArray(value) ? value[0] : value
    return typeof first === 'string' && first !== '' ? first : null
  }

  function clear(): void {
    text.value = ''
    visibility.value = settings.value.defaultPostVisibility
    venueId.value = null
    menuItemId.value = null
    eventId.value = null
    visitId.value = null
    withRating.value = false
    commentsEnabled.value = true
    mediaItems.value = []
    knownPhotos.value = []
    postId.value = null
    status.value = 'draft'
    moderationNote.value = undefined
    createdAt.value = null
    likesCount.value = 0
    savedVisibility.value = null
    restored.value = false
    notFound.value = false
    entry.value = 'blank'
    prefilledVenueId.value = null
  }

  function applyContext(): void {
    const visit = queryText('visit')
    const event = queryText('event')
    const item = queryText('item')
    const venue = queryText('venue')
    const visitRecord = visit === null ? undefined : library.visits.value.find((entryVisit) => entryVisit.visit.id === visit)
    if (visitRecord !== undefined) {
      venueId.value = visitRecord.venue.id
      visitId.value = visitRecord.visit.id
      if (visitRecord.event !== undefined) eventId.value = visitRecord.event.id
      entry.value = 'visit'
    }
    const eventRecord = event === null ? undefined : getEvent(event)
    if (eventRecord !== undefined && (venueId.value === null || venueId.value === eventRecord.venueId)) {
      venueId.value = eventRecord.venueId
      eventId.value = eventRecord.id
      if (entry.value === 'blank') entry.value = 'event'
    }
    const dishRecord = item === null ? undefined : getMenuItem(item)
    if (dishRecord !== undefined && (venueId.value === null || venueId.value === dishRecord.venueId)) {
      venueId.value = dishRecord.venueId
      menuItemId.value = dishRecord.id
      if (entry.value === 'blank') entry.value = 'dish'
    }
    if (venueId.value === null && venue !== null && getVenue(venue) !== undefined) {
      venueId.value = venue
      entry.value = 'venue'
    }
    prefilledVenueId.value = venueId.value
  }

  function load(): void {
    clear()
    const draft = queryText('draft')
    const mine = draft === null ? undefined : library.posts.value.find((post) => post.id === draft)
    if (draft !== null && mine === undefined) notFound.value = true
    if (mine !== undefined) {
      postId.value = mine.id
      text.value = mine.text
      visibility.value = mine.visibility
      savedVisibility.value = mine.visibility
      venueId.value = mine.venueId
      menuItemId.value = mine.menuItemId ?? null
      eventId.value = mine.eventId ?? null
      visitId.value = mine.visitId ?? null
      withRating.value = mine.ratingSnapshot !== undefined
      commentsEnabled.value = mine.commentsEnabled
      knownPhotos.value = mine.photos
      mediaItems.value = photosToItems(mine.photos, 'saved')
      status.value = mine.status
      moderationNote.value = mine.moderationNote
      createdAt.value = mine.createdAt
      likesCount.value = mine.likesCount
      restored.value = mine.status === 'draft'
    }
    // `?visibility=` из «Дневника» («Новая запись», «Сделать публичной») ложится поверх значения по умолчанию и сохранённого.
    const wanted = queryText('visibility')
    if (wanted === 'public' || wanted === 'private') visibility.value = wanted
    if (mine === undefined) {
      applyContext()
      baseline = snapshot()
      autosave.value = 'idle'
      return
    }
    // Черновик открыт; контекст из адреса ложится поверх него и сохраняется как правка: вернулись из CR4 с новым Посещением.
    baseline = snapshot()
    autosave.value = 'saved'
    if (queryText('visit') !== null) {
      applyContext()
      scheduleSave()
    }
  }

  // ── Связи между полями ────────────────────────────────────────────────
  /** Выбрать заведение: блюдо, событие и Посещение от другого заведения сбрасываются, «Оценка» — тоже. */
  function setVenue(id: string | null): void {
    if (id === venueId.value) return
    venueId.value = id
    menuItemId.value = null
    eventId.value = null
    visitId.value = null
    withRating.value = false
  }

  const activeRating = computed(() => (venueId.value === null ? undefined : library.ratingOf(venueId.value)))

  // ── Автосохранение ────────────────────────────────────────────────────
  const autosave = ref<AutosaveState>('idle')
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  let timer: ReturnType<typeof setTimeout> | undefined
  /** После отправки, удаления и закрытия редактор больше ничего не пишет: иначе `flush` на уходе воскресил бы удалённое. */
  let sealed = false

  const hasContent = computed(() => text.value.trim() !== '' || photos.value.length > 0 || venueId.value !== null)
  const isDirty = computed(() => snapshot() !== baseline)

  function buildPost(id: string): UserPost {
    const rating = activeRating.value
    return {
      kind: 'user_post',
      id,
      authorId: VIEWER_ID,
      venueId: venueId.value,
      ...(menuItemId.value === null ? {} : { menuItemId: menuItemId.value }),
      ...(eventId.value === null ? {} : { eventId: eventId.value }),
      ...(visitId.value === null ? {} : { visitId: visitId.value }),
      ...(withRating.value && rating !== undefined ? { ratingSnapshot: rating.value } : {}),
      text: text.value,
      photos: photos.value,
      visibility: visibility.value,
      status: status.value,
      ...(moderationNote.value === undefined ? {} : { moderationNote: moderationNote.value }),
      commentsEnabled: commentsEnabled.value,
      createdAt: createdAt.value ?? mockClock(),
      updatedAt: mockClock(),
      likesCount: likesCount.value,
    }
  }

  /** Записывает черновик сейчас. Возвращает идентификатор публикации или `null`, если сохранять нечего. */
  function persist(force = false): string | null {
    clearTimeout(timer)
    timer = undefined
    if (sealed) return postId.value
    if (!force && (!isDirty.value || !hasContent.value)) {
      if (autosave.value === 'saving') autosave.value = postId.value === null ? 'idle' : 'saved'
      return postId.value
    }
    const created = postId.value === null
    const id = postId.value ?? library.nextOwnId('post')
    const post = buildPost(id)
    const result = library.savePost(post)
    if (!result.ok) return postId.value
    postId.value = id
    createdAt.value = post.createdAt
    baseline = snapshot()
    restored.value = false
    autosave.value = online.value ? 'saved' : 'offline'
    // Адрес запоминает черновик: перезагрузка и «Назад» из другого экрана открывают его же.
    if (created) void router.replace({ path: route.path, query: { ...route.query, draft: id } })
    return id
  }

  function scheduleSave(): void {
    if (sealed) return
    if (!isDirty.value || !hasContent.value) return
    autosave.value = 'saving'
    clearTimeout(timer)
    timer = setTimeout(() => persist(), AUTOSAVE_DELAY_MS)
  }

  watch(() => [text.value, visibility.value, venueId.value, menuItemId.value, eventId.value, visitId.value, withRating.value, commentsEnabled.value, photos.value.length, photos.value.map((photo) => photo.caption).join('|')], scheduleSave)

  function onOnline(): void {
    online.value = true
    if (autosave.value === 'offline') autosave.value = 'saved'
  }
  function onOffline(): void {
    online.value = false
    if (autosave.value === 'saved') autosave.value = 'offline'
  }
  function onPageHide(): void {
    persist()
  }

  onMounted(() => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('pagehide', onPageHide)
    if (!online.value) autosave.value = 'offline'
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
    window.removeEventListener('pagehide', onPageHide)
    persist()
  })

  // Новый адрес того же редактора (черновик открыт ссылкой «Продолжить», другое заведение из карточки): читаем заново.
  watch(
    () => [route.query['draft'], route.query['venue'], route.query['item'], route.query['event'], route.query['visit']].join('|'),
    () => {
      if (route.query['draft'] === postId.value && postId.value !== null && queryText('visit') === null) return
      persist()
      sealed = false
      load()
    },
  )

  load()

  // ── Публикация ────────────────────────────────────────────────────────
  const uploading = computed(() => mediaItems.value.some((item) => item.status === 'uploading'))
  const failedFile = computed(() => mediaItems.value.some((item) => item.status === 'error'))
  const hasBody = computed(() => text.value.trim() !== '' || photos.value.length > 0)
  const isPublic = computed(() => visibility.value === 'public')
  /** «Выберите заведение» показываем, как только пользователь начал писать: до этого поле не ругается. */
  const venueError = computed(() => (isPublic.value && venueId.value === null && (text.value.trim() !== '' || photos.value.length > 0) ? 'Выберите заведение' : ''))
  const canSubmit = computed(() => hasBody.value && (!isPublic.value || venueId.value !== null) && !uploading.value && !failedFile.value && online.value)
  const submitHint = computed(() => {
    if (!online.value) return 'Нет сети: отправить можно, когда связь вернётся'
    if (uploading.value) return 'Дождитесь загрузки фото'
    if (failedFile.value) return 'Повторите загрузку фото или уберите его'
    if (!hasBody.value) return 'Добавьте текст или фото'
    if (isPublic.value && venueId.value === null) return 'Выберите заведение: публичная публикация без него невозможна'
    return ''
  })
  /** Правим уже отправленную или опубликованную запись: смена видимости — отдельное предупреждение (§13.4). */
  const visibilityChangeNote = computed(() => {
    if (savedVisibility.value === null || savedVisibility.value === visibility.value || status.value === 'draft') return ''
    return visibility.value === 'private'
      ? 'Запись сразу исчезнет из публичных мест и останется только у вас в Дневнике.'
      : 'Публичная запись проходит проверку: до её конца она видна только вам.'
  })

  function seal(): void {
    clearTimeout(timer)
    sealed = true
  }

  /** Полный сброс: «Создать ещё». */
  function startNew(): void {
    sealed = false
    clear()
    baseline = snapshot()
    autosave.value = 'idle'
  }

  function forgetDraft(): void {
    seal()
    postId.value = null
  }

  return {
    // поля
    text,
    visibility,
    venueId,
    menuItemId,
    eventId,
    visitId,
    withRating,
    commentsEnabled,
    mediaItems,
    // состояние
    postId,
    status,
    moderationNote,
    restored,
    notFound,
    entry,
    prefilledVenueId,
    autosave,
    online,
    activeRating,
    uploading,
    failedFile,
    venueError,
    canSubmit,
    submitHint,
    visibilityChangeNote,
    isPublic,
    // действия
    setVenue,
    persist,
    seal,
    forgetDraft,
    startNew,
  }
}
