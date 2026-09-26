import type { VenueRating } from '@/mocks/types'

export interface RatingLabelProps {
  /** Агрегат заведения. Публично показывается только при достаточной выборке (§16.1): иначе «Мало оценок» или «Нет оценок». */
  rating: VenueRating | null
  /** Число отзывов в скобках. */
  showCount?: boolean
  /** Не рисовать ничего, если агрегат скрыт (вместо «Мало оценок»). */
  hideWhenHidden?: boolean
}
