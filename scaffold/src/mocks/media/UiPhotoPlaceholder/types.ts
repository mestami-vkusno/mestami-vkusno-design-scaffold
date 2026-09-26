import type { Photo, PhotoRatio } from '../../types'

export interface UiPhotoPlaceholderProps {
  /** Описание снимка из данных: пропорции, оттенок, подпись. */
  photo: Photo
  /** Заменить пропорции из данных (карточка каталога 4:3, обложка 16:9); `fill` — занять весь родитель. */
  ratio?: PhotoRatio | 'fill'
  /** Показать подпись поверх заглушки. */
  showCaption?: boolean
  /** Чисто декоративный снимок: скрыт от программ чтения с экрана. */
  decorative?: boolean
}
