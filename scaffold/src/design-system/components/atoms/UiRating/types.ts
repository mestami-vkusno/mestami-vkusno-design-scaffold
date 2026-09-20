export interface UiRatingProps {
  /** Оценка от 0 до 5. */
  value: number
  /** Количество оценок (показывается в скобках). */
  count?: number
  /** `summary` — одна звезда и число, `stars` — ряд из пяти звёзд. */
  variant?: 'summary' | 'stars'
}
