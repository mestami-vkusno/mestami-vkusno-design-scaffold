<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import { RESTRAINT_ITEMS } from '../data/restraint'
</script>

<template>
  <ShowcaseSection id="restraint" title="Где анимации не будет" lead="Отказ — тоже решение. Если действие повторяют сотни раз в день или им управляют с клавиатуры, движение только тормозит.">
    <UiGrid :min="300" align="start">
      <article v-for="item in RESTRAINT_ITEMS" :key="item.title" class="restraint">
        <h3 class="restraint__title">{{ item.title }}</h3>
        <p class="restraint__text"><b>Почему:</b> {{ item.why }}</p>
        <p class="restraint__text"><b>Вместо этого:</b> {{ item.instead }}</p>
      </article>
    </UiGrid>
  </ShowcaseSection>
</template>

<style scoped>
.restraint {
  padding: var(--s-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
}

.restraint__title {
  margin: 0 0 var(--s-2);
  font-size: 16px;
  font-weight: 600;
}

.restraint__text {
  margin: 0 0 6px;
  color: var(--text-2);
  font-size: 13.5px;
}

.restraint__text b {
  color: var(--text);
  font-weight: 600;
}
</style>
