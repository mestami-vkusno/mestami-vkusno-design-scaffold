<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiRating } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const PLACES = [
  { title: 'Пекарня у площади', meta: 'Кофейня · Центр', rating: 4.8 },
  { title: 'Ужин на крыше', meta: 'Ресторан · Набережная', rating: 4.6 },
  { title: 'Рамен-бар', meta: 'Азиатская · Старый город', rating: 4.7 },
  { title: 'Сыроварня', meta: 'Дегустации · Пригород', rating: 4.5 },
  { title: 'Чайная лавка', meta: 'Кофейня · Центр', rating: 4.9 },
] as const

const run = ref(0)
</script>

<template>
  <MotionDemo
    title="Каскадное появление"
    tier="rare"
    purpose="jarring"
    description="Список, который открывают не каждый час, появляется волной с шагом 50 мс. Ждать её окончания не нужно: элементы кликабельны с первого кадра."
    :specs="[
      { label: 'Инструмент', value: 'CSS animation (keyframes, один раз)' },
      { label: 'Свойства', value: 'opacity, transform: translateY(8px → 0)' },
      { label: 'Кривая', value: 'var(--ease-out), 300 мс' },
      { label: 'Шаг', value: '50 мс на элемент' },
    ]"
  >
    <template #actions><UiButton size="sm" icon-left="refresh" @click="run += 1">Повторить</UiButton></template>
    <template #note>Только для редкого показа. Для длинных лент и списков, по которым пролистывают весь день, каскад не используется.</template>
    <ul :key="run" class="stagger">
      <li v-for="(place, index) in PLACES" :key="place.title" class="stagger__item" :style="{ '--i': index } as never">
        <div class="stagger__text">
          <b>{{ place.title }}</b>
          <span>{{ place.meta }}</span>
        </div>
        <UiRating :value="place.rating" />
      </li>
    </ul>
  </MotionDemo>
</template>

<style scoped>
.stagger {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stagger__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  font-size: 14px;
  animation: stagger-in calc(300ms * var(--motion-scale)) var(--ease-out) both;
  animation-delay: calc(var(--i) * 50ms * var(--motion-scale));
}

.stagger__text {
  display: grid;
}

.stagger__text span {
  color: var(--text-3);
  font-size: 12.5px;
}

@keyframes stagger-in {
  from {
    opacity: 0;
    transform: translateY(calc(8px * var(--motion-distance)));
  }
}
</style>
