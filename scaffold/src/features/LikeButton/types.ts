import type { ActionOrigin } from '@/state/types'

export interface LikeButtonProps {
  postId: string
  /** Число «нравится» из данных публикации: к нему блок добавляет собственное действие пользователя. */
  baseCount: number
  origin?: ActionOrigin
}
