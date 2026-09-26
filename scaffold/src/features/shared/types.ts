import type { Author } from '@/mocks/types'

/** Автор в карточках и комментариях: только то, что нужно для подписи и ссылки. */
export type AuthorLike = Pick<Author, 'id' | 'username' | 'displayName' | 'avatar'>

/** Уровень заголовка карточки или раздела в структуре страницы. */
export type HeadingLevel = 2 | 3 | 4 | 5
