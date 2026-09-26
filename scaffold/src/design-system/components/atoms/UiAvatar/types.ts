export type UiAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/** Цвет заглушки с инициалами: всё на токенах, тон подмешивается в поверхность. */
export type UiAvatarTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface UiAvatarProps {
  /** Имя автора или заведения: из него берутся инициалы заглушки и подпись для скринридера. */
  name?: string
  /** Адрес снимка. Без него (или если он не загрузился) показываются инициалы. */
  src?: string
  /** 24, 32, 40, 64, 96 px. */
  size?: UiAvatarSize
  /** `circle` — человек, `rounded` — скруглённый квадрат для логотипа заведения. */
  shape?: 'circle' | 'rounded'
  tone?: UiAvatarTone
  /** Имя написано рядом текстом: аватар скрывается от скринридера, чтобы оно не читалось дважды. */
  decorative?: boolean
}
