import type { Photo, Review, StarValue } from '@/mocks/types'
import type { AuthorLike, HeadingLevel } from '../shared/types'

/** Заведение, к которому относится отзыв (в «Мои отзывы» и в профиле автора). */
export interface ReviewVenueRef {
  readonly id: string
  readonly name: string
  readonly photo?: Photo
  /** Район или тип: вторая строка. */
  readonly subtitle?: string
}

export interface ReviewCardProps {
  review: Review
  /** Оценка, к которой привязан отзыв (1–5); отзыв без активной оценки не существует (§16.2), но данные могут её не нести. */
  rating: StarValue | null
  author: AuthorLike
  /** Показать заведение над текстом: в профиле автора и в «Мои оценки и отзывы». */
  venue?: ReviewVenueRef
  /** Свой отзыв: «Редактировать» и «Удалить». */
  own?: boolean
  /** Чужой отзыв: кнопка «Пожаловаться» (O9а); страница открывает окно жалобы по событию `report`. */
  reportable?: boolean
  headingLevel?: HeadingLevel
  deferred?: boolean
}
