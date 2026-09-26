import type { PostComment } from '@/mocks/types'
import type { AuthorLike } from '../shared/types'

/** Отправка комментария: «Отправляем…» и «Не отправлено» с «Повторить» (O8). */
export type CommentSendState = 'sent' | 'sending' | 'failed'

export interface CommentItemProps {
  comment: PostComment
  author: AuthorLike
  /** Свой комментарий: в меню «Изменить» и «Удалить», а не «Пожаловаться». */
  own?: boolean
  /** Ответ на комментарий: без кнопки «Ответить» рядом с меню, один уровень вложенности (§14.1). */
  reply?: boolean
  /** Автор отключил комментарии или пользователь не может отвечать: кнопки «Ответить» нет. */
  canReply?: boolean
  sendState?: CommentSendState
  deferred?: boolean
}
