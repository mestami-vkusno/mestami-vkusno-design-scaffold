import type { IconName } from '../../../icons'

export interface UiIconProps {
  name: IconName
  /** Размер в px (число) или CSS-значение, например `100%`; иконка квадратная. */
  size?: number | string
  /** Залить контур цветом текста (активное состояние). */
  filled?: boolean
  /** Если задан, иконка озвучивается; без него она декоративна. */
  title?: string
}
