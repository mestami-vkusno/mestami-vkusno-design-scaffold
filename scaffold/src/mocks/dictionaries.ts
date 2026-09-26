/* Справочники: подписи для перечислений из `types.ts`, быстрые фильтры, причины жалоб. Только тексты, без логики. */
import type {
  CollectionTopic,
  CuisineId,
  DietaryTag,
  EventActionKind,
  EventCategory,
  EventPriceKind,
  EventStatus,
  LabeledOption,
  MenuItemAvailability,
  ModerationStatus,
  NotificationTab,
  VenueStatus,
  VenueTag,
  VenueType,
} from './types'

/** Подпись редакционной подборки (§17.2). */
export const EDITORIAL_SIGNATURE = 'Редакция «Местами вкусно»'

/** Минимальная выборка, после которой агрегированная оценка показывается публично (настраиваемая, §16.1). */
export const MIN_PUBLIC_RATING_COUNT = 5

/** Подтверждённая информация: подтверждение источника, а не качества (§9.2). */
export const MANAGEMENT_CONFIRMED_LABEL = 'Информация подтверждена представителем заведения'

export const PRICE_NOT_SPECIFIED_LABEL = 'Цена не указана'
export const NO_DATA_LABEL = 'В опубликованных данных сервиса не указано'
export const DISH_NOT_FOUND_LABEL = 'Не нашли это блюдо в опубликованных меню'

export const VENUE_TYPE_LABEL: Readonly<Record<VenueType, string>> = {
  restaurant: 'Ресторан',
  cafe: 'Кафе',
  bar: 'Бар',
  coffee_shop: 'Кофейня',
  bakery: 'Пекарня',
  gastrobar: 'Гастробар',
}

/** Множественное число для чипсов каталога. */
export const VENUE_TYPE_PLURAL: Readonly<Record<VenueType, string>> = {
  restaurant: 'Рестораны',
  cafe: 'Кафе',
  bar: 'Бары',
  coffee_shop: 'Кофейни',
  bakery: 'Пекарни',
  gastrobar: 'Гастробары',
}

export const CUISINE_LABEL: Readonly<Record<CuisineId, string>> = {
  european: 'Европейская',
  italian: 'Итальянская',
  georgian: 'Грузинская',
  japanese: 'Японская',
  pan_asian: 'Паназиатская',
  russian: 'Русская',
  author: 'Авторская',
  mediterranean: 'Средиземноморская',
  seafood: 'Рыба и морепродукты',
  meat: 'Мясная',
  vegetarian: 'Вегетарианская',
  coffee: 'Кофе',
  pastry: 'Выпечка и десерты',
  bar_snacks: 'Закуски к напиткам',
}

export const VENUE_STATUS_LABEL: Readonly<Record<VenueStatus, string>> = {
  published: 'Работает',
  opening_soon: 'Скоро открытие',
  temporarily_closed: 'Временно закрыто',
  closed_permanently: 'Закрыто навсегда',
  suspended: 'Приостановлено',
}

export const VENUE_TAG_LABEL: Readonly<Record<VenueTag, string>> = {
  terrace: 'Веранда',
  breakfast: 'Завтраки',
  kids: 'Можно с детьми',
  pets: 'Можно с животными',
  accessible: 'Доступная среда',
  booking: 'Есть бронирование',
  view: 'Красивый вид',
  date: 'Для свидания',
  friends: 'С друзьями',
  quiet: 'Спокойная атмосфера',
  live_music: 'Живая музыка',
  takeaway: 'Еда с собой',
}

export const MENU_AVAILABILITY_LABEL: Readonly<Record<MenuItemAvailability, string>> = {
  available: 'Доступно',
  temporarily_unavailable: 'Временно недоступно',
  removed: 'Удалено из меню',
}

export const DIETARY_LABEL: Readonly<Record<DietaryTag, string>> = {
  vegetarian: 'Вегетарианское',
  vegan: 'Веганское',
  spicy: 'Острое',
  lenten: 'Постное',
}

export const EVENT_CATEGORY_LABEL: Readonly<Record<EventCategory, string>> = {
  dinner: 'Ужины',
  tasting: 'Дегустации',
  brunch: 'Бранчи',
  music: 'Музыка',
  guest_chef: 'Гостевые шефы',
  masterclass: 'Мастер-классы',
}

export const EVENT_STATUS_LABEL: Readonly<Record<EventStatus, string>> = {
  scheduled: 'Запланировано',
  sold_out: 'Места закончились',
  rescheduled: 'Перенесено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

export const EVENT_PRICE_KIND_LABEL: Readonly<Record<EventPriceKind, string>> = {
  free: 'Бесплатно',
  fixed: 'Фиксированная',
  from: 'От',
  deposit: 'Депозит',
  registration_required: 'Нужна регистрация',
  not_specified: 'Не указана',
}

export const EVENT_ACTION_LABEL: Readonly<Record<EventActionKind, string>> = {
  register: 'Зарегистрироваться',
  buy_ticket: 'Купить билет',
  book: 'Забронировать',
  details: 'Подробнее',
}

export const MODERATION_STATUS_LABEL: Readonly<Record<ModerationStatus, string>> = {
  draft: 'Черновик',
  pending: 'На модерации',
  published: 'Опубликовано',
  changes_requested: 'Запрошены изменения',
  rejected: 'Отклонено',
  removed_by_admin: 'Удалено администрацией',
  removed_by_author: 'Удалено автором',
}

export const COLLECTION_TOPIC_LABEL: Readonly<Record<CollectionTopic, string>> = {
  date: 'Для свидания',
  breakfast: 'Завтраки',
  friends: 'С друзьями',
  view: 'С красивым видом',
  bars: 'Бары',
  new: 'Новые места',
  family: 'С детьми',
  evening: 'Для красивого вечера',
  coffee: 'Кофейни',
}

export const NOTIFICATION_TAB_LABEL: Readonly<Record<NotificationTab | 'all', string>> = {
  all: 'Все',
  activity: 'Активность',
  updates: 'Обновления',
  system: 'Системные',
}

export const DAY_FILTER_OPTIONS: readonly LabeledOption[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'weekend', label: 'Выходные' },
  { id: 'soon', label: 'Скоро' },
]

/** Быстрые фильтры Главной и Каталога (§7.1: 4–6 штук). */
export interface QuickFilter {
  readonly id: string
  readonly label: string
  /** Что фильтр меняет: повод, признак или «Открыто сейчас». */
  readonly kind: 'topic' | 'tag' | 'open_now' | 'nearby'
  readonly value?: string
}

export const QUICK_FILTERS: readonly QuickFilter[] = [
  { id: 'breakfast', label: 'Завтраки', kind: 'tag', value: 'breakfast' },
  { id: 'date', label: 'Для свидания', kind: 'tag', value: 'date' },
  { id: 'friends', label: 'С друзьями', kind: 'tag', value: 'friends' },
  { id: 'view', label: 'С красивым видом', kind: 'tag', value: 'view' },
  { id: 'open_now', label: 'Открыто сейчас', kind: 'open_now' },
  { id: 'nearby', label: 'Рядом со мной', kind: 'nearby' },
]

/** Причины жалоб на пользовательский контент (§21.2). */
export const COMPLAINT_CONTENT_REASONS: readonly LabeledOption[] = [
  { id: 'spam', label: 'Спам или реклама' },
  { id: 'abuse', label: 'Оскорбления или травля' },
  { id: 'false_info', label: 'Недостоверная информация' },
  { id: 'alcohol_ad', label: 'Реклама алкоголя' },
  { id: 'private_data', label: 'Чужие личные данные' },
  { id: 'other', label: 'Другое' },
]

/** Причины жалоб на данные заведения (§21.3) — отдельный поток. */
export const COMPLAINT_VENUE_REASONS: readonly LabeledOption[] = [
  { id: 'wrong_hours', label: 'Неверные часы работы' },
  { id: 'wrong_address', label: 'Неверный адрес или телефон' },
  { id: 'closed', label: 'Заведение закрылось' },
  { id: 'wrong_menu', label: 'Неверное меню или цены' },
  { id: 'other', label: 'Другое' },
]

/** Подсказки к первому запросу к ИИ Премиум. */
export const AI_STARTER_PROMPTS: readonly string[] = [
  'Уютное место для свидания на Петроградке до 7000 ₽ на двоих',
  'Где позавтракать в воскресенье с детьми',
  'Сравни Birch, Harvest и Sintoho по цене и расположению',
  'Что послушать вживую в пятницу вечером',
]
