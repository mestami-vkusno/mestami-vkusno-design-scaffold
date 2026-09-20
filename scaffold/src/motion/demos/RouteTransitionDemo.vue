<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiButton } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const router = useRouter()
</script>

<template>
  <MotionDemo
    title="Переход между страницами сайта"
    tier="occasional"
    purpose="jarring"
    description="Страница не должна «телепортироваться»: старая быстро гаснет, новая приходит с лёгким подъёмом. Нажмите — и вы перейдёте на страницу системы с этим самым переходом."
    :specs="[
      { label: 'Инструмент', value: 'Vue <Transition mode=&quot;out-in&quot;> + CSS' },
      { label: 'Свойства', value: 'opacity, transform: translateY(8px → 0)' },
      { label: 'Кривая', value: 'var(--ease-out)' },
      { label: 'Длительность', value: '120 мс уход + 220 мс приход' },
    ]"
  >
    <template #note>При уменьшенном движении смещение пропадает, остаётся только прозрачность. Прокрутка сбрасывается вверх после ухода старой страницы, а не до него.</template>
    <div class="route-demo"><UiButton icon-right="arrow-r" @click="router.push('/')">На страницу «Система»</UiButton></div>
  </MotionDemo>
</template>

<style scoped>
.route-demo {
  display: grid;
  place-items: center;
}
</style>
