import type { IconName } from '../../../icons'

export interface UiIconButtonProps {
  icon: IconName
  /** Если задан, вместо кнопки рендерится ссылка. */
  href?: string
  /** Обязательная подпись для скринридера: у кнопки нет текста. */
  label: string
  /** `overlay` — поверх изображения, `plain` — без рамки и фона. */
  variant?: 'overlay' | 'plain'
  size?: 'sm' | 'md'
  /** Включено ли состояние «выбрано» (иконка заливается). `undefined` — кнопка без состояния. */
  pressed?: boolean
}
