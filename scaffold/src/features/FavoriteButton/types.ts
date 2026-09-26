import type { ActionOrigin } from '@/state/types'

export interface FavoriteButtonProps {
  venueId: string
  /** Название заведения: попадает в подпись для скринридера («В избранное: Birch»). */
  subject?: string
  /** `overlay` — круглая кнопка на фото карточки, `plain` — без фона, `button` — кнопка с текстом (страница заведения). */
  variant?: 'overlay' | 'plain' | 'button'
  size?: 'sm' | 'md'
  /** Откуда нажали: после входа гость вернётся сюда. По умолчанию — текущая страница. */
  origin?: ActionOrigin
}
