import type { Component } from 'vue'
import { MOTION_SECTIONS } from '@/motion/data/sections'
import { FEATURES_SECTIONS } from '@/pages/system/featuresSections'
import { SHOWCASE_SECTIONS } from '@/showcase/data/sections'
import type { SiteTopbarSection } from '../site-topbar'
import type { ProductNavId, ProductTabId, ShellChrome, ShellLayout } from '../types'

type PageLoader = () => Promise<{ default: Component }>

/**
 * Описание страницы приложения. Единственное место, где регистрируются маршруты: следующие задачи
 * заменяют содержимое файла страницы и не трогают `router.ts` и эту таблицу (кроме новых страниц).
 */
export interface PageDefinition {
  path: string
  name: string
  /** ID из карты страниц (`docs/front-structure.md`, раздел 2). Пусто у служебных страниц. */
  pageId?: string
  /** Название страницы: заголовок вкладки браузера и заглушки. */
  title: string
  /** Полный заголовок вкладки, если он не «название · Местами вкусно». */
  documentTitle?: string
  /** «Здесь будет …» — подсказка заглушки, пока страницу не сделали. */
  hint?: string
  /** Ленивый импорт: каждая страница — отдельный чанк. */
  page: PageLoader
  layout?: ShellLayout
  /** Какая вкладка нижней навигации подсвечена. */
  tab?: ProductTabId
  /** Какой пункт верхней навигации подсвечен. */
  nav?: ProductNavId
  /** Корневая вкладка: держится в памяти между переходами, прокрутка запоминается. */
  keepAlive?: boolean
  chrome?: ShellChrome
  /** Пример адреса для страниц с параметрами (для оглавления маршрутов на заглушке Главной). */
  example?: string
  /** Разделы страницы для якорной навигации в шапке витрины. */
  sections?: readonly SiteTopbarSection[]
}

export const PAGES: readonly PageDefinition[] = [
  // Корневые разделы
  { path: '/', name: 'home', pageId: 'H1', title: 'Главная', documentTitle: 'Местами вкусно — гастрономический гид', hint: 'Здесь будет Главная: поиск, быстрые фильтры и модули «Куда сходить», «Подборки», «Афиша», «Рекомендуем вам».', page: () => import('@/pages/home/HomePage.vue'), tab: 'home', nav: 'home', keepAlive: true },
  { path: '/feed', name: 'feed', pageId: 'F1', title: 'Лента', hint: 'Здесь будет Лента: вкладки «Для вас» и «Подписки», публикации пользователей, официальный контент заведений и подборки.', page: () => import('@/pages/feed/FeedPage.vue'), tab: 'feed', nav: 'feed', keepAlive: true },
  { path: '/search', name: 'search', pageId: 'S1', title: 'Поиск', hint: 'Здесь будет Поиск с режимами «Поиск», «Каталог» и «Карта»: запрос, фильтры, «Рядом со мной».', page: () => import('@/pages/search/SearchPage.vue'), tab: 'search', nav: 'search', keepAlive: true },
  { path: '/me', name: 'me', pageId: 'P1', title: 'Профиль', hint: 'Здесь будет свой профиль с двумя режимами: «Профиль» и «Мое».', page: () => import('@/pages/me/MePage.vue'), tab: 'me', keepAlive: true },

  // Публичные объекты
  { path: '/collections', name: 'collections', pageId: 'K0', title: 'Подборки', hint: 'Здесь будет хаб подборок: поиск, поводы, редакционная подборка, «Выбор редакции», «Популярно сейчас».', page: () => import('@/pages/collections/CollectionsPage.vue'), nav: 'collections' },
  { path: '/collection/:id', name: 'collection', pageId: 'K1', title: 'Подборка', hint: 'Здесь будет подборка: заведения с заметками автора в авторском порядке.', page: () => import('@/pages/collections/CollectionPage.vue'), nav: 'collections', example: '/collection/1' },
  { path: '/venue/:id', name: 'venue', pageId: 'V1', title: 'Заведение', hint: 'Здесь будет карточка заведения: фото, статус, меню, события, отзывы, публикации посетителей.', page: () => import('@/pages/venue/VenuePage.vue'), example: '/venue/1' },
  { path: '/venue/:id/menu', name: 'venue-menu', pageId: 'V2', title: 'Меню заведения', hint: 'Здесь будет структурированное меню: разделы, позиции с ценой и доступностью.', page: () => import('@/pages/venue/VenueMenuPage.vue'), example: '/venue/1/menu' },
  { path: '/venue/:id/menu/:menuItemId', name: 'menu-item', pageId: 'V3', title: 'Позиция меню', hint: 'Здесь будет позиция меню: официальные данные, фото и публикации посетителей, где ещё есть похожее.', page: () => import('@/pages/venue/MenuItemPage.vue'), example: '/venue/1/menu/1' },
  { path: '/events', name: 'events', pageId: 'E1', title: 'Афиша', hint: 'Здесь будет Афиша: «Сегодня», «Завтра», «Выходные», выбор даты и фильтры.', page: () => import('@/pages/events/EventsPage.vue'), nav: 'events' },
  { path: '/event/:id', name: 'event', pageId: 'E2', title: 'Событие', hint: 'Здесь будет событие: даты, стоимость, статус, заведение и внешние действия.', page: () => import('@/pages/events/EventPage.vue'), nav: 'events', example: '/event/1' },
  { path: '/post/:id', name: 'post', pageId: 'PO1', title: 'Публикация', hint: 'Здесь будет публикация: текст, фото, привязка к заведению, отметки «нравится» и комментарии.', page: () => import('@/pages/post/PostPage.vue'), example: '/post/1' },
  { path: '/u/:username', name: 'author', pageId: 'U1', title: 'Профиль автора', hint: 'Здесь будет профиль автора: подписчики, вкладки «Публикации», «Обзоры», «Фото», «Подборки».', page: () => import('@/pages/author/AuthorPage.vue'), example: '/u/maria' },

  // Личное
  { path: '/me/favorites', name: 'me-favorites', pageId: 'M2', title: 'Избранное', hint: 'Здесь будут избранные заведения (приватно по умолчанию).', page: () => import('@/pages/me/MeFavoritesPage.vue'), tab: 'me' },
  { path: '/me/visits', name: 'me-visits', pageId: 'M3', title: 'Посещения', hint: 'Здесь будут приватные записи о посещениях и предложение оставить оценку или отзыв.', page: () => import('@/pages/me/MeVisitsPage.vue'), tab: 'me' },
  { path: '/me/diary', name: 'me-diary', pageId: 'M4', title: 'Дневник', hint: 'Здесь будет дневник: приватные записи, заведение необязательно.', page: () => import('@/pages/me/MeDiaryPage.vue'), tab: 'me' },
  { path: '/me/drafts', name: 'me-drafts', pageId: 'M5', title: 'Черновики', hint: 'Здесь будут черновики публикаций и подборок со статусом модерации.', page: () => import('@/pages/me/MeDraftsPage.vue'), tab: 'me' },
  { path: '/me/saved', name: 'me-saved', pageId: 'M6', title: 'Сохранённое', hint: 'Здесь будут сохранённые публикации, подборки и события.', page: () => import('@/pages/me/MeSavedPage.vue'), tab: 'me' },
  { path: '/me/reviews', name: 'me-reviews', pageId: 'M7', title: 'Оценки и отзывы', hint: 'Здесь будут мои оценки и отзывы с возможностью правки.', page: () => import('@/pages/me/MeReviewsPage.vue'), tab: 'me' },
  { path: '/me/recent', name: 'me-recent', pageId: 'M8', title: 'Недавно просмотренное', hint: 'Здесь будет список недавно просмотренных заведений.', page: () => import('@/pages/me/MeRecentPage.vue'), tab: 'me' },
  { path: '/activity', name: 'activity', pageId: 'AC1', title: 'Центр активности', hint: 'Здесь будет Центр активности: «Все», «Активность», «Обновления», «Системные».', page: () => import('@/pages/activity/ActivityPage.vue') },
  { path: '/settings', name: 'settings', pageId: 'ST1', title: 'Настройки', hint: 'Здесь будут настройки: приватность, уведомления, аккаунт, запросы по персональным данным.', page: () => import('@/pages/settings/SettingsPage.vue'), tab: 'me' },
  { path: '/settings/blocked', name: 'settings-blocked', pageId: 'ST1', title: 'Заблокированные', hint: 'Здесь будут заблокированные авторы с кнопкой «Разблокировать».', page: () => import('@/pages/settings/SettingsBlockedPage.vue'), tab: 'me' },
  { path: '/settings/hidden', name: 'settings-hidden', pageId: 'ST1', title: 'Скрытые авторы и заведения', hint: 'Здесь будут скрытые авторы и заведения с кнопкой «Показывать снова».', page: () => import('@/pages/settings/SettingsHiddenPage.vue'), tab: 'me' },
  { path: '/settings/history', name: 'settings-history', pageId: 'ST1', title: 'История', hint: 'Здесь будет управление историей: просмотры, поиск, диалоги с ИИ.', page: () => import('@/pages/settings/SettingsHistoryPage.vue'), tab: 'me' },

  // Премиум и ИИ
  { path: '/premium', name: 'premium', pageId: 'PR1', title: 'Премиум', hint: 'Здесь будет Премиум: возможности, условия, покупка (с 18 лет), состояние подписки.', page: () => import('@/pages/premium/PremiumPage.vue') },
  { path: '/ai', name: 'ai', pageId: 'AI1', title: 'ИИ', hint: 'Здесь будет вход в ИИ: запрос и подсказки для Премиум, предложение подписки для остальных.', page: () => import('@/pages/ai/AiPage.vue') },
  { path: '/ai/chat/:conversationId', name: 'ai-chat', pageId: 'AI2', title: 'Диалог с ИИ', hint: 'Здесь будет диалог с ИИ: вывод, карточки заведений, причины и компромиссы, сравнение.', page: () => import('@/pages/ai/AiChatPage.vue'), chrome: 'focused', example: '/ai/chat/1' },

  // Авторизация и создание
  { path: '/auth', name: 'auth', pageId: 'A1–A5', title: 'Вход', hint: 'Здесь будет вход и регистрация: email, код из письма, настройка профиля, возврат на исходную страницу.', page: () => import('@/pages/auth/AuthPage.vue'), chrome: 'focused' },
  { path: '/create/post', name: 'create-post', pageId: 'CR1', title: 'Новая публикация', hint: 'Здесь будет редактор публикации (адрес — предположение, в ТЗ у редакторов маршрута нет).', page: () => import('@/pages/create/CreatePostPage.vue'), chrome: 'focused' },
  { path: '/create/collection', name: 'create-collection', pageId: 'CR2', title: 'Новая подборка', hint: 'Здесь будет редактор подборки (адрес — предположение, в ТЗ у редакторов маршрута нет).', page: () => import('@/pages/create/CreateCollectionPage.vue'), chrome: 'focused' },
  { path: '/create/review', name: 'create-review', pageId: 'CR3', title: 'Оценка и отзыв', hint: 'Редактор оценки и отзыва.', page: () => import('@/pages/create/CreateReviewPage.vue'), chrome: 'focused' },
  { path: '/create/visit', name: 'create-visit', pageId: 'CR4', title: 'Добавление Посещения', hint: 'Добавление Посещения.', page: () => import('@/pages/create/CreateVisitPage.vue'), chrome: 'focused' },

  // Юридические и служебные страницы
  { path: '/legal/:slug', name: 'legal', pageId: 'X3', title: 'Юридический документ', page: () => import('@/pages/system/LegalPage.vue'), example: '/legal/user-agreement' },
  { path: '/help/:slug?', name: 'help', pageId: 'X4', title: 'Помощь', page: () => import('@/pages/system/HelpPage.vue'), example: '/help/faq' },
  { path: '/about/:slug?', name: 'about', pageId: 'X5', title: 'О нас', page: () => import('@/pages/system/AboutPage.vue'), example: '/about/contacts' },
  // Блокирующая ошибка / нет сети (X2): в продукте перекрывает текущую страницу, а не отдельный маршрут — сюда
  // заходят только чтобы посмотреть состояние (адрес — предположение автора, задача 0014, см. 0017).
  { path: '/error', name: 'error', pageId: 'X2', title: 'Ошибка', page: () => import('@/pages/system/ErrorStatePage.vue'), chrome: 'focused', example: '/error?state=offline' },

  // Витрина дизайн-системы и анимации: своя шапка, не часть продукта
  { path: '/design-system', name: 'design-system', title: 'Система', documentTitle: 'Дизайн-система «Местами вкусно»', page: () => import('@/pages/DesignSystemPage.vue'), layout: 'showcase', sections: SHOWCASE_SECTIONS },
  { path: '/motion', name: 'motion', title: 'Анимации', documentTitle: 'Анимации · Местами вкусно', page: () => import('@/pages/MotionPage.vue'), layout: 'showcase', sections: MOTION_SECTIONS },
  { path: '/features', name: 'features', title: 'Блоки', documentTitle: 'Общие блоки · Местами вкусно', page: () => import('@/pages/system/FeaturesPage.vue'), layout: 'showcase', sections: FEATURES_SECTIONS },
]

/** Страница 404: ловит любой неизвестный путь и остаётся на нём, а не уводит на главную. */
export const NOT_FOUND_PAGE: PageDefinition = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  pageId: 'X1',
  title: 'Страница не найдена',
  page: () => import('@/pages/system/NotFoundPage.vue'),
}

/** Имена страниц, которые держатся в памяти (корневые вкладки). */
export const KEEP_ALIVE_NAMES: readonly string[] = PAGES.filter((page) => page.keepAlive).map((page) => `tab:${page.name}`)
/** Сколько страниц держится в памяти: столько же, сколько корневых вкладок, чтобы память не росла. */
export const KEEP_ALIVE_LIMIT = KEEP_ALIVE_NAMES.length
