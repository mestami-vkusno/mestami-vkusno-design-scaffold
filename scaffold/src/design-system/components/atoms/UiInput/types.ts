export interface UiInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
  invalid?: boolean
  /** Принудительное состояние фокуса для витрины; в продукте не используется. */
  previewState?: 'focus'
}
