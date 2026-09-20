import type { NavItem } from '../../../types'

export interface UiSideMenuProps {
  items: readonly NavItem[]
  /** Второстепенные пункты внизу меню (например, «Выйти»). */
  secondaryItems?: readonly NavItem[]
  label?: string
}
