export type CssToken = `--${string}`

export interface ColorToken {
  token: CssToken
  name: string
  usage: string
}

export interface ColorGroup {
  title: string
  tokens: readonly ColorToken[]
}

export const COLOR_GROUPS: readonly ColorGroup[] = [
  {
    title: 'Основа',
    tokens: [
      { token: '--bg', name: 'Фон', usage: 'Основной фон страниц' },
      { token: '--surface', name: 'Поверхность', usage: 'Карточки, панели' },
      { token: '--surface-2', name: 'Поверхность 2', usage: 'Наведение, вложенные блоки' },
      { token: '--field', name: 'Поле ввода', usage: 'Инпуты, селекты' },
      { token: '--border', name: 'Граница', usage: 'Разделители, карточки' },
      { token: '--border-strong', name: 'Граница элемента', usage: 'Кнопки, поля, чипы' },
    ],
  },
  {
    title: 'Текст',
    tokens: [
      { token: '--text', name: 'Основной', usage: 'Заголовки, основной текст' },
      { token: '--text-2', name: 'Вторичный', usage: 'Описания, меню' },
      { token: '--text-3', name: 'Подписи', usage: 'Подсказки, метаданные' },
      { token: '--on-accent', name: 'Текст на акценте', usage: 'Внутри лаймовых кнопок' },
    ],
  },
  {
    title: 'Акцент',
    tokens: [
      { token: '--lime', name: 'Лайм', usage: 'Главное действие, активное' },
      { token: '--lime-hover', name: 'Лайм: наведение', usage: 'Состояние hover' },
      { token: '--lime-press', name: 'Лайм: нажатие', usage: 'Состояние pressed' },
      { token: '--accent-fg', name: 'Лайм как текст', usage: 'Ссылки, иконки, активные пункты. В светлой теме — чёрный, лайм уходит в подложку' },
      { token: '--lime-soft', name: 'Лайм: подложка', usage: 'Фон выделения, фокус поля' },
      { token: '--lime-line', name: 'Лайм: контур', usage: 'Контурные кнопки и бейджи' },
    ],
  },
  {
    title: 'Семантика',
    tokens: [
      { token: '--success', name: 'Успех', usage: '«Бесплатно», подтверждено' },
      { token: '--warning', name: 'Внимание', usage: '«Осталось мало»' },
      { token: '--danger', name: 'Ошибка', usage: 'Ошибки, удаление' },
      { token: '--star', name: 'Звезда рейтинга', usage: 'Только для оценок' },
    ],
  },
]
