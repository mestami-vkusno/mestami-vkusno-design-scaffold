import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'design-system', component: () => import('@/pages/DesignSystemPage.vue'), meta: { title: 'Дизайн-система «Местами вкусно»' } },
    { path: '/motion', name: 'motion', component: () => import('@/pages/MotionPage.vue'), meta: { title: 'Анимации · Местами вкусно' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Прокрутку вверх делает переход страниц (см. App.vue), чтобы уходящая страница не прыгала до затухания.
  scrollBehavior: () => false,
})

router.afterEach((to) => {
  if (typeof to.meta.title === 'string') document.title = to.meta.title
})
