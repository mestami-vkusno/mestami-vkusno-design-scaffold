import type { TabBarItem } from '@/design-system'
import type { CreateAction, ProductNavItem, ProductTabId } from '../types'

/** Нижняя навигация на мобильном (ТЗ §4.1). «Создать» не страница, а панель: `popup`. */
export const TAB_BAR_ITEMS: readonly TabBarItem[] = [
  { id: 'home', label: 'Главная', icon: 'home', href: '/' },
  { id: 'feed', label: 'Лента', icon: 'feed', href: '/feed' },
  { id: 'create', label: 'Создать', icon: 'plus', popup: 'dialog' },
  { id: 'search', label: 'Поиск', icon: 'search', href: '/search' },
  { id: 'me', label: 'Профиль', icon: 'user', href: '/me' },
]

/** Куда ведёт повторное нажатие на вкладку: наверх страницы. */
export const TAB_IDS: readonly ProductTabId[] = ['home', 'feed', 'search', 'me']

/** Верхняя навигация на десктопе. Каталога, Избранного и Тарифов среди разделов нет. */
export const DESKTOP_NAV_ITEMS: readonly ProductNavItem[] = [
  { id: 'home', label: 'Главная', href: '/' },
  { id: 'feed', label: 'Лента', href: '/feed' },
  { id: 'search', label: 'Поиск', href: '/search' },
  { id: 'events', label: 'Афиша', href: '/events' },
  { id: 'collections', label: 'Подборки', href: '/collections' },
]

/** Панель «Создать» (ТЗ §4.4): публикация и подборка. */
export const CREATE_ACTIONS: readonly CreateAction[] = [
  { id: 'post', label: 'Публикация', description: 'Текст, фото и заведение, о котором вы рассказываете', icon: 'edit', href: '/create/post' },
  { id: 'collection', label: 'Подборка', description: 'Список заведений с вашими заметками', icon: 'bookmark', href: '/create/collection' },
]
