import type { IconName } from '../../../icons'

export type ToastVariant = 'default' | 'success' | 'danger'

/** Кнопка в тосте: «Отменить». После нажатия тост закрывается сам. */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Текст тоста. Читается скринридером сразу при появлении. */
  text: string
  variant?: ToastVariant
  /** Иконка слева; по умолчанию у `success` галочка, у `danger` знак предупреждения. */
  icon?: IconName
  action?: ToastAction
  /** Сколько мс показывать; `0` — до закрытия вручную. По умолчанию 4 с, с действием 8 с. */
  duration?: number
}

export interface ToastItem extends ToastOptions {
  id: number
}

export interface UiToastProps {
  /** Название региона для скринридера. */
  label?: string
  /** Сколько тостов видно одновременно; старые уходят первыми. */
  max?: number
  closeLabel?: string
}
