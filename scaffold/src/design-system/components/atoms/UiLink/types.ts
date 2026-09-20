import type { IconName } from '../../../icons'

export interface UiLinkProps {
  href: string
  /** `accent` — ссылка в тексте (лайм / лаймовое подчёркивание), `muted` — служебная (возврат, цепочка). */
  variant?: 'accent' | 'muted'
  iconLeft?: IconName
  iconRight?: IconName
}
