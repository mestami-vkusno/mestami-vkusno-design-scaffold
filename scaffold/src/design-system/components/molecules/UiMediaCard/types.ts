import type { ImageTone } from '../../../types'

export interface UiMediaCardProps {
  title: string
  subtitle?: string
  src?: string
  tone?: ImageTone
  /** Показать кнопку «в избранное» на изображении; состояние — `v-model:favorite`. */
  showFavorite?: boolean
  favoriteLabel?: string
}
