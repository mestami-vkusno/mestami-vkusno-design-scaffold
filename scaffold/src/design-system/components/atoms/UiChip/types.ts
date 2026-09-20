import type { IconName } from '../../../icons'

export interface UiChipProps {
  selected?: boolean
  /** `inverse` — контрастный чип, `tag` — выбранное значение фильтра (можно убрать). */
  variant?: 'default' | 'inverse' | 'tag'
  size?: 'md' | 'sm'
  icon?: IconName
  trailingIcon?: IconName
  /** Показать кнопку удаления (для `tag`). */
  removable?: boolean
  removeLabel?: string
}
