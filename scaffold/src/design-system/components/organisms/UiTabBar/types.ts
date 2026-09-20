import type { NavItem } from '../../../types'
import type { IconName } from '../../../icons'

/** Пункт нижней панели: иконка обязательна. */
export type TabBarItem = NavItem & { icon: IconName }

export interface UiTabBarProps {
  items: readonly TabBarItem[]
  label?: string
}
