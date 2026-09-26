export type UiSkeletonVariant = 'text' | 'block' | 'circle'

export interface UiSkeletonProps {
  /** `text` — строки текста, `block` — прямоугольник (фото, карточка), `circle` — аватар. */
  variant?: UiSkeletonVariant
  /** Для `text`: сколько строк; последняя короче. */
  lines?: number
  /** Ширина: число — px, строка — любое CSS-значение. */
  width?: number | string
  /** Высота блока; у `text` — высота строки. */
  height?: number | string
  /** Пропорции блока (`4/3`), если высота не задана. */
  ratio?: string
  /** Для `circle`: диаметр в px. */
  size?: number
  /** Подпись для скринридера у контейнера: слот превращает скелетон в область `aria-busy`. */
  label?: string
}
