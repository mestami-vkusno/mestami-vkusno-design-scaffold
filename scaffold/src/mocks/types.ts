/*
  Модели моковых данных по сущностям ТЗ (`materials/tz/b2c.md`, §3).
  Имена полей и статусов совпадают с ТЗ там, где оно их называет (`is_alcohol` → `isAlcohol`,
  `visibility`, `scheduled` / `sold_out` …). Типы не зависят от компонентов и от других файлов мока.
*/

// ── Идентификаторы и время ────────────────────────────────────────────────

export type Id = string
export type CityId = 'spb' | 'msk'
export type DistrictId = Id
export type AreaId = Id
export type MetroStationId = Id
export type VenueId = Id
export type MenuId = Id
export type MenuSectionId = Id
export type MenuItemId = Id
export type DishConceptId = Id
export type EventId = Id
export type OccurrenceId = Id
export type AuthorId = Id
export type PostId = Id
export type CommentId = Id
export type RatingId = Id
export type ReviewId = Id
export type VisitId = Id
export type CollectionId = Id
export type ConversationId = Id
export type NotificationId = Id

/** Дата `YYYY-MM-DD`. */
export type IsoDate = string
/** Дата и время `YYYY-MM-DDTHH:MM:SS+03:00`. */
export type IsoDateTime = string
/** Время суток `HH:MM`. */
export type TimeOfDay = string

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

// ── Фото-заглушки ─────────────────────────────────────────────────────────

/** Пропорции снимка; соответствуют типам карточек (обложка 16:9, каталог 4:3, аватар 1:1, портрет 3:4). */
export type PhotoRatio = '16:9' | '4:3' | '1:1' | '3:4'

/** Оттенок заглушки. Каждый оттенок собирается из токенов дизайн-системы и работает в обеих темах. */
export type PhotoTone = 'ember' | 'dusk' | 'rust' | 'moss' | 'wine' | 'gold' | 'sea' | 'slate'

/** Заглушка вместо растрового файла: пропорции, оттенок и подпись (она же `aria-label`). */
export interface Photo {
  readonly ratio: PhotoRatio
  readonly tone: PhotoTone
  readonly caption?: string
}

// ── Слой мест ─────────────────────────────────────────────────────────────

export interface GeoPoint {
  readonly lat: number
  readonly lng: number
}

export interface City {
  readonly id: CityId
  readonly name: string
  /** «Заведения Санкт-Петербурга». */
  readonly genitive: string
  readonly timezone: string
  readonly center: GeoPoint
  readonly venuesCountLabel?: string
}

/** Район (`District`) — административная география. */
export interface District {
  readonly id: DistrictId
  readonly cityId: CityId
  readonly name: string
}

/** Местность (`Area`) — привычный топоним, например «Петроградка». */
export interface Area {
  readonly id: AreaId
  readonly cityId: CityId
  readonly districtId: DistrictId
  readonly name: string
}

export interface MetroStation {
  readonly id: MetroStationId
  readonly cityId: CityId
  readonly name: string
}

export type VenueType = 'restaurant' | 'cafe' | 'bar' | 'coffee_shop' | 'bakery' | 'gastrobar'

export type CuisineId =
  | 'european'
  | 'italian'
  | 'georgian'
  | 'japanese'
  | 'pan_asian'
  | 'russian'
  | 'author'
  | 'mediterranean'
  | 'seafood'
  | 'meat'
  | 'vegetarian'
  | 'coffee'
  | 'pastry'
  | 'bar_snacks'

/** Публичные статусы заведения, §9.3. */
export type VenueStatus = 'published' | 'opening_soon' | 'temporarily_closed' | 'closed_permanently' | 'suspended'

/** Структурированные атрибуты (§8.5) и «настроения» из референсов. */
export type VenueTag =
  | 'terrace'
  | 'breakfast'
  | 'kids'
  | 'pets'
  | 'accessible'
  | 'booking'
  | 'view'
  | 'date'
  | 'friends'
  | 'quiet'
  | 'live_music'
  | 'takeaway'

export interface TimeInterval {
  readonly from: TimeOfDay
  /** Если `to` не позже `from`, интервал переходит за полночь (`18:00–02:00`, `12:00–00:00`). */
  readonly to: TimeOfDay
}

export type DayHours =
  | { readonly kind: 'open'; readonly intervals: readonly TimeInterval[] }
  | { readonly kind: 'round_the_clock' }
  | { readonly kind: 'closed' }

export type WeeklyHours = Readonly<Record<WeekdayKey, DayHours>>

/** Особый режим на конкретную дату (§9.4). */
export interface SpecialHours {
  readonly date: IsoDate
  readonly note: string
  readonly hours: DayHours
}

export interface VenueRating {
  /** Среднее 1–5. */
  readonly value: number
  readonly count: number
}

export interface VenueSocialLink {
  readonly kind: 'telegram' | 'vk'
  readonly url: string
}

export interface Venue {
  readonly id: VenueId
  readonly slug: string
  readonly cityId: CityId
  readonly name: string
  readonly type: VenueType
  readonly cuisines: readonly CuisineId[]
  readonly districtId: DistrictId
  readonly areaId?: AreaId
  readonly metroStationId?: MetroStationId
  readonly walkMinutesToMetro?: number
  readonly address: string
  readonly geo: GeoPoint
  /** Расстояние от опорной точки мока («рядом со мной»), км. */
  readonly distanceKm: number
  /** Средний чек, ₽ на человека; `null` — не указан. */
  readonly averageCheckRub: number | null
  /** Агрегированная оценка; показывается публично только при `count >= MIN_PUBLIC_RATING_COUNT` (§16.1). */
  readonly rating: VenueRating | null
  readonly status: VenueStatus
  /** Пояснение к статусу («Закрыто на ремонт до …»). */
  readonly statusNote?: string
  /** Дата открытия для `opening_soon`. */
  readonly opensOn?: IsoDate
  /** `null` — часы неизвестны (это не «закрыто», §9.4). */
  readonly hours: WeeklyHours | null
  readonly specialHours?: readonly SpecialHours[]
  readonly description: string
  readonly tags: readonly VenueTag[]
  /** Первый снимок — главное фото. */
  readonly gallery: readonly Photo[]
  /** Всего фото у заведения («+24 фото»), в том числе от посетителей. */
  readonly photosTotal: number
  readonly phone?: string
  readonly website?: string
  readonly socials?: readonly VenueSocialLink[]
  readonly bookingUrl?: string
  /** «Информация подтверждена представителем заведения» (§9.2); без подтверждения показывается кнопка запроса управления. */
  readonly managementConfirmed: boolean
  /** Метка NEW в каталоге. */
  readonly isNew?: boolean
}

// ── Меню ──────────────────────────────────────────────────────────────────

/** Доступность позиции, §10.3. */
export type MenuItemAvailability = 'available' | 'temporarily_unavailable' | 'removed'

export type DietaryTag = 'vegetarian' | 'vegan' | 'spicy' | 'lenten'

export interface DishConcept {
  readonly id: DishConceptId
  readonly name: string
  readonly synonyms: readonly string[]
}

export interface MenuItem {
  readonly id: MenuItemId
  readonly venueId: VenueId
  readonly sectionId: MenuSectionId
  readonly name: string
  readonly description: string
  /** Цена, ₽; `null` — «Цена не указана». */
  readonly priceRub: number | null
  readonly portion?: string
  readonly photo?: Photo
  readonly availability: MenuItemAvailability
  readonly dietary: readonly DietaryTag[]
  /** Алкогольные позиции исключаются из публичного интерфейса, поиска, автодополнения, рекомендаций и ИИ (§8.4). */
  readonly isAlcohol: boolean
  readonly dishConceptId?: DishConceptId
  readonly order: number
}

export interface MenuSection {
  readonly id: MenuSectionId
  readonly title: string
  readonly order: number
  readonly items: readonly MenuItem[]
}

/** Текущая опубликованная версия меню (`Menu → MenuVersion → MenuSection → MenuItem`, §10.1). */
export interface Menu {
  readonly id: MenuId
  readonly venueId: VenueId
  readonly version: number
  readonly publishedAt: IsoDateTime
  readonly sections: readonly MenuSection[]
}

// ── События ───────────────────────────────────────────────────────────────

export type EventStatus = 'scheduled' | 'sold_out' | 'rescheduled' | 'cancelled' | 'completed'

export type EventCategory = 'dinner' | 'tasting' | 'brunch' | 'music' | 'guest_chef' | 'masterclass'

/** Виды стоимости, §11.3. */
export type EventPrice =
  | { readonly kind: 'free' }
  | { readonly kind: 'fixed'; readonly amountRub: number }
  | { readonly kind: 'from'; readonly amountRub: number }
  | { readonly kind: 'deposit'; readonly amountRub: number; readonly note?: string }
  | { readonly kind: 'registration_required' }
  | { readonly kind: 'not_specified' }

export type EventPriceKind = EventPrice['kind']

/** Внешние действия, §11.5. Клик не считается регистрацией или покупкой. */
export type EventActionKind = 'register' | 'buy_ticket' | 'book' | 'details'

export interface EventExternalAction {
  readonly kind: EventActionKind
  readonly url: string
}

/** Дата проведения события (`EventOccurrence`). */
export interface EventOccurrence {
  readonly id: OccurrenceId
  readonly eventId: EventId
  readonly startsAt: IsoDateTime
  readonly endsAt?: IsoDateTime
  /** Для перенесённого события: прежнее время начала. */
  readonly rescheduledFrom?: IsoDateTime
}

/** Событие: ровно одно заведение, от 1 до N дат проведения (§11.1). */
export interface VenueEvent {
  readonly id: EventId
  readonly venueId: VenueId
  readonly title: string
  readonly category: EventCategory
  readonly status: EventStatus
  readonly price: EventPrice
  readonly summary: string
  readonly description: string
  readonly program?: readonly string[]
  readonly included?: readonly string[]
  /** Возраст, с которого можно прийти («18+»). */
  readonly ageLimit?: number
  readonly organizer?: string
  readonly occurrences: readonly EventOccurrence[]
  readonly photo: Photo
  readonly actions: readonly EventExternalAction[]
  /** Раздел «Выбор редакции» на Афише. */
  readonly editorsPick?: boolean
  readonly isNew?: boolean
}

// ── Авторы и пользователи ─────────────────────────────────────────────────

export type ProfileVisibility = 'public' | 'private'

/** Авторский профиль (`AuthorProfile`): публичное или закрытое представление. */
export interface Author {
  readonly id: AuthorId
  readonly username: string
  readonly displayName: string
  readonly about: string
  readonly avatar: Photo
  readonly profileVisibility: ProfileVisibility
  readonly followersCount: number
  readonly cityId: CityId
  readonly joinedAt: IsoDate
}

export type PremiumStatus = 'none' | 'active' | 'expired'

/** Право на Премиум (`PremiumEntitlement`). Цены и периоды в ТЗ не утверждены (§24.3) — здесь их нет. */
export interface PremiumEntitlement {
  readonly status: PremiumStatus
  readonly activeUntil?: IsoDate
  readonly autoRenew?: boolean
}

export interface NotificationSettings {
  readonly social: boolean
  readonly venueUpdates: boolean
  readonly events: boolean
  readonly recommendationsAndMarketing: boolean
  /** Безопасность, платежи, модерация — не отключаются (§19.3). */
  readonly system: true
}

export interface UserSettings {
  readonly profileVisibility: ProfileVisibility
  readonly defaultPostVisibility: PostVisibility
  readonly personalization: boolean
  /** `ai_personal_library_access` (§23.3). */
  readonly aiPersonalLibraryAccess: boolean
  /** `ai_private_text_access`, по умолчанию выключено (§23.3). */
  readonly aiPrivateTextAccess: boolean
  readonly notifications: NotificationSettings
  readonly hiddenAuthorIds: readonly AuthorId[]
  readonly hiddenVenueIds: readonly VenueId[]
  readonly blockedAuthorIds: readonly AuthorId[]
}

/** Учётная запись (`UserAccount`): приватна, наружу не показывается. */
export interface UserAccount {
  readonly id: AuthorId
  readonly authorId: AuthorId
  readonly email: string
  readonly activeCityId: CityId
  readonly premium: PremiumEntitlement
  readonly settings: UserSettings
  readonly createdAt: IsoDate
  /** Принята лицензия на публичный пользовательский контент (§13А). */
  readonly publicUgcLicenseAcceptedAt?: IsoDateTime
}

// ── Публикации ────────────────────────────────────────────────────────────

export type PostVisibility = 'public' | 'private'

/** Статусы модерации публикации, §13.4. */
export type ModerationStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'changes_requested'
  | 'rejected'
  | 'removed_by_admin'
  | 'removed_by_author'

/** Публикация пользователя (`UserPost`). */
export interface UserPost {
  readonly kind: 'user_post'
  readonly id: PostId
  readonly authorId: AuthorId
  /** У публичной публикации обязателен; запись приватного дневника может быть без заведения (§13.1). */
  readonly venueId: VenueId | null
  readonly menuItemId?: MenuItemId
  readonly eventId?: EventId
  readonly visitId?: VisitId
  /** Снимок оценки для отображения старой публикации (§13.3). */
  readonly ratingSnapshot?: 1 | 2 | 3 | 4 | 5
  readonly text: string
  readonly photos: readonly Photo[]
  readonly visibility: PostVisibility
  readonly status: ModerationStatus
  /** Причина, если запрошены изменения или публикация отклонена. */
  readonly moderationNote?: string
  readonly commentsEnabled: boolean
  readonly createdAt: IsoDateTime
  readonly updatedAt: IsoDateTime
  readonly likesCount: number
}

export type VenuePostTopic = 'news' | 'menu' | 'event' | 'behind_the_scenes'

/** Публикация заведения (`ContentPost`): официальный контент, визуально отличается от пользовательского. Комментариев нет (§14.1). */
export interface VenuePost {
  readonly kind: 'venue_post'
  readonly id: PostId
  readonly venueId: VenueId
  readonly topic: VenuePostTopic
  readonly title: string
  readonly text: string
  readonly photos: readonly Photo[]
  readonly eventId?: EventId
  readonly publishedAt: IsoDateTime
  readonly likesCount: number
}

/** Комментарий (`Comment`) к публикации пользователя; один уровень ответов. */
export interface PostComment {
  readonly id: CommentId
  readonly postId: PostId
  readonly authorId: AuthorId
  readonly parentId?: CommentId
  readonly text: string
  readonly createdAt: IsoDateTime
}

export type FeedMode = 'for_you' | 'following'
export type FeedSource = 'all' | 'authors' | 'venues'

export type FeedItem =
  | { readonly kind: 'user_post'; readonly id: string; readonly postId: PostId; readonly at: IsoDateTime }
  | { readonly kind: 'venue_post'; readonly id: string; readonly postId: PostId; readonly at: IsoDateTime }
  | { readonly kind: 'collection'; readonly id: string; readonly collectionId: CollectionId; readonly at: IsoDateTime }

// ── Оценки, отзывы, посещения ─────────────────────────────────────────────

export type StarValue = 1 | 2 | 3 | 4 | 5

/** Оценка (`Rating`): одна активная на пару «пользователь × заведение» (§16.1). */
export interface Rating {
  readonly id: RatingId
  readonly userId: AuthorId
  readonly venueId: VenueId
  readonly value: StarValue
  /** `false` — прежняя оценка, заменённая новой; в агрегат не входит. */
  readonly active: boolean
  readonly createdAt: IsoDateTime
}

export type ReviewStatus = 'pending' | 'published'

/** Отзыв (`Review`): один активный на пару «пользователь × заведение» (§16.2). Не является публикацией. */
export interface Review {
  readonly id: ReviewId
  readonly userId: AuthorId
  readonly venueId: VenueId
  readonly ratingId: RatingId
  readonly text: string
  readonly photos: readonly Photo[]
  readonly status: ReviewStatus
  readonly createdAt: IsoDateTime
}

/** Посещение (`Visit`): приватный ручной факт; дата не в будущем (§16.3). */
export interface Visit {
  readonly id: VisitId
  readonly userId: AuthorId
  readonly venueId: VenueId
  readonly visitedOn: IsoDate
  readonly eventId?: EventId
  readonly note?: string
}

// ── Подборки ──────────────────────────────────────────────────────────────

export type CollectionKind = 'user' | 'editorial'
export type CollectionVisibility = 'public' | 'private'
export type CollectionStatus = 'draft' | 'published'

/** Поводы и темы подборок. */
export type CollectionTopic = 'date' | 'breakfast' | 'friends' | 'view' | 'bars' | 'new' | 'family' | 'evening' | 'coffee'

/** Элемент подборки (`CollectionItem`); заведение в подборке не повторяется (§17.1). */
export interface CollectionItem {
  readonly venueId: VenueId
  readonly note?: string
  readonly menuItemId?: MenuItemId
  readonly eventId?: EventId
}

export interface Collection {
  readonly id: CollectionId
  readonly kind: CollectionKind
  readonly title: string
  readonly description: string
  /** У редакционной подборки владельца нет — она подписана «Редакция «Местами вкусно»». */
  readonly ownerId: AuthorId | null
  readonly visibility: CollectionVisibility
  readonly status: CollectionStatus
  readonly topics: readonly CollectionTopic[]
  readonly cityId: CityId
  /** Порядок элементов — авторский. */
  readonly items: readonly CollectionItem[]
  readonly cover: Photo
  readonly createdAt: IsoDateTime
  readonly updatedAt: IsoDateTime
  /** Сколько раз подборку сохранили (личности сохранивших не раскрываются, §14.2). */
  readonly savesCount: number
}

// ── Личная библиотека текущего пользователя ───────────────────────────────

export interface FavoriteVenue {
  readonly venueId: VenueId
  readonly addedAt: IsoDateTime
}

export interface SavedItem<TId extends Id = Id> {
  readonly id: TId
  readonly savedAt: IsoDateTime
}

export type RecentlyViewedKind = 'venue' | 'event' | 'collection' | 'menu_item'

export interface RecentlyViewed {
  readonly kind: RecentlyViewedKind
  readonly id: Id
  readonly viewedAt: IsoDateTime
}

/** Всё личное у зарегистрированного пользователя (Профиль → Мое, §18). */
export interface UserLibrary {
  readonly userId: AuthorId
  readonly favorites: readonly FavoriteVenue[]
  readonly followedAuthorIds: readonly AuthorId[]
  readonly followedVenueIds: readonly VenueId[]
  readonly savedPosts: readonly SavedItem<PostId>[]
  readonly savedCollections: readonly SavedItem<CollectionId>[]
  readonly savedEvents: readonly SavedItem<EventId>[]
  readonly likedPostIds: readonly PostId[]
  readonly visits: readonly Visit[]
  readonly recentlyViewed: readonly RecentlyViewed[]
}

// ── ИИ Премиум ────────────────────────────────────────────────────────────

export type AiObjectKind = 'venue' | 'menu_item' | 'event' | 'collection'

export interface AiObjectRef {
  readonly kind: AiObjectKind
  readonly id: Id
}

/** Карточка объекта в ответе: причины и компромиссы берутся из данных сервиса, а не выдумываются (§23.4). */
export interface AiObjectCard {
  readonly object: AiObjectRef
  readonly reasons: readonly string[]
  readonly tradeoffs: readonly string[]
}

export interface AiComparisonRow {
  readonly criterion: string
  /** По одному значению на заведение; `null` — «В опубликованных данных сервиса не указано». */
  readonly values: Readonly<Record<VenueId, string | null>>
}

/** Сравнение 2–4 заведений (§23.6). */
export interface AiComparison {
  readonly venueIds: readonly VenueId[]
  readonly rows: readonly AiComparisonRow[]
  /** Вывод без объявления абсолютного победителя. */
  readonly note: string
}

export type AiActionKind = 'open' | 'compare' | 'add_to_favorites' | 'save_collection_draft'

export interface AiAction {
  readonly kind: AiActionKind
  readonly label: string
  readonly object?: AiObjectRef
}

export interface AiUserMessage {
  readonly role: 'user'
  readonly id: Id
  readonly text: string
  readonly at: IsoDateTime
}

/** Ответ: короткий вывод + карточки + причины + компромиссы + действия + подсказки (§23.5). */
export interface AiAssistantMessage {
  readonly role: 'assistant'
  readonly id: Id
  readonly summary: string
  readonly cards: readonly AiObjectCard[]
  readonly comparison?: AiComparison
  readonly actions: readonly AiAction[]
  readonly followUps: readonly string[]
  readonly at: IsoDateTime
}

export type AiMessage = AiUserMessage | AiAssistantMessage

export interface AiConversation {
  readonly id: ConversationId
  readonly userId: AuthorId
  readonly title: string
  readonly context: { readonly kind: 'general' | 'venue' | 'event'; readonly id?: Id }
  readonly aiPersonalLibraryAccess: boolean
  readonly aiPrivateTextAccess: boolean
  readonly messages: readonly AiMessage[]
  readonly createdAt: IsoDateTime
  readonly updatedAt: IsoDateTime
}

// ── Центр активности ──────────────────────────────────────────────────────

/** Вкладки центра активности: «Все» — объединение остальных (§19.1). */
export type NotificationTab = 'activity' | 'updates' | 'system'

export type NotificationKind =
  | 'new_follower'
  | 'likes'
  | 'comment'
  | 'reply'
  | 'venue_update'
  | 'event_relevant'
  | 'event_cancelled'
  | 'event_rescheduled'
  | 'moderation'
  | 'complaint_result'
  | 'security'
  | 'payment'

export type NotificationTarget =
  | { readonly kind: 'post'; readonly id: PostId }
  | { readonly kind: 'venue'; readonly id: VenueId }
  | { readonly kind: 'event'; readonly id: EventId }
  | { readonly kind: 'author'; readonly id: AuthorId }
  | { readonly kind: 'collection'; readonly id: CollectionId }

export interface AppNotification {
  readonly id: NotificationId
  readonly userId: AuthorId
  readonly tab: NotificationTab
  readonly kind: NotificationKind
  readonly title: string
  readonly body: string
  readonly at: IsoDateTime
  readonly read: boolean
  readonly target?: NotificationTarget
  /** Авторы, чьи действия агрегированы («Анна и ещё 3 человека»). */
  readonly actorIds?: readonly AuthorId[]
}

// ── Вспомогательные справочники ───────────────────────────────────────────

export interface LabeledOption<T extends string = string> {
  readonly id: T
  readonly label: string
}
