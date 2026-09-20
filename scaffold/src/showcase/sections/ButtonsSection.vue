<script setup lang="ts">
import { UiButton, UiCluster, UiIconButton } from '@/design-system'
import { BUTTON_STATE_COLUMNS, BUTTON_STATE_ROWS } from '../data/buttons'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
</script>

<template>
  <ShowcaseSection id="buttons" title="Кнопки" lead="Одно главное действие на экран — лаймовая заливка. Остальное — контурные и нейтральные.">
    <ShowcaseSubheading first>Варианты</ShowcaseSubheading>
    <ShowcaseStage>
      <UiCluster>
        <UiButton>Главное действие</UiButton>
        <UiButton icon-right="arrow-r">Со стрелкой</UiButton>
        <UiButton variant="outline">Контурная лайм</UiButton>
        <UiButton variant="neutral">Нейтральная</UiButton>
        <UiButton variant="secondary">Вторичная</UiButton>
        <UiButton variant="ghost">Текстовая</UiButton>
        <UiIconButton icon="heart" label="Избранное" />
        <UiIconButton icon="heart" label="Избранное, выбрано" :pressed="true" />
      </UiCluster>
    </ShowcaseStage>

    <ShowcaseSubheading>Размеры</ShowcaseSubheading>
    <ShowcaseStage>
      <UiCluster>
        <UiButton size="sm">Малая · 34</UiButton>
        <UiButton>Средняя · 44</UiButton>
        <UiButton size="lg">Крупная · 52</UiButton>
      </UiCluster>
    </ShowcaseStage>

    <ShowcaseSubheading>Состояния</ShowcaseSubheading>
    <ShowcaseStage class="buttons-states">
      <div class="buttons-states__grid">
        <span />
        <span v-for="column in BUTTON_STATE_COLUMNS" :key="column.label" class="buttons-states__head">{{ column.label }}</span>
        <template v-for="row in BUTTON_STATE_ROWS" :key="row.label">
          <span class="buttons-states__head">{{ row.label }}</span>
          <UiButton v-for="column in BUTTON_STATE_COLUMNS" :key="column.label" :variant="row.variant" :preview-state="column.preview" :loading="column.loading" :disabled="column.disabled">Кнопка</UiButton>
        </template>
      </div>
    </ShowcaseStage>
  </ShowcaseSection>
</template>

<style scoped>
.buttons-states {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.buttons-states__grid {
  display: grid;
  grid-template-columns: 76px repeat(6, minmax(128px, 1fr));
  gap: var(--s-3) var(--s-4);
  align-items: center;
}

.buttons-states__head {
  color: var(--text-3);
  font-size: 12px;
}

@media (max-width: 720px) {
  .buttons-states__grid {
    gap: var(--s-3);
  }
}
</style>
