import type { BreadcrumbItem, FooterColumn, FooterSocial, NavItem, TabBarItem } from '@/design-system'

export const HEADER_ITEMS: readonly NavItem[] = [
  { id: 'section-1', label: 'Раздел' },
  { id: 'section-2', label: 'Раздел' },
  { id: 'section-3', label: 'Раздел' },
  { id: 'section-4', label: 'Раздел' },
]

export const TAB_BAR_ITEMS: readonly TabBarItem[] = [
  { id: 'home', label: 'Пункт', icon: 'home' },
  { id: 'list', label: 'Пункт', icon: 'list' },
  { id: 'search', label: 'Пункт', icon: 'search' },
  { id: 'favorites', label: 'Пункт', icon: 'heart' },
  { id: 'profile', label: 'Пункт', icon: 'user' },
]

export const SIDE_MENU_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Пункт', icon: 'home' },
  { id: 'profile', label: 'Пункт', icon: 'user' },
  { id: 'favorites', label: 'Пункт', icon: 'heart' },
  { id: 'settings', label: 'Пункт', icon: 'settings' },
]

export const SIDE_MENU_SECONDARY: readonly NavItem[] = [{ id: 'logout', label: 'Выйти', icon: 'logout' }]

export const BREADCRUMBS: readonly BreadcrumbItem[] = [
  { label: 'Главная', href: '#nav' },
  { label: 'Раздел', href: '#nav' },
  { label: 'Текущая страница' },
]

const FOOTER_LINKS = [
  { label: 'Ссылка', href: '#nav' },
  { label: 'Ссылка', href: '#nav' },
  { label: 'Ссылка', href: '#nav' },
] as const

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  { title: 'Раздел', links: FOOTER_LINKS },
  { title: 'Раздел', links: FOOTER_LINKS },
  { title: 'Раздел', links: FOOTER_LINKS },
]

export const FOOTER_SOCIALS: readonly FooterSocial[] = [
  { icon: 'plane', label: 'Ссылка 1', href: '#nav' },
  { icon: 'share', label: 'Ссылка 2', href: '#nav' },
]
