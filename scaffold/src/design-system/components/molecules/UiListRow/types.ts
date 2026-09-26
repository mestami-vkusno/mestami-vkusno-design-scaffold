import type { IconName } from '../../../icons'

export interface UiListRowProps {
  title: string
  /** Пояснение под заголовком. */
  description?: string
  /** Иконка слева; для картинки или аватара — слот `leading`. */
  icon?: IconName
  /** Значение справа («Тёмная», «12»). */
  value?: string
  /** Если задан, строка — ссылка (`<a>`), как у `UiButton`: внутренние адреса превращает в переходы роутер оболочки. */
  href?: string
  /** Строка — кнопка. Если не задано, кнопкой она становится сама, когда на неё повесили `@click`. */
  clickable?: boolean
  /** Показать шеврон справа. По умолчанию — у ссылок и кнопок без своего содержимого справа. */
  chevron?: boolean
  /** Пункт выбран (город, язык): справа галочка, `aria-current`. */
  selected?: boolean
  /** Опасное действие («Заблокировать»): заголовок цвета `--danger`. */
  danger?: boolean
  disabled?: boolean
  /** Линия под строкой. */
  divider?: boolean
  /** Принудительное состояние для витрины; в продукте не используется. */
  previewState?: 'hover' | 'pressed' | 'focus'
}
