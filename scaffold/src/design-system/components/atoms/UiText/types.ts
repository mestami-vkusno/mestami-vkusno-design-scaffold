export type UiTextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body-lg' | 'body' | 'caption' | 'overline'

export interface UiTextProps {
  variant?: UiTextVariant
  /** Тег корневого элемента; по умолчанию выбирается по варианту. */
  as?: string
}
