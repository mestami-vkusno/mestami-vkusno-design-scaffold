/** Форма скелетона повторяет форму блока: страница не прыгает, когда данные приходят. */
export type CardSkeletonKind = 'venue' | 'venue-row' | 'event' | 'event-row' | 'collection' | 'post' | 'comment' | 'author' | 'dish'

export interface CardSkeletonProps {
  kind: CardSkeletonKind
  /** Сколько одинаковых заготовок; для списка — по числу ожидаемых записей (3 по умолчанию не больше). */
  count?: number
  /** Подпись области для скринридера. */
  label?: string
}
