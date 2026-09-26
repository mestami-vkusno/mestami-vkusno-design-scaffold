import type { SiteTopbarSection } from '@/shell/site-topbar'

/** Разделы служебной страницы `/features` для якорной навигации в шапке витрины. */
export const FEATURES_SECTIONS: readonly SiteTopbarSection[] = [
  { id: 'session', navLabel: 'Проверка' },
  { id: 'rails', navLabel: 'Ряды' },
  { id: 'venues', navLabel: 'Заведения' },
  { id: 'events', navLabel: 'События' },
  { id: 'collections', navLabel: 'Подборки' },
  { id: 'posts', navLabel: 'Публикации' },
  { id: 'feedback', navLabel: 'Отзывы' },
  { id: 'people', navLabel: 'Люди и меню' },
  { id: 'actions', navLabel: 'Действия' },
  { id: 'ai', navLabel: 'ИИ' },
  { id: 'states', navLabel: 'Состояния' },
]
