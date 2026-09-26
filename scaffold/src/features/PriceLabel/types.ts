import type { EventPrice } from '@/mocks/types'

export interface PriceLabelProps {
  /** `event` — стоимость события (6 видов, §11.3), `menu` — цена позиции меню, `check` — средний чек заведения. */
  kind: 'event' | 'menu' | 'check'
  /** Для `event`. */
  event?: EventPrice
  /** Для `menu` и `check`: рубли; `null` — «Цена не указана» / «Чек не указан». */
  amountRub?: number | null
}
