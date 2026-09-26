import type { ToastOptions } from '@/design-system'

/** Кнопки-примеры для тостов: подпись и что показать. */
export interface ToastExample {
  id: string
  label: string
  options: ToastOptions
}

export const TOAST_EXAMPLES: readonly ToastExample[] = [
  { id: 'neutral', label: 'Обычный', options: { text: 'Ссылка скопирована' } },
  { id: 'success', label: 'Успех', options: { text: 'Сохранено в подборку', variant: 'success' } },
  { id: 'action', label: 'С действием', options: { text: 'Публикация скрыта', action: { label: 'Отменить', onClick: () => {} } } },
  { id: 'danger', label: 'Ошибка', options: { text: 'Не удалось отправить', variant: 'danger' } },
  { id: 'sticky', label: 'Без автозакрытия', options: { text: 'Закроется только вами', duration: 0 } },
]

export const BANNER_TEXT = {
  info: 'Изменения проходят проверку, старая версия остаётся до неё.',
  success: 'Премиум подключён.',
  warning: 'Не удалось загрузить комментарии.',
  danger: 'Оплата не прошла. Деньги не списаны.',
  offline: 'Показаны сохранённые данные.',
  dismissible: 'Это подсказка: её можно закрыть кнопкой или клавишей Escape.',
} as const
