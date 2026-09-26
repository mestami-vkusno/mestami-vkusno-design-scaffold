import type { Photo } from '@/mocks/types'

/** Заглушка, когда у объекта нет ни одного снимка: нейтральный тон без подписи (для чтения с экрана декоративна). */
export const FALLBACK_PHOTO: Photo = { ratio: '4:3', tone: 'slate' }

/** Первое фото из списка или заглушка. */
export function firstPhoto(photos: readonly Photo[] | undefined): Photo {
  return photos?.[0] ?? FALLBACK_PHOTO
}
