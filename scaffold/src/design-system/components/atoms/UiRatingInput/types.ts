export interface UiRatingInputProps {
  /** Название группы для скринридера («Ваша оценка»). */
  label: string
  disabled?: boolean
  invalid?: boolean
  /** Подпись одной звезды для скринридера; по умолчанию «3 из 5». */
  valueLabel?: (value: number) => string
  /** Принудительное состояние фокуса на выбранной звезде для витрины; в продукте не используется. */
  previewState?: 'focus'
}
