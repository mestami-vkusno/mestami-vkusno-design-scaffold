import { shallowRef } from 'vue'
import { collections as seedCollections } from '@/mocks/collections'
import { MOCK_LIBRARY, MOCK_USER, MOCK_USER_ID } from '@/mocks/library'
import { ratings, reviews } from '@/mocks/reviews'
import { myPosts } from '@/mocks/selectors/library'
import { setCollectionOverlay } from '@/mocks/selectors/collections'
import type { AuthorId, Collection, CollectionId, EventId, FavoriteVenue, IsoDateTime, PostComment, PostId, Rating, RecentlyViewed, Review, SavedItem, UserPost, VenueId, Visit } from '@/mocks/types'
import { onMockReset } from './reset'
import { VIEWER_ID } from './session'
import { readStored, writeStored } from './storage'

/*
  Хранилище библиотеки пользователя: всё личное у Марии (§18) и её настройки видимости (§12.4, §20).
  Стартует с копии `MOCK_LIBRARY`, оценок и отзывов Марии, её публикаций и настроек из `MOCK_USER`; дальше живёт
  в памяти и в `localStorage`. Данные не изменяются на месте: каждая мутация кладёт в `data` новый объект,
  поэтому все, кто читает `library.value`, обновляются вместе.
  Здесь только состояние; правила ТЗ — в `library-actions.ts`.
*/

// Компилятор следит, чтобы лёгкая сессия и данные мока говорили об одном пользователе.
void (VIEWER_ID satisfies typeof MOCK_USER_ID)

/** Согласие на публичный пользовательский контент (§13А): документ, версия, дата. Ставится один раз, на первой публичной публикации. */
export interface UgcConsent {
  readonly acceptedAt: IsoDateTime
  /** Версия документа: при её смене согласие нужно подтвердить заново. */
  readonly documentVersion: string
  /** `image_voice_consent`: изображение и голос. */
  readonly imageVoice: boolean
}

export interface LibraryData {
  readonly favorites: readonly FavoriteVenue[]
  readonly followedAuthorIds: readonly AuthorId[]
  readonly followedVenueIds: readonly VenueId[]
  readonly savedPosts: readonly SavedItem<PostId>[]
  readonly savedCollections: readonly SavedItem<CollectionId>[]
  readonly savedEvents: readonly SavedItem<EventId>[]
  readonly likedPostIds: readonly PostId[]
  readonly visits: readonly Visit[]
  readonly recentlyViewed: readonly RecentlyViewed[]
  /** Все оценки пользователя, включая заменённые (`active: false`). */
  readonly ratings: readonly Rating[]
  readonly reviews: readonly Review[]
  /** Публикации, черновики и записи дневника пользователя, кроме удалённых им самим. */
  readonly posts: readonly UserPost[]
  /** Только комментарии, написанные в моке; комментарии из моков читаются селекторами. */
  readonly comments: readonly PostComment[]
  readonly hiddenAuthorIds: readonly AuthorId[]
  readonly hiddenVenueIds: readonly VenueId[]
  readonly blockedAuthorIds: readonly AuthorId[]
  /** Публикации, помеченные «Не интересно» (O10): из Ленты пропадают. Личное, наружу не показывается. */
  readonly dismissedPostIds: readonly PostId[]
  /** Подборки пользователя: опубликованные, приватные и черновики (§17.1). Читаются и по прямой ссылке `/collection/:id`. */
  readonly collections: readonly Collection[]
  /** `null` — согласие ещё не давалось: первая публичная публикация откроет A5. */
  readonly ugcConsent: UgcConsent | null
}

/** То, что лежало в хранилище до появления подборок и согласия: тех полей нет, дописываем значениями по умолчанию. */
type StoredLibraryData = Omit<LibraryData, 'collections' | 'ugcConsent' | 'dismissedPostIds'> & Partial<Pick<LibraryData, 'collections' | 'ugcConsent' | 'dismissedPostIds'>>

const LIST_KEYS = [
  'favorites',
  'followedAuthorIds',
  'followedVenueIds',
  'savedPosts',
  'savedCollections',
  'savedEvents',
  'likedPostIds',
  'visits',
  'recentlyViewed',
  'ratings',
  'reviews',
  'posts',
  'comments',
  'hiddenAuthorIds',
  'hiddenVenueIds',
  'blockedAuthorIds',
] as const satisfies readonly (keyof LibraryData)[]

/** Оценка, отзыв, публикация и остальное лежат вперемешку: проверяется только то, что все списки на месте. */
function isLibraryData(value: unknown): value is StoredLibraryData {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Record<keyof LibraryData, unknown>>
  return LIST_KEYS.every((key) => Array.isArray(item[key]))
}

function initialData(): LibraryData {
  return {
    favorites: MOCK_LIBRARY.favorites,
    followedAuthorIds: MOCK_LIBRARY.followedAuthorIds,
    followedVenueIds: MOCK_LIBRARY.followedVenueIds,
    savedPosts: MOCK_LIBRARY.savedPosts,
    savedCollections: MOCK_LIBRARY.savedCollections,
    savedEvents: MOCK_LIBRARY.savedEvents,
    likedPostIds: MOCK_LIBRARY.likedPostIds,
    visits: MOCK_LIBRARY.visits,
    recentlyViewed: MOCK_LIBRARY.recentlyViewed,
    ratings: ratings.filter((rating) => rating.userId === VIEWER_ID),
    reviews: reviews.filter((review) => review.userId === VIEWER_ID),
    posts: myPosts(VIEWER_ID),
    comments: [],
    hiddenAuthorIds: MOCK_USER.settings.hiddenAuthorIds,
    hiddenVenueIds: MOCK_USER.settings.hiddenVenueIds,
    blockedAuthorIds: MOCK_USER.settings.blockedAuthorIds,
    dismissedPostIds: [],
    collections: seedCollections.filter((collection) => collection.ownerId === VIEWER_ID),
    // Мок начинает «с чистого листа»: первая публичная публикация проходит юридическую настройку A5 (J7).
    // Поле `publicUgcLicenseAcceptedAt` у `MOCK_USER` в данных Марии есть, но здесь намеренно не читается.
    ugcConsent: null,
  }
}

function fromStored(stored: StoredLibraryData | null): LibraryData {
  return stored === null ? initialData() : { ...initialData(), ...stored }
}

/** Отметки «нравится» из исходных данных: по ним считается, насколько изменился счётчик лайков у публикации. */
export const BASE_LIKED_POST_IDS: readonly PostId[] = MOCK_LIBRARY.likedPostIds

const state = shallowRef<LibraryData>(fromStored(readStored('local', 'library', isLibraryData)))

/** Текущая библиотека; читайте `library.value` внутри `computed` или шаблона. */
export const library = state

/** Кладёт изменённые поля в новый объект и сохраняет его. Единственное место, где меняется состояние. */
export function updateLibrary(patch: Partial<LibraryData>): void {
  state.value = { ...state.value, ...patch }
  writeStored('local', 'library', state.value)
}

/** Идентификаторы подборок Марии из данных мока: если её подборки в библиотеке нет, значит, она её удалила. */
const SEED_COLLECTION_IDS = new Set(seedCollections.filter((collection) => collection.ownerId === VIEWER_ID).map((collection) => collection.id))

// `getCollection` (страница подборки, Лента, «Сохранённое») видит подборки пользователя: созданные и изменённые им, и не видит удалённые.
setCollectionOverlay((id) => state.value.collections.find((collection) => collection.id === id) ?? (SEED_COLLECTION_IDS.has(id) ? null : undefined))

onMockReset(() => {
  state.value = initialData()
})
