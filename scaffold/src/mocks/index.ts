/*
  Единая точка входа в моковые данные. Только реэкспорт; логики здесь нет.
  Страницы подгружают данные лениво: чтобы не тянуть всё сразу, импортируйте из нужного файла
  (`@/mocks/venues`, `@/mocks/selectors/menu` …), а не из этого индекса.

  Не реэкспортируется намеренно:
  - `menusRaw` — исходные меню вместе с алкогольными позициями (§8.4); читать их можно только через селекторы меню;
  - заглушка фото `UiPhotoPlaceholder` — Vue-компонент, лежит в `@/mocks/media`.
*/
export type * from './types'
export * from './time'
export * from './format'
export * from './dictionaries'
export * from './builders'
export * from './cities'
export * from './venues'
export { dishConcepts } from './menus'
export * from './events'
export * from './authors'
export * from './posts'
export * from './reviews'
export * from './collections'
export * from './library'
export * from './ai'
export * from './activity'
export * from './selectors'
