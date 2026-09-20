import type { IconName } from '../../../icons'

export interface UiSearchInputProps {
  /** Название поля для скринридера. */
  label: string
  placeholder?: string
  /** Иконка лаймовой кнопки: лупа для поиска, стрелка для отправки. */
  buttonIcon?: IconName
  buttonLabel?: string
}
