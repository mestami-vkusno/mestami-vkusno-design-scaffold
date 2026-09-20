<script setup lang="ts">
import { UiCluster, UiGrid } from '@/design-system'
import { RADIUS_STEPS, SPACING_STEPS } from '../data/shape'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
</script>

<template>
  <ShowcaseSection
    id="space"
    title="Форма и отступы"
    lead="Шаг сетки 4 px. Скругления растут с размером элемента: у кнопок и полей небольшие, у карточек крупные, у чипов и круглых кнопок полные."
  >
    <UiGrid :min="300" align="start">
      <div>
        <ShowcaseSubheading first>Отступы</ShowcaseSubheading>
        <div v-for="step in SPACING_STEPS" :key="step.token" class="shape-scale__row">
          <span class="shape-scale__label">{{ step.px }} · {{ step.token }}</span>
          <i class="shape-scale__bar" :style="{ width: `${step.px}px` }" />
        </div>
      </div>
      <div>
        <ShowcaseSubheading first>Скругления</ShowcaseSubheading>
        <UiCluster>
          <div v-for="step in RADIUS_STEPS" :key="step.token" class="shape-radius" :style="{ borderRadius: `var(${step.token})` }">
            {{ step.px ?? '∞' }}<br />{{ step.token }}<br />{{ step.usage }}
          </div>
        </UiCluster>
        <ShowcaseSubheading>Свечение</ShowcaseSubheading>
        <div class="shape-glow">--glow · блок ИИ и акцентные панели</div>
      </div>
    </UiGrid>
  </ShowcaseSection>
</template>

<style scoped>
.shape-scale__row {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  margin-bottom: var(--s-2);
}

.shape-scale__label {
  width: 100px;
  color: var(--text-2);
  font-size: 12.5px;
}

.shape-scale__bar {
  display: block;
  height: 16px;
  border-radius: 3px;
  outline: 1px solid var(--border-strong);
  background: var(--lime);
  opacity: 0.9;
}

.shape-radius {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text-2);
  font-size: 12px;
  text-align: center;
}

.shape-glow {
  display: grid;
  place-items: center;
  height: 96px;
  border: 1px solid var(--lime-line);
  border-radius: var(--r-lg);
  box-shadow: var(--glow);
  color: var(--text-2);
  font-size: 13px;
}
</style>
