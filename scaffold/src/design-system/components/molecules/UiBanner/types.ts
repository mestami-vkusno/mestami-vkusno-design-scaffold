import type { IconName } from '../../../icons'

export type UiBannerVariant = 'info' | 'success' | 'warning' | 'danger'

export interface UiBannerProps {
  variant?: UiBannerVariant
  /** Иконка; по умолчанию своя у каждого варианта. */
  icon?: IconName
  /** Короткий заголовок жирным над текстом. Сам текст — в слоте. */
  title?: string
  /** Показать кнопку закрытия. Escape внутри баннера закрывает его так же. */
  dismissible?: boolean
  dismissLabel?: string
  /** Баннер плавно появляется и исчезает (как тост): для «Нет сети», чтобы его заметили. Обычно не нужен. */
  animated?: boolean
}
