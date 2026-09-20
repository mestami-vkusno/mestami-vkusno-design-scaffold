<script setup lang="ts">
import { useRoute } from 'vue-router'
import SiteTopbar from '@/shell/SiteTopbar.vue'

const route = useRoute()

function scrollToTarget(): void {
  if (route.hash) {
    document.querySelector(route.hash)?.scrollIntoView({ behavior: 'instant' })
    return
  }
  window.scrollTo(0, 0)
}
</script>

<template>
  <SiteTopbar :sections="route.meta.sections ?? []" />
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in" @before-enter="scrollToTarget">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
/* Переход между страницами: уход быстрее прихода, приход с лёгким подъёмом. Шапка не участвует и остаётся на месте:
   transform на предке сломал бы position: fixed внутри страницы, а слой на всю длинную страницу дорог на телефонах. */
.page-leave-active {
  transition: opacity var(--dur-page-out) var(--ease-out);
}

.page-enter-active {
  transition:
    opacity var(--dur-page-in) var(--ease-out),
    transform var(--dur-page-in) var(--ease-out);
}

.page-leave-to {
  opacity: 0;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(calc(8px * var(--motion-distance)));
}
</style>
