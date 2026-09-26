export interface UiTextareaProps {
  invalid?: boolean
  /** Предел символов: ограничивает ввод и включает счётчик «12 / 500». */
  maxLength?: number
  /** Высота растёт по тексту, пока не дойдёт до `maxRows`; дальше поле прокручивается. */
  autoGrow?: boolean
  /** Строк в пустом поле. */
  rows?: number
  /** Строк, после которых рост прекращается. */
  maxRows?: number
  /** Что услышит скринридер, когда лимит близок: получает остаток символов. */
  remainingLabel?: (left: number) => string
  /** Принудительное состояние фокуса для витрины; в продукте не используется. */
  previewState?: 'focus'
}
