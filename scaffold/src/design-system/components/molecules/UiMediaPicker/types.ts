export type MediaPickerStatus = 'uploading' | 'done' | 'error'

/** Состояние одного выбранного файла: то, что компонент отдаёт наружу через `v-model:items`. */
export interface MediaPickerItem {
  id: string
  file: File
  name: string
  /** Адрес локального превью (`blob:`) у изображений; освобождается при удалении и размонтировании. */
  previewUrl?: string
  status: MediaPickerStatus
  /** 0–100, имеет смысл при `uploading`. */
  progress: number
  error?: string
}

/** Почему файл не принят: не тот тип, больше `maxSize`, не помещается в `max`. */
export interface MediaPickerRejection {
  file: File
  reason: 'type' | 'size' | 'limit'
}

/**
 * Загрузка файла. Компонент ничего не отправляет сам: продукт (или мок) передаёт эту функцию,
 * вызывает `report(0…100)` по ходу и отклоняет промис при ошибке. `signal` срабатывает при удалении файла.
 */
export type MediaPickerUploader = (file: File, report: (progress: number) => void, signal: AbortSignal) => Promise<void>

export interface UiMediaPickerProps {
  /** Что можно выбрать (атрибут `accept` и проверка типа). */
  accept?: string
  /** Несколько файлов. При `false` выбирается один: для аватара. */
  multiple?: boolean
  /** Сколько файлов можно добавить; при достижении плитка «Добавить» скрывается. */
  max?: number
  /** Предельный размер файла в байтах. */
  maxSize?: number
  disabled?: boolean
  /** Пропорции плитки превью. */
  ratio?: '4/3' | '1/1'
  /** `circle` — круглое превью (аватар), только с `ratio="1/1"`. */
  shape?: 'rounded' | 'circle'
  /** Загрузка; без неё файл сразу считается загруженным. Для мока — `simulateMediaUpload()`. */
  uploader?: MediaPickerUploader
  addLabel?: string
  /** Подпись кнопки удаления; к ней добавляется имя файла. */
  removeLabel?: string
  retryLabel?: string
  uploadingLabel?: string
  errorLabel?: string
  doneLabel?: string
}
