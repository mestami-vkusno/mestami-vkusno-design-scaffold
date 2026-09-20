import type { IconName } from '../../../icons'

export type UiButtonVariant = 'primary' | 'outline' | 'neutral' | 'secondary' | 'ghost'
export type UiButtonSize = 'sm' | 'md' | 'lg'
/** Принудительное состояние для витрины и скриншотов; в продукте не используется. */
export type UiButtonPreviewState = 'hover' | 'pressed' | 'focus'

export interface UiButtonProps {
  variant?: UiButtonVariant
  size?: UiButtonSize
  /** На всю ширину контейнера. */
  block?: boolean
  loading?: boolean
  disabled?: boolean
  /** Если задан, вместо кнопки рендерится ссылка. */
  href?: string
  type?: 'button' | 'submit' | 'reset'
  iconLeft?: IconName
  iconRight?: IconName
  previewState?: UiButtonPreviewState
}
