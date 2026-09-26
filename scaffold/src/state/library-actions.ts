import { MOCK_NOW, MOCK_TODAY, addDays } from '@/mocks/time'
import { getCollection, isCollectionPublic } from '@/mocks/selectors/collections'
import { getEvent } from '@/mocks/selectors/events'
import { getVenue } from '@/mocks/selectors/places'
import { getAuthor, getCommentThreads, getPost, getVenuePost, isPubliclyVisible } from '@/mocks/selectors/social'
import type { AuthorId, Collection, CollectionId, CommentId, EventId, Photo, PostComment, PostId, Rating, RecentlyViewedKind, Review, StarValue, UserPost, VenueId, Visit, VisitId } from '@/mocks/types'
import { mockClock } from './clock'
import { library, updateLibrary } from './library-state'
import { VIEWER_ID } from './session'
import { fail, succeed, type Failure, type MutationResult } from './types'

/*
  Мутации библиотеки и правила ТЗ. Чистая логика без входа, тостов и роутера: гейт авторизации и уведомления
  добавляет `useLibrary`. Ожидаемая неудача — результат с причиной, исключений нет.
  «Установить» (`setX(id, on)`) идемпотентно: им же после входа исполняется отложенное действие «включить».
*/

/** Список без `id` (`on = false`) или с `id` в начале (`on = true`); тот же массив, если менять нечего. */
function withMember<T extends string>(list: readonly T[], id: T, on: boolean): readonly T[] {
  const has = list.includes(id)
  if (on === has) return list
  return on ? [id, ...list] : list.filter((item) => item !== id)
}

/** То же для списка записей: `create` вызывается, только если записи ещё нет. */
function withItem<T>(list: readonly T[], matches: (item: T) => boolean, create: () => T, on: boolean): readonly T[] {
  const has = list.some(matches)
  if (on === has) return list
  return on ? [create(), ...list] : list.filter((item) => !matches(item))
}

/** Следующий числовой суффикс среди идентификаторов вида `prefix-N`. */
function nextNumber(prefix: string, ids: readonly string[]): number {
  let max = 0
  for (const id of ids) {
    const match = id.startsWith(`${prefix}-`) ? Number(id.slice(prefix.length + 1)) : Number.NaN
    if (Number.isInteger(match) && match > max) max = match
  }
  return max + 1
}

export function isStarValue(value: number): value is StarValue {
  return Number.isInteger(value) && value >= 1 && value <= 5
}

function isBlocked(authorId: AuthorId): boolean {
  return library.value.blockedAuthorIds.includes(authorId)
}

// ── Избранное, подписки, «нравится», сохранения ───────────────────────────

export function setFavorite(venueId: VenueId, on: boolean): MutationResult<{ active: boolean }> {
  if (getVenue(venueId) === undefined) return fail('not_found')
  const favorites = withItem(library.value.favorites, (item) => item.venueId === venueId, () => ({ venueId, addedAt: MOCK_NOW }), on)
  if (favorites !== library.value.favorites) updateLibrary({ favorites })
  return succeed({ active: on })
}

/** Подписка на автора. Блокировка сильнее подписки (§12.4): на заблокированного подписаться нельзя. */
export function setFollowAuthor(authorId: AuthorId, on: boolean): MutationResult<{ active: boolean }> {
  if (getAuthor(authorId) === undefined) return fail('not_found')
  if (authorId === VIEWER_ID) return fail('self_action')
  if (on && isBlocked(authorId)) return fail('blocked')
  const followedAuthorIds = withMember(library.value.followedAuthorIds, authorId, on)
  if (followedAuthorIds !== library.value.followedAuthorIds) updateLibrary({ followedAuthorIds })
  return succeed({ active: on })
}

export function setFollowVenue(venueId: VenueId, on: boolean): MutationResult<{ active: boolean }> {
  if (getVenue(venueId) === undefined) return fail('not_found')
  const followedVenueIds = withMember(library.value.followedVenueIds, venueId, on)
  if (followedVenueIds !== library.value.followedVenueIds) updateLibrary({ followedVenueIds })
  return succeed({ active: on })
}

/** Публикацию можно отметить, только если она видна всем (публичная, опубликованная) и автор не заблокирован. `null` — можно. */
function postInteractionFailure(postId: PostId): Failure | null {
  const post = getPost(postId)
  if (post === undefined) return getVenuePost(postId) === undefined ? fail('not_found') : null
  if (!isPubliclyVisible(post)) return fail('not_found')
  return isBlocked(post.authorId) ? fail('blocked') : null
}

export function setLike(postId: PostId, on: boolean): MutationResult<{ active: boolean }> {
  const failure = postInteractionFailure(postId)
  if (failure !== null) return failure
  const likedPostIds = withMember(library.value.likedPostIds, postId, on)
  if (likedPostIds !== library.value.likedPostIds) updateLibrary({ likedPostIds })
  return succeed({ active: on })
}

export function setSavedPost(postId: PostId, on: boolean): MutationResult<{ active: boolean }> {
  const failure = postInteractionFailure(postId)
  if (failure !== null) return failure
  const savedPosts = withItem(library.value.savedPosts, (item) => item.id === postId, () => ({ id: postId, savedAt: MOCK_NOW }), on)
  if (savedPosts !== library.value.savedPosts) updateLibrary({ savedPosts })
  return succeed({ active: on })
}

/** Сохранить можно публичную подборку или свою; сохранение — ссылка на оригинал, не копия (§17). */
export function setSavedCollection(collectionId: CollectionId, on: boolean): MutationResult<{ active: boolean }> {
  const collection = getCollection(collectionId)
  if (collection === undefined || (!isCollectionPublic(collection) && collection.ownerId !== VIEWER_ID)) return fail('not_found')
  if (collection.ownerId !== null && isBlocked(collection.ownerId)) return fail('blocked')
  const savedCollections = withItem(library.value.savedCollections, (item) => item.id === collectionId, () => ({ id: collectionId, savedAt: MOCK_NOW }), on)
  if (savedCollections !== library.value.savedCollections) updateLibrary({ savedCollections })
  return succeed({ active: on })
}

/** Сохранённое событие ≠ Посещение (§3.4). */
export function setSavedEvent(eventId: EventId, on: boolean): MutationResult<{ active: boolean }> {
  if (getEvent(eventId) === undefined) return fail('not_found')
  const savedEvents = withItem(library.value.savedEvents, (item) => item.id === eventId, () => ({ id: eventId, savedAt: MOCK_NOW }), on)
  if (savedEvents !== library.value.savedEvents) updateLibrary({ savedEvents })
  return succeed({ active: on })
}

// ── Посещения, оценки, отзывы (§16) ───────────────────────────────────────

export interface VisitInput {
  readonly venueId: VenueId
  /** `YYYY-MM-DD`, не позже «сегодня» мока. */
  readonly visitedOn: string
  readonly eventId?: EventId
  readonly note?: string
}

/** Посещение — приватный ручной факт: повторные разрешены, будущая дата запрещена, событие необязательно (§16.3). */
export function addVisit(input: VisitInput): MutationResult<{ visit: Visit }> {
  if (getVenue(input.venueId) === undefined) return fail('not_found')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.visitedOn) || addDays(input.visitedOn, 0) !== input.visitedOn) return fail('invalid_date')
  if (input.visitedOn > MOCK_TODAY) return fail('future_date')
  if (input.eventId !== undefined) {
    const event = getEvent(input.eventId)
    if (event === undefined) return fail('not_found')
    if (event.venueId !== input.venueId) return fail('invalid_value')
  }
  const note = input.note?.trim()
  const visit: Visit = {
    id: `visit-${nextNumber('visit', library.value.visits.map((item) => item.id))}`,
    userId: VIEWER_ID,
    venueId: input.venueId,
    visitedOn: input.visitedOn,
    ...(input.eventId === undefined ? {} : { eventId: input.eventId }),
    ...(note === undefined || note === '' ? {} : { note }),
  }
  updateLibrary({ visits: [visit, ...library.value.visits] })
  return succeed({ visit })
}

export function removeVisit(visitId: VisitId): MutationResult {
  if (!library.value.visits.some((visit) => visit.id === visitId)) return fail('not_found')
  updateLibrary({ visits: library.value.visits.filter((visit) => visit.id !== visitId) })
  return succeed()
}

/**
 * Оценка 1–5: одна активная на пару «пользователь × заведение» (§16.1). Новая заменяет прежнюю: та остаётся
 * в истории с `active: false` и в агрегат не входит; отзыв переезжает на новую активную оценку.
 */
export function setRating(venueId: VenueId, value: number): MutationResult<{ rating: Rating; replaced: boolean }> {
  if (getVenue(venueId) === undefined) return fail('not_found')
  if (!isStarValue(value)) return fail('invalid_value')
  const pair = library.value.ratings.filter((rating) => rating.venueId === venueId)
  const current = pair.find((rating) => rating.active)
  if (current?.value === value) return succeed({ rating: current, replaced: false })
  const rating: Rating = { id: `rating-${VIEWER_ID}-${venueId}-${pair.length + 1}`, userId: VIEWER_ID, venueId, value, active: true, createdAt: MOCK_NOW }
  updateLibrary({
    ratings: [rating, ...library.value.ratings.map((item) => (item.venueId === venueId && item.active ? { ...item, active: false } : item))],
    reviews: library.value.reviews.map((review) => (review.venueId === venueId ? { ...review, ratingId: rating.id } : review)),
  })
  return succeed({ rating, replaced: current !== undefined })
}

export interface ReviewInput {
  readonly text: string
  readonly photos?: readonly Photo[]
}

/** Отзыв: опирается на активную оценку, один на пару; повторный вызов редактирует его, а не создаёт второй (§16.2). */
export function saveReview(venueId: VenueId, input: ReviewInput): MutationResult<{ review: Review; created: boolean }> {
  if (getVenue(venueId) === undefined) return fail('not_found')
  const rating = library.value.ratings.find((item) => item.venueId === venueId && item.active)
  if (rating === undefined) return fail('rating_required')
  const text = input.text.trim()
  if (text === '') return fail('empty_text')
  const existing = library.value.reviews.find((item) => item.venueId === venueId)
  const review: Review = {
    id: existing?.id ?? `review-${VIEWER_ID}-${venueId}`,
    userId: VIEWER_ID,
    venueId,
    ratingId: rating.id,
    text,
    photos: input.photos ?? existing?.photos ?? [],
    status: 'published',
    createdAt: existing?.createdAt ?? MOCK_NOW,
  }
  updateLibrary({ reviews: existing === undefined ? [review, ...library.value.reviews] : library.value.reviews.map((item) => (item === existing ? review : item)) })
  return succeed({ review, created: existing === undefined })
}

// ── Публикации пользователя и дневник ─────────────────────────────────────

/** Создаёт или обновляет публикацию, черновик или запись дневника. Чужую публикацию сохранить нельзя. */
export function savePost(post: UserPost): MutationResult<{ post: UserPost; created: boolean }> {
  if (post.authorId !== VIEWER_ID) return fail('invalid_value')
  const exists = library.value.posts.some((item) => item.id === post.id)
  updateLibrary({ posts: exists ? library.value.posts.map((item) => (item.id === post.id ? post : item)) : [post, ...library.value.posts] })
  return succeed({ post, created: !exists })
}

/**
 * «Опубликовать» (CR1, §13.1, §13.4, §13А). Публичная: нужны заведение и текст или фото, и согласие на публичный контент
 * (нет — `consent_required`, редактор открывает A5); уходит `pending` («на модерации») и видна только автору.
 * Приватная (дневник) заведения не требует, модерации нет: `published`, но в публичных местах её не будет.
 */
export function submitPost(postId: PostId): MutationResult<{ post: UserPost }> {
  const post = library.value.posts.find((item) => item.id === postId)
  if (post === undefined) return fail('not_found')
  if (post.text.trim() === '' && post.photos.length === 0) return fail('empty_content')
  const isPublic = post.visibility === 'public'
  if (isPublic && (post.venueId === null || getVenue(post.venueId) === undefined)) return fail('venue_required')
  if (isPublic && library.value.ugcConsent === null) return fail('consent_required')
  const { moderationNote: _dropped, ...rest } = post
  const next: UserPost = { ...rest, status: isPublic ? 'pending' : 'published', updatedAt: mockClock() }
  updateLibrary({ posts: library.value.posts.map((item) => (item.id === postId ? next : item)) })
  return succeed({ post: next })
}

/** Согласие на публичный пользовательский контент и на изображение/голос (§13А): ставится один раз. */
export function acceptUgcConsent(documentVersion: string, imageVoice: boolean): MutationResult {
  if (!imageVoice) return fail('consent_required')
  updateLibrary({ ugcConsent: { acceptedAt: mockClock(), documentVersion, imageVoice } })
  return succeed()
}

/** Автор удаляет свою публикацию: из списков она исчезает (`removed_by_author`). */
export function removePost(postId: PostId): MutationResult {
  if (!library.value.posts.some((item) => item.id === postId)) return fail('not_found')
  updateLibrary({ posts: library.value.posts.filter((item) => item.id !== postId) })
  return succeed()
}

// ── Подборки пользователя (§17.1) ─────────────────────────────────────────

/** Создаёт или обновляет свою подборку (черновик, приватную, опубликованную). Дубль заведения запрещён, порядок сохраняется как есть. */
export function saveCollection(collection: Collection): MutationResult<{ collection: Collection; created: boolean }> {
  if (collection.ownerId !== VIEWER_ID || collection.kind !== 'user') return fail('invalid_value')
  const venueIds = collection.items.map((item) => item.venueId)
  if (venueIds.some((id) => getVenue(id) === undefined)) return fail('not_found')
  if (new Set(venueIds).size !== venueIds.length) return fail('duplicate_venue')
  const exists = library.value.collections.some((item) => item.id === collection.id)
  updateLibrary({ collections: exists ? library.value.collections.map((item) => (item.id === collection.id ? collection : item)) : [collection, ...library.value.collections] })
  return succeed({ collection, created: !exists })
}

/** «Опубликовать» подборку: нужны название и хотя бы одно заведение. Процесс модерации подборок в ТЗ не описан — статус сразу `published`. */
export function publishCollection(collectionId: CollectionId): MutationResult<{ collection: Collection }> {
  const collection = library.value.collections.find((item) => item.id === collectionId)
  if (collection === undefined) return fail('not_found')
  if (collection.title.trim() === '') return fail('title_required')
  if (collection.items.length === 0) return fail('no_items')
  const next: Collection = { ...collection, status: 'published', updatedAt: mockClock() }
  updateLibrary({ collections: library.value.collections.map((item) => (item.id === collectionId ? next : item)) })
  return succeed({ collection: next })
}

export function removeCollection(collectionId: CollectionId): MutationResult {
  if (!library.value.collections.some((item) => item.id === collectionId)) return fail('not_found')
  updateLibrary({ collections: library.value.collections.filter((item) => item.id !== collectionId), savedCollections: library.value.savedCollections.filter((item) => item.id !== collectionId) })
  return succeed()
}

/** Следующий свободный идентификатор своей подборки или публикации (`col-u-maria-N`, `post-u-maria-N`). */
export function nextOwnId(kind: 'collection' | 'post'): string {
  const prefix = kind === 'collection' ? `col-${VIEWER_ID}` : `post-${VIEWER_ID}`
  const ids = kind === 'collection' ? library.value.collections.map((item) => item.id) : library.value.posts.map((item) => item.id)
  return `${prefix}-${nextNumber(prefix, ids)}`
}

// ── Комментарии (§14.1) ───────────────────────────────────────────────────

/** Один уровень ответов: ответить можно только на комментарий верхнего уровня. Официальный контент заведения не комментируется. */
export function addComment(postId: PostId, text: string, parentId?: CommentId): MutationResult<{ comment: PostComment }> {
  const post = getPost(postId)
  if (post === undefined || !isPubliclyVisible(post)) return fail('not_found')
  if (isBlocked(post.authorId)) return fail('blocked')
  if (!post.commentsEnabled) return fail('comments_disabled')
  const body = text.trim()
  if (body === '') return fail('empty_text')
  if (parentId !== undefined) {
    const topLevel = [...getCommentThreads(postId).map((thread) => thread.comment), ...library.value.comments.filter((item) => item.postId === postId && item.parentId === undefined)]
    if (!topLevel.some((item) => item.id === parentId)) return fail('invalid_value')
  }
  const comment: PostComment = {
    id: `comment-${VIEWER_ID}-${nextNumber(`comment-${VIEWER_ID}`, library.value.comments.map((item) => item.id))}`,
    postId,
    authorId: VIEWER_ID,
    ...(parentId === undefined ? {} : { parentId }),
    text: body,
    createdAt: MOCK_NOW,
  }
  updateLibrary({ comments: [...library.value.comments, comment] })
  return succeed({ comment })
}

/** Удалить можно свой комментарий, написанный в моке; ответы на него уходят вместе с ним. */
export function deleteComment(commentId: CommentId): MutationResult {
  if (!library.value.comments.some((item) => item.id === commentId)) return fail('not_found')
  updateLibrary({ comments: library.value.comments.filter((item) => item.id !== commentId && item.parentId !== commentId) })
  return succeed()
}

// ── Скрытые и заблокированные (§12.4, §20.1) ──────────────────────────────

export function setHiddenAuthor(authorId: AuthorId, on: boolean): MutationResult<{ active: boolean }> {
  if (getAuthor(authorId) === undefined) return fail('not_found')
  if (authorId === VIEWER_ID) return fail('self_action')
  const hiddenAuthorIds = withMember(library.value.hiddenAuthorIds, authorId, on)
  if (hiddenAuthorIds !== library.value.hiddenAuthorIds) updateLibrary({ hiddenAuthorIds })
  return succeed({ active: on })
}

export function setHiddenVenue(venueId: VenueId, on: boolean): MutationResult<{ active: boolean }> {
  if (getVenue(venueId) === undefined) return fail('not_found')
  const hiddenVenueIds = withMember(library.value.hiddenVenueIds, venueId, on)
  if (hiddenVenueIds !== library.value.hiddenVenueIds) updateLibrary({ hiddenVenueIds })
  return succeed({ active: on })
}

/**
 * Блокировка сильнее подписки: снимает подписку на автора. Разблокировка подписку не возвращает (§12.4).
 * `unfollowed` — была ли подписка снята этим вызовом.
 */
export function setBlockedAuthor(authorId: AuthorId, on: boolean): MutationResult<{ active: boolean; unfollowed: boolean }> {
  if (getAuthor(authorId) === undefined) return fail('not_found')
  if (authorId === VIEWER_ID) return fail('self_action')
  const blockedAuthorIds = withMember(library.value.blockedAuthorIds, authorId, on)
  const unfollowed = on && library.value.followedAuthorIds.includes(authorId)
  if (blockedAuthorIds !== library.value.blockedAuthorIds) {
    updateLibrary({ blockedAuthorIds, ...(unfollowed ? { followedAuthorIds: library.value.followedAuthorIds.filter((id) => id !== authorId) } : {}) })
  }
  return succeed({ active: on, unfollowed })
}

// ── Недавно просмотренное ─────────────────────────────────────────────────

const RECENTLY_VIEWED_LIMIT = 30

/** Помечает объект просмотренным: он поднимается наверх без дублей, хвост списка обрезается. */
export function markViewed(kind: RecentlyViewedKind, id: string): void {
  const rest = library.value.recentlyViewed.filter((item) => !(item.kind === kind && item.id === id))
  updateLibrary({ recentlyViewed: [{ kind, id, viewedAt: MOCK_NOW }, ...rest].slice(0, RECENTLY_VIEWED_LIMIT) })
}

/** «Очистить историю просмотров» (M8, ST1): список пуст, сами объекты не затрагиваются. */
export function clearRecentlyViewed(): void {
  updateLibrary({ recentlyViewed: [] })
}

// ── Удаление отзыва, «Не интересно» ───────────────────────────────────────

/** Удаляет свой отзыв; оценка остаётся: Оценка и Отзыв — разные сущности (§16.1–16.2). */
export function removeReview(reviewId: string): MutationResult {
  const review = library.value.reviews.find((item) => item.id === reviewId)
  if (review === undefined) return fail('not_found')
  updateLibrary({ reviews: library.value.reviews.filter((item) => item.id !== reviewId) })
  return succeed()
}

/** «Не интересно» (O10): публикация пропадает из Ленты; `on: false` — «Отменить». */
export function setPostDismissed(postId: PostId, on: boolean): MutationResult<{ active: boolean }> {
  updateLibrary({ dismissedPostIds: withMember(library.value.dismissedPostIds, postId, on) })
  return succeed({ active: on })
}
