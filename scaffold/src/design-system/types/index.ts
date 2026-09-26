import type { IconName } from '../icons/shapes'

/** Название темы оформления. Лайм — базовый цвет в обеих. */
export type ThemeName = 'dark' | 'light'

/** Шаг отступов: значение N даёт `var(--s-N)`, то есть N × 4 px. */
export type SpaceToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

/** Заглушки вместо фотографий: в продукте подставляется реальный снимок. */
export type ImageTone = 'ember' | 'dusk' | 'rust'

/** Пункт навигации: используется верхней панелью, нижней панелью и боковым меню. */
export interface NavItem {
  id: string
  label: string
  icon?: IconName
  href?: string
}

/** Пункт с текстовой подписью для вкладок и сегментов. */
export interface OptionItem {
  id: string
  label: string
  /** Точка «есть непрочитанное» после подписи (`UiTabs`); `UiSegmented` её не рисует. */
  dot?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
