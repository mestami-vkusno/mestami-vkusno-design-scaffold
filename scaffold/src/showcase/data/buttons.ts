import type { UiButtonPreviewState, UiButtonVariant } from '@/design-system'

export interface ButtonStateColumn {
  label: string
  preview?: UiButtonPreviewState
  loading?: boolean
  disabled?: boolean
}

export interface ButtonStateRow {
  label: string
  variant: UiButtonVariant
}

export const BUTTON_STATE_COLUMNS: readonly ButtonStateColumn[] = [
  { label: 'По умолчанию' },
  { label: 'Наведение', preview: 'hover' },
  { label: 'Нажатие', preview: 'pressed' },
  { label: 'Фокус', preview: 'focus' },
  { label: 'Загрузка', loading: true },
  { label: 'Отключена', disabled: true },
]

export const BUTTON_STATE_ROWS: readonly ButtonStateRow[] = [
  { label: 'Заливка', variant: 'primary' },
  { label: 'Контур', variant: 'outline' },
]
