import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { NOT_FOUND_PAGE, PAGES, type PageDefinition } from '@/shell/data/routes'
import { rememberTabScroll, scrollBehavior } from '@/shell/scroll'
import type { SiteTopbarSection } from '@/shell/site-topbar'
import type { ProductNavId, ProductTabId, ShellChrome, ShellLayout } from '@/shell/types'

const DOCUMENT_TITLE_SUFFIX = ' · Местами вкусно'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    documentTitle?: string
    /** Подсказка заглушки «Здесь будет …». */
    hint?: string
    pageId?: string
    layout?: ShellLayout
    tab?: ProductTabId
    nav?: ProductNavId
    keepAlive?: boolean
    chrome?: ShellChrome
    /** Разделы страницы для якорной навигации в общей шапке. */
    sections?: readonly SiteTopbarSection[]
  }
}

/**
 * Корневые вкладки держатся в памяти (`<KeepAlive>` в App.vue), а он сопоставляет по имени компонента:
 * имя задаёт таблица маршрутов, а не файл страницы, поэтому оно не пропадёт при замене заглушки.
 */
function toRecord(definition: PageDefinition): RouteRecordRaw {
  const { page, keepAlive } = definition
  const component: RouteRecordRaw['component'] = keepAlive ? () => page().then((module) => ({ ...module.default, name: `tab:${definition.name}` })) : page
  return {
    path: definition.path,
    name: definition.name,
    component,
    meta: {
      title: definition.title,
      documentTitle: definition.documentTitle,
      hint: definition.hint,
      pageId: definition.pageId,
      layout: definition.layout,
      tab: definition.tab,
      nav: definition.nav,
      keepAlive,
      chrome: definition.chrome,
      sections: definition.sections,
    },
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [...PAGES, NOT_FOUND_PAGE].map(toRecord),
  scrollBehavior,
})

router.beforeEach((_to, from) => {
  rememberTabScroll(from)
})

router.afterEach((to) => {
  document.title = to.meta.documentTitle ?? `${to.meta.title ?? 'Местами вкусно'}${DOCUMENT_TITLE_SUFFIX}`
})
