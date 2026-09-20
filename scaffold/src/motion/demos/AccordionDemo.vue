<script setup lang="ts">
import { ref } from 'vue'
import { UiIcon } from '@/design-system'
import MotionDemo from '../components/MotionDemo.vue'

const FAQ = [
  { id: 'book', q: 'Как записаться в заведение?', a: 'Откройте карточку заведения и нажмите «Записаться». Подтверждение придёт на почту.' },
  { id: 'cancel', q: 'Можно ли отменить запись?', a: 'Да, до начала события. Столик сразу освободится для других гостей.' },
  { id: 'free', q: 'Сервис бесплатный?', a: 'Гастрогид, поиск и афиша бесплатны. Платный слой — Премиум с ИИ-подбором.' },
] as const

const opened = ref<string | null>('book')

function toggle(id: string): void {
  opened.value = opened.value === id ? null : id
}
</script>

<template>
  <MotionDemo
    title="Раскрывающийся блок"
    tier="occasional"
    purpose="state"
    description="Содержимое раскрывается за 200 мс. Высота — единственное свойство, которое приходится анимировать через раскладку: там нет аналога на transform, поэтому длительность короткая."
    :specs="[
      { label: 'Инструмент', value: 'CSS transition' },
      { label: 'Свойства', value: 'grid-template-rows: 0fr → 1fr, opacity, transform (шеврон)' },
      { label: 'Кривая', value: 'var(--ease-out), 200 мс' },
    ]"
  >
    <ul class="faq">
      <li v-for="item in FAQ" :key="item.id" class="faq__item" :class="{ 'faq__item--open': opened === item.id }">
        <button class="faq__question" type="button" :aria-expanded="opened === item.id" :aria-controls="`faq-${item.id}`" @click="toggle(item.id)">
          {{ item.q }}
          <UiIcon name="chev-d" class="faq__chevron" />
        </button>
        <div :id="`faq-${item.id}`" class="faq__panel" :inert="opened !== item.id">
          <div class="faq__answer">{{ item.a }}</div>
        </div>
      </li>
    </ul>
  </MotionDemo>
</template>

<style scoped>
.faq {
  margin: 0;
  padding: 0;
  list-style: none;
}

.faq__item {
  border-top: 1px solid var(--border);
}

.faq__item:first-child {
  border-top: 0;
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
  padding: 12px 0;
  border: 0;
  background: none;
  color: var(--text);
  font: 500 14px var(--font);
  text-align: left;
  cursor: pointer;
}

.faq__chevron {
  color: var(--text-2);
  transition: transform var(--dur-dropdown) var(--ease-out);
}

.faq__item--open .faq__chevron {
  transform: rotate(calc(180deg * var(--motion-distance)));
}

.faq__panel {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows var(--dur-dropdown) var(--ease-out),
    opacity var(--dur-dropdown) var(--ease-out);
}

.faq__item--open .faq__panel {
  grid-template-rows: 1fr;
  opacity: 1;
}

.faq__answer {
  min-height: 0;
  overflow: hidden;
  color: var(--text-2);
  font-size: 13.5px;
}

.faq__item--open .faq__answer {
  padding-bottom: 12px;
}
</style>
