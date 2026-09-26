import type { MediaPickerItem } from '@/design-system'

export interface RadioOption {
  value: string
  label: string
  description?: string
}

export const REASON_OPTIONS: readonly RadioOption[] = [
  { value: 'spam', label: 'Спам или реклама', description: 'Навязчивые ссылки, повторяющиеся сообщения' },
  { value: 'inaccurate', label: 'Неверные сведения', description: 'Часы работы, адрес или цены не совпадают с действительностью' },
  { value: 'offensive', label: 'Оскорбление' },
  { value: 'other', label: 'Другое' },
]

/** Замена настоящего файла для витрины: готовые состояния плитки без выбора файла. */
function demoItem(id: string, name: string, changes: Partial<MediaPickerItem>): MediaPickerItem {
  return { id, file: new File([], name, { type: 'image/jpeg' }), name, status: 'done', progress: 100, ...changes }
}

export const PICKER_STATE_ITEMS: readonly MediaPickerItem[] = [
  demoItem('demo-done', 'fotografiya-1.jpg', {}),
  demoItem('demo-uploading', 'fotografiya-2.jpg', { status: 'uploading', progress: 45 }),
  demoItem('demo-error', 'fotografiya-3.jpg', { status: 'error', progress: 60, error: 'Не удалось загрузить' }),
]

export const PICKER_SAMPLE_TEXT = 'Ужин в субботу: тёплый хлеб, утка с яблоками и тихий зал у окна. Вернёмся ради десерта.'
