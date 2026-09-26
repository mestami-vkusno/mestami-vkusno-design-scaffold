import type { Collection } from '@/mocks/types'
import type { HeadingLevel } from '../shared/types'

export interface CollectionCardProps {
  collection: Collection
  /** Подпись: «Редакция «Местами вкусно»» у редакционной, имя автора у пользовательской (`collectionByline`). */
  byline: string
  /** `tile` — плитка с фото и подписью поверх (хаб, ряды), `row` — строка со снимком слева (Мое, поиск). */
  layout?: 'tile' | 'row'
  /** Сколько мест; по умолчанию — число элементов подборки. */
  placesCount?: number
  href?: string
  headingLevel?: HeadingLevel
  /** Корневой тег: `div`, когда карточка лежит внутри другой (`PostCard` подборки). */
  as?: 'article' | 'div'
  deferred?: boolean
}
