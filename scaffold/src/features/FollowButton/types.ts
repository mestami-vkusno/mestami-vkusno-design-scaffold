import type { ActionOrigin } from '@/state/types'

export interface FollowButtonProps {
  /** На кого подписываемся: автор или заведение. */
  kind: 'author' | 'venue'
  id: string
  /** Имя: читается скринридером после подписи («Подписаться Мария»). */
  name?: string
  size?: 'sm' | 'md'
  /** `block` — на всю ширину контейнера. */
  block?: boolean
  origin?: ActionOrigin
}
