/*
  Состояние редактора подборки (CR2, §17.1, J9): название, описание, видимость, заведения с заметками в авторском порядке, без дублей.
  Как и в редакторе публикации, черновик — сама подборка пользователя со статусом «черновик» в его библиотеке; автосохранение
  пишет её при каждой правке, а `?draft=<id>` в адресе открывает её снова. Пустой редактор ничего не создаёт.
*/
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MOCK_USER } from '@/mocks/library'
import { getVenue } from '@/mocks/selectors/places'
import type { Collection, CollectionItem, CollectionStatus, CollectionVisibility, Photo } from '@/mocks/types'
import { mockClock } from '@/state/clock'
import { VIEWER_ID } from '@/state/session'
import { useLibrary } from '@/state/useLibrary'
import type { AutosaveState } from './components/AutosaveStatus.vue'

const AUTOSAVE_DELAY_MS = 500
/** Сколько мигает рамка у строки, которую пытались добавить второй раз. */
const FLASH_MS = 1000
export const MAX_COLLECTION_TITLE = 80
export const MAX_COLLECTION_DESCRIPTION = 500
export const MAX_ITEM_NOTE = 300

const DEFAULT_COVER: Photo = { ratio: '16:9', tone: 'ember' }

export interface ItemPatch {
  note?: string | null
  menuItemId?: string | null
  eventId?: string | null
}

export function useCollectionEditor() {
  const route = useRoute()
  const router = useRouter()
  const library = useLibrary()

  const title = ref('')
  const description = ref('')
  const visibility = ref<CollectionVisibility>(MOCK_USER.settings.defaultPostVisibility)
  const items = ref<readonly CollectionItem[]>([])

  const collectionId = ref<string | null>(null)
  const status = ref<CollectionStatus>('draft')
  const createdAt = ref<string | null>(null)
  const savesCount = ref(0)
  const cityId = ref<Collection['cityId']>(MOCK_USER.activeCityId)
  const topics = ref<Collection['topics']>([])
  const restored = ref(false)
  const notFound = ref(false)
  const autosave = ref<AutosaveState>('idle')
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  const duplicateVenueId = ref<string | null>(null)
  let flashTimer: ReturnType<typeof setTimeout> | undefined

  const snapshot = (): string => JSON.stringify([title.value, description.value, visibility.value, items.value])
  let baseline = ''

  function draftParam(): string | null {
    const value = route.query['draft']
    const first = Array.isArray(value) ? value[0] : value
    return typeof first === 'string' && first !== '' ? first : null
  }

  function clear(): void {
    title.value = ''
    description.value = ''
    visibility.value = MOCK_USER.settings.defaultPostVisibility
    items.value = []
    collectionId.value = null
    status.value = 'draft'
    createdAt.value = null
    savesCount.value = 0
    topics.value = []
    restored.value = false
    notFound.value = false
    duplicateVenueId.value = null
  }

  function load(): void {
    clear()
    const draft = draftParam()
    const mine = draft === null ? undefined : library.collections.value.find((collection) => collection.id === draft)
    if (draft !== null && mine === undefined) notFound.value = true
    if (mine !== undefined) {
      collectionId.value = mine.id
      title.value = mine.title
      description.value = mine.description
      visibility.value = mine.visibility
      items.value = mine.items
      status.value = mine.status
      createdAt.value = mine.createdAt
      savesCount.value = mine.savesCount
      cityId.value = mine.cityId
      topics.value = mine.topics
      restored.value = mine.status === 'draft'
    }
    baseline = snapshot()
    autosave.value = mine === undefined ? 'idle' : 'saved'
  }

  // ── Заведения в подборке ───────────────────────────────────────────────
  /** Добавляет заведение. Дубль не добавляется: строка мигает рамкой, поле показывает ошибку. `true` — добавлено. */
  function addVenue(venueId: string): boolean {
    if (getVenue(venueId) === undefined) return false
    if (items.value.some((item) => item.venueId === venueId)) {
      duplicateVenueId.value = venueId
      clearTimeout(flashTimer)
      flashTimer = setTimeout(() => (duplicateVenueId.value = null), FLASH_MS)
      return false
    }
    duplicateVenueId.value = null
    items.value = [...items.value, { venueId }]
    return true
  }

  function removeItem(index: number): void {
    items.value = items.value.filter((_, position) => position !== index)
  }

  /** Сдвигает строку на одну позицию: порядок авторский (§17.1). */
  function moveItem(index: number, delta: -1 | 1): void {
    const target = index + delta
    if (target < 0 || target >= items.value.length) return
    const next = [...items.value]
    const [moved] = next.splice(index, 1)
    if (moved === undefined) return
    next.splice(target, 0, moved)
    items.value = next
  }

  function patchItem(index: number, patch: ItemPatch): void {
    items.value = items.value.map((item, position) => {
      if (position !== index) return item
      const note = patch.note === undefined ? item.note : (patch.note ?? undefined)
      const menuItemId = patch.menuItemId === undefined ? item.menuItemId : (patch.menuItemId ?? undefined)
      const eventId = patch.eventId === undefined ? item.eventId : (patch.eventId ?? undefined)
      return {
        venueId: item.venueId,
        ...(note === undefined || note === '' ? {} : { note }),
        ...(menuItemId === undefined ? {} : { menuItemId }),
        ...(eventId === undefined ? {} : { eventId }),
      }
    })
  }

  // ── Автосохранение ────────────────────────────────────────────────────
  let timer: ReturnType<typeof setTimeout> | undefined
  let sealed = false
  const hasContent = computed(() => title.value.trim() !== '' || description.value.trim() !== '' || items.value.length > 0)
  const isDirty = computed(() => snapshot() !== baseline)

  function build(id: string): Collection {
    const cover = getVenue(items.value[0]?.venueId ?? '')?.gallery[0] ?? { ...DEFAULT_COVER, ...(title.value.trim() === '' ? {} : { caption: title.value.trim() }) }
    return {
      id,
      kind: 'user',
      title: title.value,
      description: description.value,
      ownerId: VIEWER_ID,
      visibility: visibility.value,
      status: status.value,
      topics: topics.value,
      cityId: getVenue(items.value[0]?.venueId ?? '')?.cityId ?? cityId.value,
      items: items.value,
      cover,
      createdAt: createdAt.value ?? mockClock(),
      updatedAt: mockClock(),
      savesCount: savesCount.value,
    }
  }

  function persist(force = false): string | null {
    clearTimeout(timer)
    timer = undefined
    if (sealed) return collectionId.value
    if (!force && (!isDirty.value || !hasContent.value)) {
      if (autosave.value === 'saving') autosave.value = collectionId.value === null ? 'idle' : 'saved'
      return collectionId.value
    }
    const created = collectionId.value === null
    const id = collectionId.value ?? library.nextOwnId('collection')
    const collection = build(id)
    const result = library.saveCollection(collection)
    if (!result.ok) return collectionId.value
    collectionId.value = id
    createdAt.value = collection.createdAt
    baseline = snapshot()
    restored.value = false
    autosave.value = online.value ? 'saved' : 'offline'
    if (created) void router.replace({ path: route.path, query: { ...route.query, draft: id } })
    return id
  }

  function scheduleSave(): void {
    if (sealed || !isDirty.value || !hasContent.value) return
    autosave.value = 'saving'
    clearTimeout(timer)
    timer = setTimeout(() => persist(), AUTOSAVE_DELAY_MS)
  }

  watch([title, description, visibility, items], scheduleSave)

  const onOnline = (): void => {
    online.value = true
    if (autosave.value === 'offline') autosave.value = 'saved'
  }
  const onOffline = (): void => {
    online.value = false
    if (autosave.value === 'saved') autosave.value = 'offline'
  }
  const onPageHide = (): void => void persist()

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
    clearTimeout(flashTimer)
    persist()
  })

  watch(
    () => route.query['draft'],
    (draft) => {
      if (draft === collectionId.value && collectionId.value !== null) return
      persist()
      sealed = false
      load()
    },
  )

  load()

  // ── Опубликовать ──────────────────────────────────────────────────────
  const isPublic = computed(() => visibility.value === 'public')
  const canSubmit = computed(() => title.value.trim() !== '' && items.value.length > 0)
  const submitHint = computed(() => (title.value.trim() === '' ? 'Дайте подборке название' : items.value.length === 0 ? 'Добавьте хотя бы одно заведение' : ''))
  const visibilityCaption = computed(() => (isPublic.value ? 'Увидят все.' : 'Видна только вам, не индексируется и не попадает в Ленту.'))

  function seal(): void {
    clearTimeout(timer)
    sealed = true
  }

  return {
    title,
    description,
    visibility,
    items,
    collectionId,
    status,
    restored,
    notFound,
    autosave,
    online,
    duplicateVenueId,
    isPublic,
    canSubmit,
    submitHint,
    visibilityCaption,
    addVenue,
    removeItem,
    moveItem,
    patchItem,
    persist,
    seal,
  }
}
