import type { IconName } from '../../../icons'

export interface InfoListItem {
  icon: IconName
  title: string
  subtitle?: string
}

export interface UiInfoListProps {
  items: readonly InfoListItem[]
}
