import type { Collection, Photo, UserPost, VenuePost, VenueRating } from '@/mocks/types'
import type { AuthorLike, HeadingLevel } from '../shared/types'

/** Заведение, к которому привязана публикация или которое её выпустило. Названия и район берёт страница из селекторов. */
export interface PostVenueRef {
  readonly id: string
  readonly name: string
  /** Район: «Петроградский район». */
  readonly location?: string
  readonly rating?: VenueRating | null
  /** Снимок для аватара официального контента (логотип или главное фото). */
  readonly logo?: Photo
}

/** Позиция меню, к которой привязана публикация; `removed` — позиции больше нет (историческая ссылка, без перехода). */
export interface PostDishRef {
  readonly id: string
  readonly venueId: string
  readonly name: string
  readonly removed?: boolean
}

export interface PostEventRef {
  readonly id: string
  readonly title: string
}

/** Публикация пользователя (§13): автор, @username, дата, текст, фото, привязка, лайк, комментарий, сохранение, «поделиться». */
export interface UserPostCardData {
  readonly variant: 'user'
  readonly post: UserPost
  readonly author: AuthorLike
  readonly venue?: PostVenueRef
  readonly dish?: PostDishRef
  readonly event?: PostEventRef
  /** Число комментариев (`useLibrary().commentsCountOf(post.id)`). */
  readonly commentsCount: number
  /** Своя публикация: пометка «Вы». */
  readonly own?: boolean
}

/** Официальный контент заведения (§14.1): подпись «Заведение», скруглённый аватар, рамка `--lime-line`. Комментариев нет. */
export interface VenuePostCardData {
  readonly variant: 'venue'
  readonly post: VenuePost
  readonly venue: PostVenueRef
  readonly event?: PostEventRef
}

/** Подборка в потоке: плитка, подпись автора или редакции, «сохранить» и «поделиться». */
export interface CollectionPostCardData {
  readonly variant: 'collection'
  readonly collection: Collection
  /** `collectionByline(collection)`. */
  readonly byline: string
  /** Автор пользовательской подборки; у редакционной его нет. */
  readonly author?: AuthorLike
}

export type PostCardData = UserPostCardData | VenuePostCardData | CollectionPostCardData

export interface PostCardProps {
  data: PostCardData
  /** Уровень заголовка карточки: имя автора, название публикации заведения или подборки. */
  headingLevel?: HeadingLevel
  /** Лента длинная: карточки вне экрана не считаются и не рисуются (по умолчанию включено). */
  deferred?: boolean
}
