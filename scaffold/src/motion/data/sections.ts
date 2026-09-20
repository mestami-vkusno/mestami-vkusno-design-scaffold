import type { SiteTopbarSection } from '@/shell/SiteTopbar.vue'

export const MOTION_SECTIONS: readonly SiteTopbarSection[] = [
  { id: 'tokens', navLabel: 'Токены' },
  { id: 'buttons', navLabel: 'Кнопки' },
  { id: 'theme', navLabel: 'Темы' },
  { id: 'pages', navLabel: 'Страницы' },
  { id: 'overlays', navLabel: 'Окна' },
  { id: 'lists', navLabel: 'Списки' },
  { id: 'gestures', navLabel: 'Жесты' },
  { id: 'restraint', navLabel: 'Без анимации' },
]
