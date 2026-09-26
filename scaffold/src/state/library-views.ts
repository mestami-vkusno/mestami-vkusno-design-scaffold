import { getCollection } from '@/mocks/selectors/collections'
import { getEvent } from '@/mocks/selectors/events'
import type { Drafts, RatingEntry, VisitEntry } from '@/mocks/selectors/library'
import { getVenue } from '@/mocks/selectors/places'
import { feed, getCommentThreads, getPost, getVenuePost, reviewsByVenue, type CommentThread } from '@/mocks/selectors/social'
import type { Collection, FeedItem, Rating, RecentlyViewed, Review, UserPost, Venue, VenueEvent, VenueId } from '@/mocks/types'
import type { FeedOptions } from '@/mocks/selectors/social'
import { BASE_LIKED_POST_IDS, library } from './library-state'
import { VIEWER_ID } from './session'

/*
  Чтения библиотеки: то же, что дают селекторы `@/mocks/selectors/library`, но по живому состоянию, а не по исходным данным.
  Читают `library.value`, поэтому внутри `computed` и шаблона реактивны. Данные заведений, публикаций, подборок и событий берутся селекторами.
  Личное (Избранное, Посещения, оценки, сохранения) наружу, в публичные выдачи, не попадает: публичны только отзывы и комментарии.
*/

/** Избранное: последние добавленные сверху. */
export function favoriteVenues(): readonly Venue[] {
  return [...library.value.favorites]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .flatMap((favorite) => {
      const venue = getVenue(favorite.venueId)
      return venue === undefined ? [] : [venue]
    })
}

export function activeRatingOf(venueId: VenueId): Rating | undefined {
  return library.value.ratings.find((rating) => rating.venueId === venueId && rating.active)
}

export function reviewOf(venueId: VenueId): Review | undefined {
  return library.value.reviews.find((review) => review.venueId === venueId)
}

/** Посещения, свежие сверху; приватны, ресторану и подписчикам не показываются (§16.3). */
export function visitEntries(): readonly VisitEntry[] {
  return [...library.value.visits]
    .sort((a, b) => b.visitedOn.localeCompare(a.visitedOn))
    .flatMap((visit): VisitEntry[] => {
      const venue = getVenue(visit.venueId)
      if (venue === undefined) return []
      const event = visit.eventId === undefined ? undefined : getEvent(visit.eventId)
      const rating = activeRatingOf(visit.venueId)
      const review = reviewOf(visit.venueId)
      const post = library.value.posts.find((item) => item.visitId === visit.id)
      return [
        {
          visit,
          venue,
          ...(event === undefined ? {} : { event }),
          ...(rating === undefined ? {} : { rating }),
          ...(review === undefined ? {} : { review }),
          ...(post === undefined ? {} : { post }),
        },
      ]
    })
}

/** «Оценки и отзывы»: одна активная оценка и не более одного отзыва на заведение. */
export function ratingEntries(): readonly RatingEntry[] {
  return library.value.ratings
    .filter((rating) => rating.active)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .flatMap((rating): RatingEntry[] => {
      const venue = getVenue(rating.venueId)
      if (venue === undefined) return []
      const review = library.value.reviews.find((item) => item.ratingId === rating.id)
      return [{ venue, rating, ...(review === undefined ? {} : { review }) }]
    })
}

export function savedPostList(): readonly UserPost[] {
  return library.value.savedPosts.flatMap((saved) => {
    const post = getPost(saved.id)
    return post === undefined ? [] : [post]
  })
}

export function savedCollectionList(): readonly Collection[] {
  return library.value.savedCollections.flatMap((saved) => {
    const collection = getCollection(saved.id)
    return collection === undefined ? [] : [collection]
  })
}

/** Сохранённые события остаются в списке и перенесёнными, и отменёнными. */
export function savedEventList(): readonly VenueEvent[] {
  return library.value.savedEvents.flatMap((saved) => {
    const event = getEvent(saved.id)
    return event === undefined ? [] : [event]
  })
}

/** Публикации, черновики и дневник пользователя, свежие изменения сверху. */
export function postList(): readonly UserPost[] {
  return [...library.value.posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/** Дневник: приватные записи, заведение необязательно (§13.1). */
export function diaryList(): readonly UserPost[] {
  return postList().filter((post) => post.visibility === 'private')
}

/** Черновики и публикации, ожидающие действия автора (§13.4), и черновики подборок. */
export function draftList(): Drafts {
  return {
    posts: postList().filter((post) => post.visibility === 'public' && post.status !== 'published'),
    collections: [...library.value.collections].filter((collection) => collection.status === 'draft').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  }
}

/** Подборки пользователя: свежие изменения сверху. */
export function collectionList(): readonly Collection[] {
  return [...library.value.collections].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function recentlyViewedList(): readonly RecentlyViewed[] {
  return [...library.value.recentlyViewed].sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
}

/** Счётчик лайков с учётом отметки пользователя: базовое число из данных плюс/минус его собственное действие. */
export function likesCountOf(postId: string, baseCount: number): number {
  const liked = library.value.likedPostIds.includes(postId)
  const wasLiked = BASE_LIKED_POST_IDS.includes(postId)
  return baseCount + (liked === wasLiked ? 0 : liked ? 1 : -1)
}

/**
 * Лента для вошедшего: подписки, скрытые и заблокированные берутся из живого состояния. Селектор `feed()` считает их
 * по исходным настройкам мока, поэтому вызывается как для гостя (без фильтров пользователя), а фильтрация — здесь.
 */
export function feedItems(options: Omit<FeedOptions, 'viewerId'> = {}): readonly FeedItem[] {
  const { hiddenAuthorIds, blockedAuthorIds, hiddenVenueIds, followedAuthorIds, followedVenueIds, dismissedPostIds } = library.value
  const following = options.mode === 'following'
  const items = feed({ ...options, mode: 'for_you', viewerId: null })
  return items.filter((item) => {
    if (item.kind === 'user_post') {
      if (dismissedPostIds.includes(item.postId)) return false
      const post = getPost(item.postId)
      const authorId = post?.authorId
      const venueId = post?.venueId ?? null
      if (authorId === undefined || hiddenAuthorIds.includes(authorId) || blockedAuthorIds.includes(authorId)) return false
      if (venueId !== null && hiddenVenueIds.includes(venueId)) return false
      return !following || followedAuthorIds.includes(authorId)
    }
    if (item.kind === 'venue_post') {
      const venueId = getVenuePost(item.postId)?.venueId
      if (venueId === undefined || hiddenVenueIds.includes(venueId)) return false
      return !following || followedVenueIds.includes(venueId)
    }
    const collection = getCollection(item.collectionId)
    if (collection === undefined) return false
    if (collection.ownerId !== null && (hiddenAuthorIds.includes(collection.ownerId) || blockedAuthorIds.includes(collection.ownerId))) return false
    return !following || (collection.kind === 'user' && collection.ownerId !== null && followedAuthorIds.includes(collection.ownerId))
  })
}

/** Публичные отзывы заведения: чужие из данных и отзыв пользователя в его текущей версии. Свежие сверху. */
export function reviewsForVenue(venueId: VenueId): readonly Review[] {
  const others = reviewsByVenue(venueId).filter((review) => review.userId !== VIEWER_ID)
  const mine = library.value.reviews.filter((review) => review.venueId === venueId && review.status === 'published')
  return [...others, ...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Комментарии к публикации с ответами: из данных и написанные в моке; комментарии заблокированных не показываются (§12.4). */
export function commentThreads(postId: string): readonly CommentThread[] {
  const { comments, blockedAuthorIds } = library.value
  const base = getCommentThreads(postId).flatMap((thread) => [thread.comment, ...thread.replies])
  const all = [...base, ...comments.filter((comment) => comment.postId === postId)].filter((comment) => !blockedAuthorIds.includes(comment.authorId))
  const byTime = (a: { createdAt: string }, b: { createdAt: string }): number => a.createdAt.localeCompare(b.createdAt)
  return all
    .filter((comment) => comment.parentId === undefined)
    .sort(byTime)
    .map((comment) => ({ comment, replies: all.filter((reply) => reply.parentId === comment.id).sort(byTime) }))
}

/** Число комментариев, которые пользователь видит (без заблокированных авторов). */
export function commentsCountOf(postId: string): number {
  return commentThreads(postId).reduce((sum, thread) => sum + 1 + thread.replies.length, 0)
}
