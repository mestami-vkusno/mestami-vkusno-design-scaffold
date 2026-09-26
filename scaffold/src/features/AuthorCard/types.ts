import type { Author } from '@/mocks/types'
import type { HeadingLevel } from '../shared/types'

export interface AuthorCardProps {
  author: Author
  href?: string
  headingLevel?: HeadingLevel
  /** Длинные списки авторов: карточки вне экрана не считаются и не рисуются. */
  deferred?: boolean
}
