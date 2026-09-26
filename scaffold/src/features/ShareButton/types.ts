export type ShareKind = 'venue' | 'menu_item' | 'event' | 'post' | 'collection' | 'author' | 'review'

/** Что делится: объект и ссылка на него. Приватное не делится (§22): такой объект блок не получает. */
export interface ShareTarget {
  readonly kind: ShareKind
  readonly id: string
  readonly title: string
  /** Адрес объекта внутри приложения (`/venue/1`); по умолчанию — текущая страница. */
  readonly href?: string
}

export interface ShareButtonProps {
  target: ShareTarget
  variant?: 'action' | 'overlay' | 'plain'
  /** Подпись действия; по умолчанию «Поделиться». */
  label?: string
}

/**
 * Имя события на `window`, которым блок просит открыть шторку «Поделиться» (O7, задача 0013).
 * Шторка забирает событие себе через `event.preventDefault()`; если её нет, блок сам копирует ссылку и показывает тост.
 */
export const SHARE_EVENT = 'mv:share'
