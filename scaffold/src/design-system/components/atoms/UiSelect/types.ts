import type { SelectOption } from '../../../types'

export interface UiSelectProps {
  options: readonly SelectOption[]
  placeholder?: string
  invalid?: boolean
}
