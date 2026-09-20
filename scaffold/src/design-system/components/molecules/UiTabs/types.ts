import type { OptionItem } from '../../../types'

export interface UiTabsProps {
  items: readonly OptionItem[]
  /** Название группы вкладок для скринридера. */
  label: string
}
