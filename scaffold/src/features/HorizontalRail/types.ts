import type { SpaceToken } from '@/design-system'

export interface HorizontalRailProps {
  /** Подпись группы для скринридера: «Куда сходить», «Афиша на выходные». Обязательна. */
  label: string
  /** Ширина карточки в px. Ряд показывает на краю кусочек следующей, чтобы было видно, что он прокручивается. */
  itemWidth?: number
  gap?: SpaceToken
  /** На телефоне ряд выходит на поля страницы, чтобы карточки доходили до края экрана. */
  bleed?: boolean
}
