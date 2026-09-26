import type { NavItem } from '../../../types'
import type { IconName } from '../../../icons'

/**
 * Пункт нижней панели: иконка обязательна.
 * `popup` — пункт не ведёт на страницу, а открывает панель («Создать»): рендерится кнопкой, активным не становится.
 */
export type TabBarItem = NavItem & { icon: IconName; popup?: 'dialog' | 'menu' }

export interface UiTabBarProps {
  items: readonly TabBarItem[]
  label?: string
}
