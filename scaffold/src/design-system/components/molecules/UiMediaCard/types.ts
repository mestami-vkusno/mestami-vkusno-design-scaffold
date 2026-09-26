import type { ImageTone } from '../../../types'

export interface UiMediaCardProps {
  title: string
  subtitle?: string
  src?: string
  tone?: ImageTone
  /** `column` — фото сверху (по умолчанию), `row` — фото слева, текст справа: списки и результаты поиска. */
  layout?: 'column' | 'row'
  /** Показать кнопку «в избранное» на изображении; состояние — `v-model:favorite`. */
  showFavorite?: boolean
  favoriteLabel?: string
}
