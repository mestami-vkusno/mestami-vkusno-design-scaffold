import type { ImageTone } from '../../../types'

export interface UiImageProps {
  /** Адрес снимка. Без него показывается градиент-заглушка. */
  src?: string
  alt?: string
  tone?: ImageTone
  /** Пропорции; `fill` — занять весь родитель. */
  ratio?: '4/3' | '5/4' | 'fill'
}
