import type { NavItem } from '../../../types'

export interface UiAppHeaderProps {
  items: readonly NavItem[]
  /** Название выбранного города; без него кнопка города не показывается. */
  city?: string
  /** Адрес, на который ведёт логотип. */
  homeHref?: string
  label?: string
}
