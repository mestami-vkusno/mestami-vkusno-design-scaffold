/*
  Фото в редакторах. Настоящих файлов в моке нет (решение владельца: фото — заглушки): выбранный файл «загружается»
  имитацией, а в публикацию или отзыв попадает заглушка нужных пропорций. Черновик хранит заглушки, поэтому после
  восстановления плитки возвращаются с прежними названиями и оттенками.
*/
import { simulateMediaUpload, type MediaPickerItem } from '@/design-system'
import type { Photo, PhotoTone } from '@/mocks/types'

/** Лимит фото в публикации и отзыве: в ТЗ настраиваемый (§13.2), в моке — шесть, как на витрине. */
export const MAX_PHOTOS = 6
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

const TONES: readonly PhotoTone[] = ['ember', 'dusk', 'rust', 'moss', 'wine', 'gold', 'sea', 'slate']

/** Имитация загрузки; файл с «fail» или «ошибк» в названии в первый раз не загружается — так можно увидеть ошибку файла и «Повторить». */
export const uploadPhoto = simulateMediaUpload({ durationMs: 1400, failWhen: (file, attempt) => attempt === 1 && /fail|ошибк/i.test(file.name) })

/** Плитки для сохранённых заглушек: без превью, уже загружены. */
export function photosToItems(photos: readonly Photo[], prefix: string): MediaPickerItem[] {
  return photos.map((photo, index) => {
    const name = photo.caption ?? `Фото ${index + 1}`
    return { id: `${prefix}-${index}`, file: new File([], name), name, status: 'done', progress: 100 }
  })
}

/** Загруженные плитки → заглушки для черновика. Не загруженные и с ошибкой в черновик не попадают. */
export function itemsToPhotos(items: readonly MediaPickerItem[], known: readonly Photo[]): Photo[] {
  const done = items.filter((item) => item.status === 'done')
  return done.map((item, index) => {
    // Плитка, восстановленная из сохранённого (`saved-2`), возвращает свою заглушку как была; новая получает оттенок по порядку.
    const position = /^(?:saved|review)-(\d+)$/.exec(item.id)?.[1]
    const restored = position === undefined ? undefined : known[Number(position)]
    return restored ?? { ratio: '4:3', tone: TONES[index % TONES.length] ?? 'dusk', caption: item.name }
  })
}

export const hasUploading = (items: readonly MediaPickerItem[]): boolean => items.some((item) => item.status === 'uploading')
export const hasFailed = (items: readonly MediaPickerItem[]): boolean => items.some((item) => item.status === 'error')
