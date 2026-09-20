export interface UiCodeInputProps {
  /** Количество цифр в коде. */
  length?: number
  /** id первой ячейки: к ней привязывается подпись поля. */
  id?: string
  invalid?: boolean
  /** Подпись ячейки для скринридера; `{n}` заменяется номером. */
  cellLabel?: string
}
