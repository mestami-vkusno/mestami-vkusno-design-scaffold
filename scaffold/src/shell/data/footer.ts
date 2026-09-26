import type { FooterColumn, FooterLink } from '@/design-system'

/** Внешние ссылки ведут в другие контуры (ЛК ресторана, ЛК Партнёра). Адреса — заглушки (example.com). */
const EXTERNAL_VENUES = 'https://example.com/for-venues'
const EXTERNAL_PARTNERS = 'https://example.com/partners'

export const FOOTER_DESCRIPTION = 'Цифровой гастрономический гид по ресторанам, кафе, барам и событиям в вашем городе.'

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Сервис',
    links: [
      { label: 'Поиск и каталог', href: '/search' },
      { label: 'Афиша', href: '/events' },
      { label: 'Подборки', href: '/collections' },
      { label: 'Мое', href: '/me/favorites' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'Как это работает', href: '/help/how-it-works' },
      { label: 'Вопросы и ответы', href: '/help/faq' },
      { label: 'Поддержка', href: '/help/support' },
      { label: 'Обратная связь', href: '/help/feedback' },
      { label: 'Для заведений', href: EXTERNAL_VENUES, external: true },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Пользовательское соглашение', href: '/legal/user-agreement' },
      { label: 'Политика конфиденциальности', href: '/legal/privacy-policy' },
      { label: 'Согласие на обработку персональных данных', href: '/legal/pd-consent' },
      { label: 'Условия подписки и оплаты', href: '/legal/premium-offer' },
      { label: 'Правила сервиса', href: '/legal/service-rules' },
      { label: 'Правила рекомендаций', href: '/legal/recommendation-rules' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '/about' },
      { label: 'Контакты', href: '/about/contacts' },
      { label: 'Реквизиты', href: '/about/requisites' },
      { label: 'Партнёрам', href: EXTERNAL_PARTNERS, external: true },
    ],
  },
]

/** Служебный блок: страницы дизайн-системы и анимаций не входят в продукт. */
export const FOOTER_SERVICE_LINKS: readonly FooterLink[] = [
  { label: 'Дизайн-система', href: '/design-system' },
  { label: 'Анимации', href: '/motion' },
  { label: 'Блоки', href: '/features' },
]

export const FOOTER_COPYRIGHT = '© 2026 Местами вкусно'
