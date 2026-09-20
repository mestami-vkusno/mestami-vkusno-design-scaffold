import type { IconName } from '../../../icons'

export type UiBadgeVariant = 'new' | 'accent' | 'warning' | 'success' | 'neutral'

export interface UiBadgeProps {
  variant?: UiBadgeVariant
  /** Полностью скруглённая «пилюля» — для категорий. Прямоугольная — для статусов. */
  pill?: boolean
  icon?: IconName
}
