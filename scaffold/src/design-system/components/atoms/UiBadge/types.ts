import type { IconName } from '../../../icons'

export type UiBadgeVariant = 'new' | 'accent' | 'warning' | 'success' | 'danger' | 'neutral'

export interface UiBadgeProps {
  variant?: UiBadgeVariant
  /** Полностью скруглённая «пилюля» — для категорий. Прямоугольная — для статусов. */
  pill?: boolean
  icon?: IconName
  /** Точка без текста: непрочитанное на иконке, вкладке или строке. Цвет задаёт `variant`; без `label` точка декоративна. */
  dot?: boolean
  /** Подпись точки для скринридера («Есть непрочитанные»); у обычной метки текст в слоте. */
  label?: string
}
