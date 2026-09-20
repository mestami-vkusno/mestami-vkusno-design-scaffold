export interface UiFieldProps {
  label: string
  hint?: string
  /** Текст ошибки: показывается вместо подсказки, поле помечается как невалидное. */
  error?: string
}

/** Что поле передаёт вложенному элементу управления через слот. */
export interface UiFieldSlotProps {
  id: string
  describedBy: string | undefined
  invalid: boolean
}
