export interface UiRadioGroupProps {
  /** Название группы для скринридера («Причина жалобы»). */
  label: string
  disabled?: boolean
  invalid?: boolean
  /** Имя для формы; по умолчанию генерируется. */
  name?: string
}
