import type { AuthorLike } from '../shared/types'

export interface AuthorRowProps {
  author: AuthorLike
  /** Адрес профиля; по умолчанию `/u/<username>`. */
  href?: string
  /** Вторая строка вместо `@username`: «12,5 тыс. подписчиков», «2 ч назад». */
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  /** Без ссылки: строка внутри другой ссылки или в закрытом профиле. */
  plain?: boolean
}
