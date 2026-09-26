/*
  Селекторы социального слоя: авторы, публикации, комментарии, оценки и отзывы, Лента.
  «Публично видимой» считается публикация с `visibility: 'public'` и статусом `published` — только такие попадают в Ленту,
  карточку заведения и профиль автора. Закрытый профиль скрывает свой экран, но не отдельные публичные публикации (§15.2).
*/
import { authors } from '../authors'
import { collections } from '../collections'
import { MOCK_LIBRARY, MOCK_USER } from '../library'
import { postComments, userPosts, venuePosts } from '../posts'
import { ratings, reviews } from '../reviews'
import type {
  Author,
  AuthorId,
  CityId,
  Collection,
  FeedItem,
  FeedMode,
  FeedSource,
  MenuItemId,
  Photo,
  PostComment,
  PostId,
  Rating,
  Review,
  UserPost,
  VenueId,
  VenuePost,
} from '../types'
import { getVenue } from './places'

const authorById = new Map<AuthorId, Author>(authors.map((author) => [author.id, author]))
const postById = new Map<PostId, UserPost>(userPosts.map((post) => [post.id, post]))
const venuePostById = new Map<PostId, VenuePost>(venuePosts.map((post) => [post.id, post]))

// ── Авторы ────────────────────────────────────────────────────────────────

export function allAuthors(): readonly Author[] {
  return authors
}

/**
 * Правка своего профиля (имя, @username, «О себе», видимость) лежит не в данных, а в настройках пользователя (`state/settings.ts`).
 * Она подключает сюда функцию-«надстройку»: получает автора из данных и возвращает его с правками (для чужих — как есть).
 */
type AuthorOverlay = (author: Author) => Author
let authorOverlay: AuthorOverlay | null = null

export function setAuthorOverlay(next: AuthorOverlay | null): void {
  authorOverlay = next
}

export function getAuthor(id: AuthorId): Author | undefined {
  const author = authorById.get(id)
  return author === undefined || authorOverlay === null ? author : authorOverlay(author)
}

export function getAuthorByUsername(username: string): Author | undefined {
  const clean = username.replace(/^@/, '')
  const overlay = authorOverlay
  return authors.map((author) => (overlay === null ? author : overlay(author))).find((author) => author.username === clean)
}

/** Закрытый профиль: на экране только имя, аватар и пометка (§15.2). */
export function isAuthorClosed(author: Author): boolean {
  return author.profileVisibility === 'private'
}

/** Авторы для модуля Главной: публичные, по числу подписчиков; без заблокированных и скрытых пользователем. */
export function featuredAuthors(cityId?: CityId, limit = 6, viewerId: AuthorId | null = null): readonly Author[] {
  const excluded = viewerId === MOCK_USER.id ? [...MOCK_USER.settings.blockedAuthorIds, ...MOCK_USER.settings.hiddenAuthorIds] : []
  return authors
    .filter((author) => !isAuthorClosed(author) && !excluded.includes(author.id) && author.id !== viewerId && (cityId === undefined || author.cityId === cityId))
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, limit)
}

// ── Публикации ────────────────────────────────────────────────────────────

export function isPubliclyVisible(post: UserPost): boolean {
  return post.visibility === 'public' && post.status === 'published'
}

export function getPost(id: PostId): UserPost | undefined {
  return postById.get(id)
}

export function getVenuePost(id: PostId): VenuePost | undefined {
  return venuePostById.get(id)
}

export function allPublicPosts(): readonly UserPost[] {
  return userPosts.filter(isPubliclyVisible)
}

/** Вкладка «Публикации» профиля. Закрытый профиль публикации на своём экране не показывает. */
export function postsByAuthor(authorId: AuthorId): readonly UserPost[] {
  const author = getAuthor(authorId)
  if (author === undefined || isAuthorClosed(author)) return []
  return allPublicPosts().filter((post) => post.authorId === authorId).sort(byNewest)
}

export function postsByVenue(venueId: VenueId): readonly UserPost[] {
  return allPublicPosts().filter((post) => post.venueId === venueId).sort(byNewest)
}

export function postsByMenuItem(menuItemId: MenuItemId): readonly UserPost[] {
  return allPublicPosts().filter((post) => post.menuItemId === menuItemId).sort(byNewest)
}

export function venuePostsByVenue(venueId: VenueId): readonly VenuePost[] {
  return venuePosts.filter((post) => post.venueId === venueId).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function byNewest(a: UserPost, b: UserPost): number {
  return b.createdAt.localeCompare(a.createdAt)
}

/** Комментарии верхнего уровня с ответами (один уровень, §14.1). */
export interface CommentThread {
  readonly comment: PostComment
  readonly replies: readonly PostComment[]
}

export function getCommentThreads(postId: PostId): readonly CommentThread[] {
  const all = postComments.filter((comment) => comment.postId === postId)
  return all
    .filter((comment) => comment.parentId === undefined)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((comment) => ({ comment, replies: all.filter((reply) => reply.parentId === comment.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }))
}

export function commentsCount(postId: PostId): number {
  return postComments.filter((comment) => comment.postId === postId).length
}

// ── Оценки и отзывы ───────────────────────────────────────────────────────

/** Активные оценки заведения; замененные новыми в счёт не идут (§16.1). */
export function activeRatingsByVenue(venueId: VenueId): readonly Rating[] {
  return ratings.filter((rating) => rating.venueId === venueId && rating.active)
}

/** Единственная активная оценка пользователя на заведение. */
export function getActiveRating(userId: AuthorId, venueId: VenueId): Rating | undefined {
  return ratings.find((rating) => rating.userId === userId && rating.venueId === venueId && rating.active)
}

export function getReview(userId: AuthorId, venueId: VenueId): Review | undefined {
  return reviews.find((review) => review.userId === userId && review.venueId === venueId)
}

/** Опубликованные отзывы заведения, свежие сверху. */
export function reviewsByVenue(venueId: VenueId): readonly Review[] {
  return reviews.filter((review) => review.venueId === venueId && review.status === 'published').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Вкладка «Обзоры» профиля (отзывы автора). Закрытый профиль их на своём экране не показывает. */
export function reviewsByAuthor(authorId: AuthorId): readonly Review[] {
  const author = getAuthor(authorId)
  if (author === undefined || isAuthorClosed(author)) return []
  return reviews.filter((review) => review.userId === authorId && review.status === 'published')
}

export function ratingForReview(review: Review): Rating | undefined {
  return ratings.find((rating) => rating.id === review.ratingId)
}

/** Оценок по мокам меньше, чем в агрегате `venue.rating.count` (там показывается «настоящее» число); этот счётчик — только по данным мока. */
export function mockRatingsCount(venueId: VenueId): number {
  return activeRatingsByVenue(venueId).length
}

// ── Фото посетителей ──────────────────────────────────────────────────────

export interface VisitorPhoto {
  readonly photo: Photo
  readonly source: { readonly kind: 'post'; readonly id: PostId } | { readonly kind: 'review'; readonly id: string }
}

/** Фото посетителей: из публичных публикаций и отзывов. Фото отзыва не создаёт публикацию (§3.4). */
export function visitorPhotos(venueId: VenueId): readonly VisitorPhoto[] {
  const fromPosts = postsByVenue(venueId).flatMap((post) => post.photos.map((photo): VisitorPhoto => ({ photo, source: { kind: 'post', id: post.id } })))
  const fromReviews = reviewsByVenue(venueId).flatMap((review) => review.photos.map((photo): VisitorPhoto => ({ photo, source: { kind: 'review', id: review.id } })))
  return [...fromPosts, ...fromReviews]
}

/** Вкладка «Фото» профиля. */
export function photosByAuthor(authorId: AuthorId): readonly VisitorPhoto[] {
  const author = getAuthor(authorId)
  if (author === undefined || isAuthorClosed(author)) return []
  const fromPosts = postsByAuthor(authorId).flatMap((post) => post.photos.map((photo): VisitorPhoto => ({ photo, source: { kind: 'post', id: post.id } })))
  const fromReviews = reviewsByAuthor(authorId).flatMap((review) => review.photos.map((photo): VisitorPhoto => ({ photo, source: { kind: 'review', id: review.id } })))
  return [...fromPosts, ...fromReviews]
}

/** Вкладка «Подборки» профиля: публичные опубликованные. */
export function collectionsByAuthor(authorId: AuthorId): readonly Collection[] {
  const author = getAuthor(authorId)
  if (author === undefined || isAuthorClosed(author)) return []
  return collections.filter((collection) => collection.ownerId === authorId && collection.visibility === 'public' && collection.status === 'published')
}

// ── Лента ─────────────────────────────────────────────────────────────────

/** Индикатор «Есть новые публикации»: сколько записей появилось после того, как сеанс Ленты был открыт (§12.2). */
export const FEED_NEW_POSTS_COUNT = 3

export interface FeedOptions {
  readonly mode?: FeedMode
  readonly source?: FeedSource
  readonly cityId?: CityId
  /** Пользователь, для которого строится Лента; гость — `null`. */
  readonly viewerId?: AuthorId | null
}

function collectionCard(collection: Collection): FeedItem {
  return { kind: 'collection', id: `feed-${collection.id}`, collectionId: collection.id, at: collection.updatedAt }
}

/**
 * Лента (§12.1): `Для вас | Подписки` × `Все | Авторы | Заведения`. Публикации пользователей, официальный контент заведений
 * (отдельный тип карточки) и подборки. Приватные, черновики и публикации на модерации сюда не попадают.
 * Заблокированные и скрытые пользователем авторы и скрытые заведения не показываются. «Подписки» у гостя пусты.
 */
export function feed(options: FeedOptions = {}): readonly FeedItem[] {
  const mode = options.mode ?? 'for_you'
  const source = options.source ?? 'all'
  const viewer = options.viewerId ?? null
  const settings = viewer === MOCK_USER.id ? MOCK_USER.settings : undefined
  const followedAuthors = viewer === MOCK_USER.id ? MOCK_LIBRARY.followedAuthorIds : []
  const followedVenues = viewer === MOCK_USER.id ? MOCK_LIBRARY.followedVenueIds : []
  const hiddenAuthors = [...(settings?.hiddenAuthorIds ?? []), ...(settings?.blockedAuthorIds ?? [])]
  const hiddenVenues = settings?.hiddenVenueIds ?? []
  const inCity = (venueId: VenueId | null): boolean => {
    if (options.cityId === undefined) return true
    return venueId !== null && getVenue(venueId)?.cityId === options.cityId
  }

  const items: FeedItem[] = []
  if (source === 'all' || source === 'authors') {
    for (const post of allPublicPosts()) {
      if (hiddenAuthors.includes(post.authorId) || (post.venueId !== null && hiddenVenues.includes(post.venueId)) || !inCity(post.venueId)) continue
      if (mode === 'following' && !followedAuthors.includes(post.authorId)) continue
      items.push({ kind: 'user_post', id: `feed-${post.id}`, postId: post.id, at: post.createdAt })
    }
    for (const collection of collections) {
      if (collection.visibility !== 'public' || collection.status !== 'published' || collection.kind !== 'user') continue
      if (collection.ownerId === null || hiddenAuthors.includes(collection.ownerId)) continue
      if (options.cityId !== undefined && collection.cityId !== options.cityId) continue
      if (mode === 'following' && !followedAuthors.includes(collection.ownerId)) continue
      items.push(collectionCard(collection))
    }
  }
  if (source === 'all' || source === 'venues') {
    for (const post of venuePosts) {
      if (hiddenVenues.includes(post.venueId) || !inCity(post.venueId)) continue
      if (mode === 'following' && !followedVenues.includes(post.venueId)) continue
      items.push({ kind: 'venue_post', id: `feed-${post.id}`, postId: post.id, at: post.publishedAt })
    }
  }
  if (source === 'all' && mode === 'for_you') {
    for (const collection of collections) {
      if (collection.kind === 'editorial' && (options.cityId === undefined || collection.cityId === options.cityId)) items.push(collectionCard(collection))
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at))
}

export function isPostLikedBy(userId: AuthorId | null, postId: PostId): boolean {
  return userId !== null && userId === MOCK_LIBRARY.userId && MOCK_LIBRARY.likedPostIds.includes(postId)
}
