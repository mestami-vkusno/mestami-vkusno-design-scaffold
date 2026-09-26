export interface UiInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date'
  invalid?: boolean
  /** Для `type="date"`: самая поздняя дата (`YYYY-MM-DD`), например сегодняшняя; поле нативное, календарь открывает система. */
  max?: string
  /** Для `type="date"`: самая ранняя дата (`YYYY-MM-DD`). */
  min?: string
  /** Принудительное состояние фокуса для витрины; в продукте не используется. */
  previewState?: 'focus'
}
