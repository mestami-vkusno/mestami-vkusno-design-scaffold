import { computed } from 'vue'
import { formatDate } from '@/mocks/format'
import type { AuthorId, Collection, Photo, CollectionId, CommentId, EventId, PostId, RecentlyViewedKind, UserPost, VenueId, VisitId } from '@/mocks/types'
import { useToast } from '@/design-system/composables/useToast'
import { bindRouter, requireAuth } from './auth-gate'
import { report } from './feedback'
import * as actions from './library-actions'
import './settings'
import type { ReviewInput, VisitInput } from './library-actions'
import { library } from './library-state'
import * as views from './library-views'
import { isSignedIn } from './session'
import { fail, type ActionOrigin, type MutationResult, type PendingAction, type PendingActionInput } from './types'

/*
  Библиотека пользователя для страниц: реактивные чтения и действия. Единственный вход для страниц 0006–0012.
  Действие гостя не выполняется: `requireAuth` сохраняет его как отложенное и ведёт на `/auth`, результат — `auth_required`.
  Итог показывается тостом (успех и понятная неудача); результат возвращается и вызывающему, если нужна навигация.
  Тяжёлый модуль: страницы импортируют его сами, в основной чанк он не входит.
*/

/** Версия документа «лицензия на публичный пользовательский контент»: при её смене согласие нужно подтвердить заново (§13А). */
export const UGC_DOCUMENT_VERSION = '2026-09-01'

function gate(spec: Omit<PendingActionInput, 'returnUrl' | 'sourceSurface'>, origin: ActionOrigin | undefined): boolean {
  return requireAuth({ ...spec, ...origin })
}

const listed = <T>(read: () => readonly T[]) => computed<readonly T[]>(() => (isSignedIn.value ? read() : []))

const favorites = listed(views.favoriteVenues)
const visits = listed(views.visitEntries)
const ratings = listed(views.ratingEntries)
const savedPosts = listed(views.savedPostList)
const savedCollections = listed(views.savedCollectionList)
const savedEvents = listed(views.savedEventList)
const posts = listed(views.postList)
const diary = listed(views.diaryList)
const recentlyViewed = listed(views.recentlyViewedList)
const collections = listed(views.collectionList)
const hasUgcConsent = computed(() => library.value.ugcConsent !== null)
const drafts = computed(() => (isSignedIn.value ? views.draftList() : { posts: [], collections: [] }))

/** Есть ли `id` в списке у вошедшего; у гостя личных списков нет. */
function has(read: () => readonly string[], id: string): boolean {
  return isSignedIn.value && read().includes(id)
}

// Действия «установить» с тостом: их же исполняет отложенное действие после входа.
const favoriteOn = (venueId: VenueId, on: boolean) => report(actions.setFavorite(venueId, on), on ? 'Добавлено в Избранное' : 'Убрано из Избранного', on)
const followAuthorOn = (authorId: AuthorId, on: boolean) => report(actions.setFollowAuthor(authorId, on), on ? 'Вы подписались на автора' : 'Подписка отменена', on)
const followVenueOn = (venueId: VenueId, on: boolean) => report(actions.setFollowVenue(venueId, on), on ? 'Вы подписались на заведение' : 'Подписка отменена', on)
const likeOn = (postId: PostId, on: boolean) => report(actions.setLike(postId, on), on ? 'Отметка «нравится» поставлена' : 'Отметка «нравится» снята', on)
const savePostOn = (postId: PostId, on: boolean) => report(actions.setSavedPost(postId, on), on ? 'Публикация сохранена' : 'Публикация убрана из сохранённого', on)
const saveCollectionOn = (id: CollectionId, on: boolean) => report(actions.setSavedCollection(id, on), on ? 'Подборка сохранена' : 'Подборка убрана из сохранённого', on)
const saveEventOn = (id: EventId, on: boolean) => report(actions.setSavedEvent(id, on), on ? 'Событие сохранено' : 'Событие убрано из сохранённого', on)
const rateVenue = (venueId: VenueId, value: number) => report(actions.setRating(venueId, value), `Оценка ${value} сохранена`)
const recordVisit = (input: VisitInput) => report(actions.addVisit(input), (result) => `Посещение добавлено: ${formatDate(result.visit.visitedOn)}`)
const writeReview = (venueId: VenueId, input: ReviewInput) => report(actions.saveReview(venueId, input), 'Отзыв сохранён')
const postComment = (postId: PostId, text: string, parentId?: CommentId) => report(actions.addComment(postId, text, parentId), 'Комментарий опубликован')

function textPayload(value: string | number | boolean | undefined): string {
  return typeof value === 'string' ? value : ''
}

/**
 * Исполняет отложенное действие после входа: «включает» избранное, подписку, отметку, сохранение, ставит оценку и т. д.
 * `null` — это не действие библиотеки (`create`, `premium`, `ai`): его исполняет своя страница.
 */
export function applyPendingAction(action: PendingAction): MutationResult | null {
  if (!isSignedIn.value) return fail('auth_required')
  const id = action.objectId
  const payload = action.payload ?? {}
  if (id === null) return null
  switch (action.actionType) {
    case 'favorite':
      return favoriteOn(id, true)
    case 'follow':
      return action.objectType === 'venue' ? followVenueOn(id, true) : followAuthorOn(id, true)
    case 'like':
      return likeOn(id, true)
    case 'save':
      if (action.objectType === 'collection') return saveCollectionOn(id, true)
      return action.objectType === 'event' ? saveEventOn(id, true) : savePostOn(id, true)
    case 'rating':
      return rateVenue(id, Number(payload['value']))
    case 'review':
      return writeReview(id, { text: textPayload(payload['text']) })
    case 'visit': {
      const eventId = textPayload(payload['eventId'])
      const note = textPayload(payload['note'])
      return recordVisit({ venueId: id, visitedOn: textPayload(payload['visitedOn']), ...(eventId === '' ? {} : { eventId }), ...(note === '' ? {} : { note }) })
    }
    case 'comment': {
      const parentId = textPayload(payload['parentId'])
      return postComment(id, textPayload(payload['text']), parentId === '' ? undefined : parentId)
    }
    case 'create':
    case 'premium':
    case 'ai':
    case 'report':
    case 'hide':
      return null
  }
}

/**
 * Библиотека вошедшего пользователя: у гостя все списки пусты, а действия ведут на вход.
 * Состояние общее для всех, кто вызвал `useLibrary()`: переключили избранное в одном месте — обновилось везде.
 * `origin` (`returnUrl`, `sourceSurface`) необязателен: адрес возврата по умолчанию — текущая страница.
 */
export function useLibrary() {
  bindRouter()

  return {
    // Чтения
    favorites,
    visits,
    ratings,
    savedPosts,
    savedCollections,
    savedEvents,
    posts,
    diary,
    drafts,
    recentlyViewed,
    /** Свои подборки: опубликованные, приватные и черновики. */
    collections,
    /** Дано ли согласие на публичный пользовательский контент (A5, §13А). */
    hasUgcConsent,
    isFavorite: (venueId: VenueId) => has(() => library.value.favorites.map((item) => item.venueId), venueId),
    isFollowingAuthor: (authorId: AuthorId) => has(() => library.value.followedAuthorIds, authorId),
    isFollowingVenue: (venueId: VenueId) => has(() => library.value.followedVenueIds, venueId),
    isLiked: (postId: PostId) => has(() => library.value.likedPostIds, postId),
    isPostSaved: (postId: PostId) => has(() => library.value.savedPosts.map((item) => item.id), postId),
    isCollectionSaved: (collectionId: CollectionId) => has(() => library.value.savedCollections.map((item) => item.id), collectionId),
    isEventSaved: (eventId: EventId) => has(() => library.value.savedEvents.map((item) => item.id), eventId),
    isAuthorHidden: (authorId: AuthorId) => has(() => library.value.hiddenAuthorIds, authorId),
    isVenueHidden: (venueId: VenueId) => has(() => library.value.hiddenVenueIds, venueId),
    isAuthorBlocked: (authorId: AuthorId) => has(() => library.value.blockedAuthorIds, authorId),
    hiddenAuthorIds: listed(() => library.value.hiddenAuthorIds),
    hiddenVenueIds: listed(() => library.value.hiddenVenueIds),
    blockedAuthorIds: listed(() => library.value.blockedAuthorIds),
    /** Единственная активная оценка пользователя на заведение (1–5) или `undefined`. */
    ratingOf: (venueId: VenueId) => (isSignedIn.value ? views.activeRatingOf(venueId) : undefined),
    /** Единственный отзыв пользователя на заведение или `undefined`. */
    reviewOf: (venueId: VenueId) => (isSignedIn.value ? views.reviewOf(venueId) : undefined),
    likesCountOf: views.likesCountOf,
    // Публичные выдачи с учётом изменений пользователя
    feedItems: views.feedItems,
    reviewsForVenue: views.reviewsForVenue,
    commentThreads: views.commentThreads,
    commentsCountOf: views.commentsCountOf,

    // Действия: `MutationResult`, тост, для гостя — отложенное действие и вход
    toggleFavorite(venueId: VenueId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'favorite', objectType: 'venue', objectId: venueId }, origin)) return fail('auth_required')
      return favoriteOn(venueId, !library.value.favorites.some((item) => item.venueId === venueId))
    },
    toggleFollowAuthor(authorId: AuthorId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'follow', objectType: 'author', objectId: authorId }, origin)) return fail('auth_required')
      return followAuthorOn(authorId, !library.value.followedAuthorIds.includes(authorId))
    },
    toggleFollowVenue(venueId: VenueId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'follow', objectType: 'venue', objectId: venueId }, origin)) return fail('auth_required')
      return followVenueOn(venueId, !library.value.followedVenueIds.includes(venueId))
    },
    toggleLike(postId: PostId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'like', objectType: 'post', objectId: postId }, origin)) return fail('auth_required')
      return likeOn(postId, !library.value.likedPostIds.includes(postId))
    },
    toggleSavePost(postId: PostId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'save', objectType: 'post', objectId: postId }, origin)) return fail('auth_required')
      return savePostOn(postId, !library.value.savedPosts.some((item) => item.id === postId))
    },
    toggleSaveCollection(collectionId: CollectionId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'save', objectType: 'collection', objectId: collectionId }, origin)) return fail('auth_required')
      return saveCollectionOn(collectionId, !library.value.savedCollections.some((item) => item.id === collectionId))
    },
    toggleSaveEvent(eventId: EventId, origin?: ActionOrigin): MutationResult<{ active: boolean }> {
      if (!gate({ actionType: 'save', objectType: 'event', objectId: eventId }, origin)) return fail('auth_required')
      return saveEventOn(eventId, !library.value.savedEvents.some((item) => item.id === eventId))
    },
    addVisit(input: VisitInput, origin?: ActionOrigin) {
      const payload = { visitedOn: input.visitedOn, ...(input.eventId === undefined ? {} : { eventId: input.eventId }), ...(input.note === undefined ? {} : { note: input.note }) }
      if (!gate({ actionType: 'visit', objectType: 'venue', objectId: input.venueId, payload }, origin)) return fail('auth_required')
      return recordVisit(input)
    },
    removeVisit(visitId: VisitId): MutationResult {
      return isSignedIn.value ? report(actions.removeVisit(visitId), 'Посещение удалено', false) : fail('auth_required')
    },
    setRating(venueId: VenueId, value: number, origin?: ActionOrigin) {
      if (!gate({ actionType: 'rating', objectType: 'venue', objectId: venueId, payload: { value } }, origin)) return fail('auth_required')
      return rateVenue(venueId, value)
    },
    saveReview(venueId: VenueId, input: ReviewInput, origin?: ActionOrigin) {
      if (!gate({ actionType: 'review', objectType: 'venue', objectId: venueId, payload: { text: input.text } }, origin)) return fail('auth_required')
      return writeReview(venueId, input)
    },
    /**
     * CR3: оценка и, если есть текст, отзыв одним действием и одним тостом. Оценка ставится первой: отзыв опирается на активную оценку (§16.2).
     * Отзыв один на пару «пользователь × заведение»: повторный вызов правит его, а не создаёт второй.
     */
    submitReview(venueId: VenueId, input: { readonly value: number; readonly text: string; readonly photos: readonly Photo[] }, origin?: ActionOrigin): MutationResult {
      const hasText = input.text.trim() !== ''
      if (!gate({ actionType: hasText ? 'review' : 'rating', objectType: 'venue', objectId: venueId, payload: hasText ? { text: input.text } : { value: input.value } }, origin)) return fail('auth_required')
      const rated = actions.setRating(venueId, input.value)
      if (!rated.ok) return report(rated, '')
      if (!hasText) return report(rated, `Оценка ${input.value} сохранена`)
      const saved = actions.saveReview(venueId, { text: input.text, photos: input.photos })
      return report(saved, (result) => (result.created ? 'Спасибо, отзыв сохранён' : 'Отзыв обновлён'))
    },
    addComment(postId: PostId, text: string, parentId?: CommentId, origin?: ActionOrigin) {
      const payload = { text, ...(parentId === undefined ? {} : { parentId }) }
      if (!gate({ actionType: 'comment', objectType: 'post', objectId: postId, payload }, origin)) return fail('auth_required')
      return postComment(postId, text, parentId)
    },
    deleteComment(commentId: CommentId): MutationResult {
      return isSignedIn.value ? report(actions.deleteComment(commentId), 'Комментарий удалён', false) : fail('auth_required')
    },
    /** Публикация, черновик или запись дневника (создание — задача 0011). */
    savePost(post: UserPost): MutationResult<{ post: UserPost; created: boolean }> {
      return isSignedIn.value ? actions.savePost(post) : fail('auth_required')
    },
    removePost(postId: PostId): MutationResult {
      return isSignedIn.value ? report(actions.removePost(postId), 'Публикация удалена', false) : fail('auth_required')
    },
    /**
     * «Опубликовать» из редактора: публичная уходит на модерацию, приватная остаётся в дневнике. Без тоста: причину (`consent_required`,
     * `venue_required`, `empty_content`) редактор показывает сам, для `consent_required` — экраном A5.
     */
    submitPost(postId: PostId): MutationResult<{ post: UserPost }> {
      return isSignedIn.value ? actions.submitPost(postId) : fail('auth_required')
    },
    /** A5: принять лицензию на публичный контент и согласие на изображение и голос (§13А). */
    acceptUgcConsent(imageVoice: boolean): MutationResult {
      return isSignedIn.value ? actions.acceptUgcConsent(UGC_DOCUMENT_VERSION, imageVoice) : fail('auth_required')
    },
    /** Своя подборка: автосохранение редактора, тихо. */
    saveCollection(collection: Collection): MutationResult<{ collection: Collection; created: boolean }> {
      return isSignedIn.value ? actions.saveCollection(collection) : fail('auth_required')
    },
    publishCollection(collectionId: CollectionId): MutationResult<{ collection: Collection }> {
      return isSignedIn.value ? actions.publishCollection(collectionId) : fail('auth_required')
    },
    removeCollection(collectionId: CollectionId): MutationResult {
      return isSignedIn.value ? report(actions.removeCollection(collectionId), 'Подборка удалена', false) : fail('auth_required')
    },
    /** Следующий свободный идентификатор своей публикации или подборки. */
    nextOwnId: actions.nextOwnId,
    /** Скрыть автора, скрыть заведение, заблокировать и вернуть обратно. Блокировка снимает подписку, разблокировка её не возвращает (§12.4). */
    hideAuthor(authorId: AuthorId, on = true) {
      return isSignedIn.value ? report(actions.setHiddenAuthor(authorId, on), on ? 'Автор скрыт' : 'Автор снова показывается', on) : fail('auth_required')
    },
    hideVenue(venueId: VenueId, on = true) {
      return isSignedIn.value ? report(actions.setHiddenVenue(venueId, on), on ? 'Заведение скрыто' : 'Заведение снова показывается', on) : fail('auth_required')
    },
    blockAuthor(authorId: AuthorId) {
      return isSignedIn.value ? report(actions.setBlockedAuthor(authorId, true), 'Автор заблокирован') : fail('auth_required')
    },
    unblockAuthor(authorId: AuthorId) {
      return isSignedIn.value ? report(actions.setBlockedAuthor(authorId, false), 'Автор разблокирован. Подписка не восстановлена', false) : fail('auth_required')
    },
    /** Удалить свой отзыв (M7, V1; O12 показывает страница). Оценка остаётся. */
    removeReview(reviewId: string): MutationResult {
      return isSignedIn.value ? report(actions.removeReview(reviewId), 'Отзыв удалён', false) : fail('auth_required')
    },
    /** «Не интересно» из меню публикации (O10): пропадает из Ленты; `on: false` возвращает. */
    dismissPost(postId: PostId, on = true): MutationResult<{ active: boolean }> {
      return isSignedIn.value ? actions.setPostDismissed(postId, on) : fail('auth_required')
    },
    isPostDismissed: (postId: PostId) => has(() => library.value.dismissedPostIds, postId),
    /** «Очистить историю просмотров» (M8, ST1; O12 показывает страница). */
    clearRecentlyViewed(): void {
      if (!isSignedIn.value) return
      actions.clearRecentlyViewed()
      useToast().show({ text: 'История просмотров очищена' })
    },
    /** Недавно просмотренное: тихо, без тоста; гостю не запоминается. */
    markViewed(kind: RecentlyViewedKind, id: string): void {
      if (isSignedIn.value) actions.markViewed(kind, id)
    },
    applyPendingAction,
  }
}

export type { ReviewInput, VisitInput }
