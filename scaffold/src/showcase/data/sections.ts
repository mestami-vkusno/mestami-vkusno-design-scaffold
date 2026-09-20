export interface ShowcaseSectionMeta {
  id: string
  /** Короткое название для навигации по странице. */
  navLabel: string
}

export const SHOWCASE_SECTIONS: readonly ShowcaseSectionMeta[] = [
  { id: 'colors', navLabel: 'Цвета' },
  { id: 'themes', navLabel: 'Темы' },
  { id: 'type', navLabel: 'Типографика' },
  { id: 'space', navLabel: 'Форма' },
  { id: 'buttons', navLabel: 'Кнопки' },
  { id: 'forms', navLabel: 'Поля' },
  { id: 'filters', navLabel: 'Фильтры' },
  { id: 'badges', navLabel: 'Бейджи' },
  { id: 'cards', navLabel: 'Карточки' },
  { id: 'nav', navLabel: 'Навигация' },
  { id: 'icons', navLabel: 'Иконки' },
]
