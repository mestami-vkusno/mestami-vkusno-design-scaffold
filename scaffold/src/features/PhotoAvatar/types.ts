import type { Photo } from '@/mocks/types'

export interface PhotoAvatarProps {
  /** Снимок из данных: пропорции не важны, берётся оттенок. */
  photo: Photo
  /** Имя автора или заведения: из него берутся инициалы и подпись для скринридера. */
  name: string
  /** 24, 32, 40, 64, 96 px, как у `UiAvatar`. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** `circle` — человек, `rounded` — скруглённый квадрат заведения (отличает официальный контент от пользовательского). */
  shape?: 'circle' | 'rounded'
  /** Имя написано рядом: аватар скрыт от скринридера, чтобы оно не читалось дважды. */
  decorative?: boolean
}
