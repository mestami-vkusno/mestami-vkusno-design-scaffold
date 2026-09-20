import { createRouter, createWebHistory } from 'vue-router'
import { MOTION_SECTIONS } from '@/motion/data/sections'
import type { SiteTopbarSection } from '@/shell/site-topbar'
import { SHOWCASE_SECTIONS } from '@/showcase/data/sections'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Разделы страницы для якорной навигации в общей шапке. */
    sections?: readonly SiteTopbarSection[]
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'design-system', component: () => import('@/pages/DesignSystemPage.vue'), meta: { title: 'Дизайн-система «Местами вкусно»', sections: SHOWCASE_SECTIONS } },
    { path: '/motion', name: 'motion', component: () => import('@/pages/MotionPage.vue'), meta: { title: 'Анимации · Местами вкусно', sections: MOTION_SECTIONS } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Прокрутку вверх делает переход страниц (см. App.vue), чтобы уходящая страница не прыгала до затухания.
  scrollBehavior: () => false,
})

router.afterEach((to) => {
  if (typeof to.meta.title === 'string') document.title = to.meta.title
})
