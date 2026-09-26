import type { IconName, NavItem } from '@/design-system'

/** Чья оболочка у страницы: продукта (шапка, навигация, подвал) или витрины дизайн-системы (SiteTopbar). */
export type ShellLayout = 'product' | 'showcase'

/** Вкладки нижней навигации, у которых есть своя страница. */
export type ProductTabId = 'home' | 'feed' | 'search' | 'me'

/** Пункты верхней навигации на десктопе. */
export type ProductNavId = 'home' | 'feed' | 'search' | 'events' | 'collections'

/** `full` — шапка, подвал и нижняя навигация; `focused` — без подвала и нижней панели (вход, редакторы, диалог с ИИ). */
export type ShellChrome = 'full' | 'focused'

export interface ProductNavItem extends NavItem {
  id: ProductNavId
  href: string
}

/** Пункт панели «Создать»: ведёт в редактор. */
export interface CreateAction {
  id: string
  label: string
  description: string
  icon: IconName
  href: string
}

export type CityId = 'spb' | 'msk'

export interface City {
  id: CityId
  name: string
}

/** Вошедший пользователь; пока входа нет, значение `null`. */
export interface Viewer {
  name: string
}
