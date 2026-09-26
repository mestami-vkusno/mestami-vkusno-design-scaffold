/*
  События афиши. Даты — смещение в днях от `MOCK_TODAY` (четверг), чтобы «Сегодня», «Завтра»,
  «Выходные» и «Скоро» были заполнены всегда. Одно событие — одно заведение, у события от 1 до N дат.
  Покрыты все статусы (`scheduled`, `sold_out`, `rescheduled`, `cancelled`, `completed`)
  и все виды стоимости (`free`, `fixed`, `from`, `deposit`, `registration_required`, `not_specified`).
*/
import { photo } from './builders'
import { dateTimeAt } from './time'
import type {
  EventActionKind,
  EventCategory,
  EventExternalAction,
  EventOccurrence,
  EventPrice,
  EventStatus,
  Photo,
  TimeOfDay,
  VenueEvent,
} from './types'

/** Дата проведения: смещение от «сегодня» в днях, время начала, время окончания (необязательно). */
type OccurrenceSeed = readonly [offsetDays: number, start: TimeOfDay, end?: TimeOfDay]

interface EventSeed {
  readonly id: string
  readonly venueId: string
  readonly title: string
  readonly category: EventCategory
  readonly status: EventStatus
  readonly price: EventPrice
  readonly summary: string
  readonly description: string
  readonly dates: readonly OccurrenceSeed[]
  readonly photo: Photo
  readonly actions: readonly EventActionKind[]
  readonly program?: readonly string[]
  readonly included?: readonly string[]
  readonly ageLimit?: number
  readonly organizer?: string
  readonly editorsPick?: boolean
  readonly isNew?: boolean
  /** Для перенесённого события: прежняя дата (смещение и время). */
  readonly rescheduledFrom?: readonly [offsetDays: number, start: TimeOfDay]
}

function buildEvent(seed: EventSeed): VenueEvent {
  const occurrences: EventOccurrence[] = seed.dates.map(([offset, start, end], index) => ({
    id: `${seed.id}-o${index + 1}`,
    eventId: seed.id,
    startsAt: dateTimeAt(offset, start),
    ...(end === undefined ? {} : { endsAt: dateTimeAt(offset, end) }),
    ...(seed.rescheduledFrom === undefined || index !== 0
      ? {}
      : { rescheduledFrom: dateTimeAt(seed.rescheduledFrom[0], seed.rescheduledFrom[1]) }),
  }))
  const actions: EventExternalAction[] = seed.actions.map((kind) => ({
    kind,
    url: `https://${seed.venueId}.example/events/${seed.id}`,
  }))
  return {
    id: seed.id,
    venueId: seed.venueId,
    title: seed.title,
    category: seed.category,
    status: seed.status,
    price: seed.price,
    summary: seed.summary,
    description: seed.description,
    ...(seed.program === undefined ? {} : { program: seed.program }),
    ...(seed.included === undefined ? {} : { included: seed.included }),
    ...(seed.ageLimit === undefined ? {} : { ageLimit: seed.ageLimit }),
    ...(seed.organizer === undefined ? {} : { organizer: seed.organizer }),
    occurrences,
    photo: seed.photo,
    actions,
    ...(seed.editorsPick ? { editorsPick: true } : {}),
    ...(seed.isNew ? { isNew: true } : {}),
  }
}

const seeds: readonly EventSeed[] = [
  // ── Санкт-Петербург: сегодня ──
  {
    id: 'event-chef-dinner-birch',
    venueId: 'birch',
    title: 'Ужин с шефом',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 4500 },
    summary: 'Авторский ужин из пяти подач: шеф рассказывает о каждом блюде.',
    description:
      'Шеф Birch готовит пять подач из сезонных продуктов и сам выходит в зал рассказать о блюдах. Места за общим столом и у открытой кухни.',
    program: ['19:00 — встреча гостей и приветственный напиток без алкоголя', '19:30 — первая подача', '21:30 — десерт и разговор с шефом'],
    included: ['Пять подач', 'Безалкогольные напитки', 'Рассказ шефа о блюдах'],
    ageLimit: 16,
    dates: [[0, '19:00', '22:00'], [7, '19:00', '22:00']],
    photo: photo('4:3', 'ember', 'Шеф за работой на открытой кухне'),
    actions: ['book', 'details'],
  },
  {
    id: 'event-wine-tasting-harvest',
    venueId: 'harvest',
    title: 'Дегустация: Лето в бокале',
    category: 'tasting',
    status: 'sold_out',
    price: { kind: 'fixed', amountRub: 2500 },
    summary: 'Шесть образцов вин и закуски от шефа. Свободных мест на эту дату нет.',
    description: 'Сомелье Harvest расскажет о сезонных винах и подберёт к каждому образцу закуску. Места на ближайшие даты закончились.',
    ageLimit: 18,
    dates: [[0, '18:30', '20:30'], [8, '18:30', '20:30']],
    photo: photo('4:3', 'wine', 'Бокалы на столе'),
    actions: ['details'],
  },
  {
    id: 'event-jazz-copitas',
    venueId: 'el-copitas-bar',
    title: 'Джазовый вечер',
    category: 'music',
    status: 'scheduled',
    price: { kind: 'free' },
    summary: 'Живой джаз в баре, вход свободный.',
    description: 'Трио играет стандарты и авторские композиции. Вход свободный, столы лучше бронировать заранее.',
    ageLimit: 18,
    dates: [[0, '20:00', '23:00'], [1, '20:00', '23:00'], [8, '20:00', '23:00']],
    photo: photo('3:4', 'dusk', 'Саксофонист на сцене'),
    actions: ['book', 'details'],
  },
  // ── Завтра ──
  {
    id: 'event-gastro-set-sintoho',
    venueId: 'sintoho',
    title: 'Гастрономический сет от шефа',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 3200 },
    summary: 'Сет из семи блюд паназиатской кухни, подача к 19:30.',
    description: 'Шеф Sintoho собрал сет из семи блюд: от холодных закусок до десерта. Мест немного, подача одна.',
    included: ['Семь блюд', 'Чай и безалкогольные напитки'],
    dates: [[1, '19:30', '22:00']],
    photo: photo('4:3', 'wine', 'Блюдо из сета'),
    actions: ['book', 'details'],
    isNew: true,
  },
  {
    id: 'event-pizza-masterclass-forno',
    venueId: 'forno-napoli',
    title: 'Пицца своими руками',
    category: 'masterclass',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 1400 },
    summary: 'Учимся растягивать тесто и сажать пиццу в дровяную печь.',
    description: 'Пиццайоло покажет, как замесить тесто, растянуть основу и испечь свою пиццу. Съесть её можно сразу.',
    included: ['Мастер-класс', 'Своя пицца', 'Лимонад'],
    ageLimit: 6,
    dates: [[1, '12:00', '14:00'], [9, '12:00', '14:00']],
    photo: photo('4:3', 'rust', 'Пицца в дровяной печи'),
    actions: ['register', 'details'],
  },
  {
    id: 'event-dj-futura',
    venueId: 'futura',
    title: 'DJ-сет в пятницу',
    category: 'music',
    status: 'cancelled',
    price: { kind: 'not_specified' },
    summary: 'Событие отменено: заведение приостановило работу.',
    description: 'Пятничный DJ-сет отменён. О новой дате сообщим в Центре активности, если заведение возобновит работу.',
    dates: [[1, '21:00', '01:00']],
    photo: photo('4:3', 'slate', 'Пульт диджея'),
    actions: ['details'],
  },
  // ── Выходные ──
  {
    id: 'event-guest-dinner-harvest',
    venueId: 'harvest',
    title: 'Гостевой ужин двух шефов',
    category: 'guest_chef',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 4500 },
    summary: 'Специальное меню из семи подач, созданное двумя шефами для одного вечера.',
    description:
      'Шеф Harvest и приглашённый шеф из Birch готовят совместное меню из семи подач. Каждая подача — один из двух шефов, десерт они готовят вместе.',
    program: ['19:00 — встреча гостей', '19:30–21:30 — семь подач', '21:30 — разговор с шефами'],
    organizer: 'Birch × Harvest',
    ageLimit: 16,
    dates: [[2, '19:00', '22:00'], [9, '19:00', '22:00']],
    photo: photo('16:9', 'ember', 'Два шефа на кухне'),
    actions: ['book', 'details'],
    editorsPick: true,
  },
  {
    id: 'event-natural-wine-inside',
    venueId: 'inside',
    title: 'Дегустация натуральных вин',
    category: 'tasting',
    status: 'scheduled',
    price: { kind: 'deposit', amountRub: 1000, note: 'Депозит засчитывается в счёт' },
    summary: 'Шесть образцов и закуски о трендах натурального виноделия.',
    description: 'Сомелье покажет шесть образцов натуральных вин и расскажет, чем они отличаются от привычных. К каждому — закуска.',
    ageLimit: 18,
    dates: [[2, '18:00', '20:30']],
    photo: photo('16:9', 'wine', 'Бокалы и бутылки на стойке'),
    actions: ['book', 'details'],
    editorsPick: true,
    isNew: true,
  },
  {
    id: 'event-brunch-garden-soul',
    venueId: 'soul-kitchen',
    title: 'Бранч в саду',
    category: 'brunch',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 1800 },
    summary: 'Бранч с фермерскими продуктами, в тёплую погоду — на веранде.',
    description: 'Бранч из шести блюд с фермерскими продуктами. В тёплую погоду накрываем во дворе, в холодную — в зале.',
    included: ['Шесть блюд', 'Кофе или чай без ограничений'],
    dates: [[2, '12:00', '15:00'], [3, '12:00', '15:00']],
    photo: photo('4:3', 'moss', 'Стол с бранчем'),
    actions: ['book', 'details'],
  },
  {
    id: 'event-family-brunch-kuznya',
    venueId: 'kuznya-house',
    title: 'Семейный бранч',
    category: 'brunch',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 2200 },
    summary: 'Воскресный бранч для семей: детская программа и аниматор.',
    description: 'Воскресный бранч в Kuznya House: русские завтраки, пироги и детская программа. Для детей до 6 лет — бесплатно.',
    dates: [[3, '13:00', '16:00'], [10, '13:00', '16:00']],
    photo: photo('4:3', 'gold', 'Семейный стол'),
    actions: ['details'],
  },
  {
    id: 'event-italian-evening-charlie',
    venueId: 'charlie',
    title: 'Вечер итальянской кухни',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'from', amountRub: 2900 },
    summary: 'Авторское меню шефа и живая музыка в уютной атмосфере.',
    description: 'Шеф Charlie готовит итальянское меню из шести подач, а в зале играет живая музыка. Стоимость зависит от выбранного сета.',
    dates: [[3, '20:00', '23:30']],
    photo: photo('16:9', 'wine', 'Стол с итальянскими блюдами'),
    actions: ['book', 'details'],
    editorsPick: true,
  },
  // ── Скоро ──
  {
    id: 'event-coffee-cupping-kofe',
    venueId: 'kofe-and-more',
    title: 'Каппинг: новый урожай',
    category: 'tasting',
    status: 'scheduled',
    price: { kind: 'registration_required' },
    summary: 'Пробуем пять новых лотов кофе, вход по регистрации.',
    description: 'Бариста проведёт каппинг: покажет, как оценивать аромат и вкус кофе. Нужна предварительная регистрация, число мест ограничено.',
    dates: [[4, '11:00', '12:30']],
    photo: photo('1:1', 'rust', 'Чашки для каппинга'),
    actions: ['register', 'details'],
  },
  {
    id: 'event-panorama-sunset',
    venueId: 'panorama-360',
    title: 'Ужин на закате',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'from', amountRub: 4500 },
    summary: 'Ужин с видом на залив: столы у окна на закате.',
    description: 'Ужин на верхнем этаже к закату. Рассадка у окна, меню из пяти подач и безалкогольное сопровождение.',
    dates: [[5, '18:30', '21:30'], [12, '18:00', '21:00']],
    photo: photo('16:9', 'dusk', 'Вид на залив на закате'),
    actions: ['book', 'details'],
  },
  {
    id: 'event-local-set-terrassa',
    venueId: 'terrassa',
    title: 'Сет из локальных продуктов',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 4900 },
    summary: 'Пять блюд из продуктов ленинградских ферм.',
    description: 'Шеф Terrassa готовит ужин из продуктов ленинградских ферм: сыр, овощи, рыба из озёр области.',
    dates: [[6, '19:00', '22:00']],
    photo: photo('4:3', 'sea', 'Стол на веранде'),
    actions: ['book', 'details'],
  },
  {
    id: 'event-sicilian-osteria',
    venueId: 'osteria-da-bruno',
    title: 'Ужин по-сицилийски',
    category: 'dinner',
    status: 'rescheduled',
    price: { kind: 'from', amountRub: 3600 },
    summary: 'Событие перенесено на новую дату.',
    description: 'Сицилийский ужин с паста-станцией и десертами. Событие перенесено, билеты действуют на новую дату.',
    dates: [[12, '18:00', '21:00']],
    rescheduledFrom: [5, '18:00'],
    photo: photo('4:3', 'gold', 'Стол с паста-станцией'),
    actions: ['details'],
  },
  {
    id: 'event-pasta-masterclass-birch',
    venueId: 'birch',
    title: 'Мастер-класс: паста ручной работы',
    category: 'masterclass',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 2500 },
    summary: 'Готовим тальолини и равиоли под руководством шеф-повара.',
    description: 'Шеф-повар покажет, как замесить тесто для пасты, раскатать его и сделать начинку. Уносите с собой то, что приготовили.',
    included: ['Мастер-класс 2,5 часа', 'Ингредиенты', 'Фартук', 'Обед из приготовленного'],
    dates: [[8, '16:00', '18:30']],
    photo: photo('4:3', 'gold', 'Тесто для пасты на столе'),
    actions: ['register', 'details'],
  },
  {
    id: 'event-sushi-masterclass-sintoho',
    venueId: 'sintoho',
    title: 'Мастер-класс по роллам',
    category: 'masterclass',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 2900 },
    summary: 'Учимся скручивать ролл и держать нож.',
    description: 'Шеф Sintoho покажет основы суши-мастерства: рис, нож, ролл. Все приготовленные роллы можно съесть.',
    dates: [[11, '15:00', '17:30']],
    photo: photo('4:3', 'sea', 'Роллы на доске'),
    actions: ['register', 'details'],
  },
  {
    id: 'event-guest-shift-nola',
    venueId: 'nola',
    title: 'Гостевая смена',
    category: 'guest_chef',
    status: 'scheduled',
    price: { kind: 'registration_required' },
    summary: 'Первая неделя после открытия: гость за плитой.',
    description: 'В первую неделю после открытия Nola приглашает гостевого шефа. Формат и меню уточняются, нужна регистрация.',
    dates: [[16, '19:30', '22:00']],
    photo: photo('4:3', 'moss', 'Открытая кухня нового кафе'),
    actions: ['register', 'details'],
  },
  // ── Завершённые ──
  {
    id: 'event-cocktails-lilo',
    venueId: 'lilo',
    title: 'Сет и коктейли',
    category: 'music',
    status: 'completed',
    price: { kind: 'fixed', amountRub: 2700 },
    summary: 'Событие завершено.',
    description: 'Вечер с диджей-сетом. Заведение больше не работает, страница события сохранена как историческая.',
    dates: [[-10, '21:00', '01:00']],
    photo: photo('4:3', 'slate', 'Вечер в баре'),
    actions: ['details'],
  },
  {
    id: 'event-business-lunch-tokio',
    venueId: 'tokio',
    title: 'Бизнес-ланч от шефа',
    category: 'dinner',
    status: 'completed',
    price: { kind: 'fixed', amountRub: 1500 },
    summary: 'Событие завершено.',
    description: 'Бизнес-ланч из трёх подач с японской кухней. Событие прошло, страница сохраняется в истории.',
    dates: [[-3, '12:30', '14:30']],
    photo: photo('4:3', 'sea', 'Бизнес-ланч в Tokio'),
    actions: ['details'],
  },
  // ── Москва ──
  {
    // Прямая ссылка на событие другого города (§6.3).
    id: 'event-terrace-autumn-dinner',
    venueId: 'terrace-17',
    title: 'Осенний ужин на веранде',
    category: 'dinner',
    status: 'scheduled',
    price: { kind: 'from', amountRub: 6200 },
    summary: 'Сезонный ужин с видом на центр города.',
    description: 'Ужин из пяти подач на веранде: рыба, морепродукты, осенние овощи. Веранда отапливается.',
    dates: [[4, '19:00', '22:00'], [11, '19:00', '22:00']],
    photo: photo('16:9', 'dusk', 'Веранда с видом на город'),
    actions: ['book', 'details'],
  },
  {
    id: 'event-khachapuri-masterclass',
    venueId: 'khachapuri-lab',
    title: 'Мастер-класс по хачапури',
    category: 'masterclass',
    status: 'scheduled',
    price: { kind: 'free' },
    summary: 'Бесплатный мастер-класс по хачапури, нужна запись.',
    description: 'Повар покажет, как замесить тесто и собрать хачапури по-аджарски. Бесплатно, количество мест ограничено.',
    dates: [[3, '12:00', '14:00']],
    photo: photo('4:3', 'gold', 'Хачапури в печи'),
    actions: ['register', 'details'],
  },
  {
    id: 'event-sotka-jazz',
    venueId: 'bar-sotka',
    title: 'Джаз на Патриарших',
    category: 'music',
    status: 'scheduled',
    price: { kind: 'fixed', amountRub: 1500 },
    summary: 'Джазовое трио и закуски.',
    description: 'Вечер джаза в баре на Патриарших. Стоимость включает вход и закуски.',
    ageLimit: 18,
    dates: [[1, '21:00', '00:00']],
    photo: photo('3:4', 'wine', 'Музыканты в баре'),
    actions: ['buy_ticket', 'details'],
  },
]

export const events: readonly VenueEvent[] = seeds.map(buildEvent)
