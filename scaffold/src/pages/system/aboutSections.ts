/**
 * X5 «О нас / Контакты / Реквизиты» (§2.8 `docs/front-structure.md`): один шаблон (`AboutPage.vue`), контент ниже.
 * Реквизиты и контакты — из §35 `../legal-content/user-agreement.md` («Реквизиты и контакты»), не выдуманы;
 * адреса электронной почты и URL сервиса в самом документе — плейсхолдеры в квадратных скобках (юрист/владелец
 * их ещё не согласовали), поэтому показаны как есть — см. новый вопрос в `.ai/tasks/0017-owner-open-questions.md`.
 */

export interface AboutInfoRow {
  label: string
  value: string
}

export interface AboutSection {
  slug: string
  title: string
  lead: string
  paragraphs?: readonly string[]
  rows?: readonly AboutInfoRow[]
}

export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    slug: '',
    title: 'О нас',
    lead: '«Местами вкусно» — гастрономический гид и социальная платформа для поиска мест.',
    paragraphs: [
      'Сервис помогает найти заведение, конкретное блюдо и его актуальную цену, посмотреть структурированное меню и события Афиши, а также прочитать официальный контент заведений и опыт других посетителей.',
      'Оператор сервиса — ООО «ВСЕМ».',
    ],
  },
  {
    slug: 'contacts',
    title: 'Контакты',
    lead: 'Как связаться с сервисом.',
    rows: [
      { label: 'Сервис', value: '«Местами вкусно» — [URL сервиса]' },
      { label: 'Поддержка', value: '[адрес электронной почты поддержки]' },
      { label: 'Юридические обращения и персональные данные', value: '[адрес электронной почты для юридических обращений и по вопросам персональных данных]' },
    ],
  },
  {
    slug: 'requisites',
    title: 'Реквизиты',
    lead: 'Оператор и администрация сервиса.',
    rows: [
      { label: 'Администрация и оператор', value: 'ООО «ВСЕМ»' },
      { label: 'ИНН', value: '5800023045' },
      { label: 'ОГРН', value: '1265800003435' },
      { label: 'Юридический адрес', value: '440066, Россия, Пензенская область, г. Пенза, проезд Виноградный 2-й, д. 11' },
    ],
  },
]

export function findAboutSection(slug: string | undefined): AboutSection | undefined {
  return ABOUT_SECTIONS.find((section) => section.slug === (slug ?? ''))
}
