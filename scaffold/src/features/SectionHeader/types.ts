import type { HeadingLevel } from '../shared/types'

export interface SectionHeaderProps {
  title: string
  /** Уровень заголовка в структуре страницы. */
  headingLevel?: HeadingLevel
  /** `lg` — заголовок страницы-раздела (Главная), `md` — обычный ряд. */
  size?: 'md' | 'lg'
  /** Пояснение под заголовком: «События, на которые стоит обратить внимание». */
  description?: string
  /** Куда ведёт «Смотреть все»; без адреса ссылки нет. */
  href?: string
  linkLabel?: string
  /** «24 события» рядом с заголовком. */
  count?: string
  /** Уникальный id заголовка, чтобы ряд или список мог сослаться на него через `aria-labelledby`. */
  id?: string
}
