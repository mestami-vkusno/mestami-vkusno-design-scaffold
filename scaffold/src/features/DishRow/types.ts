import type { MenuItem } from '@/mocks/types'
import type { HeadingLevel } from '../shared/types'

export interface DishRowProps {
  /** Позиция меню из селекторов: алкогольные в публичный интерфейс не попадают (§8.4), блок их и сам не рисует. */
  item: MenuItem
  /** Ссылка на страницу позиции; без неё строка не кликабельна (список внутри меню заведения). */
  href?: string
  /** Заведение под названием: «где ещё есть это блюдо». */
  venueName?: string
  headingLevel?: HeadingLevel
  deferred?: boolean
}
