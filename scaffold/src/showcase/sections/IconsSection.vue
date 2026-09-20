<script setup lang="ts">
import { ICON_NAMES, UiIcon, UiRouteMotif, UiSurface, UiText } from '@/design-system'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
</script>

<template>
  <ShowcaseSection
    id="icons"
    title="Иконки и декор"
    lead="Контурные иконки 24 px, штрих 1.75 px, скруглённые концы. Активное состояние — лаймовая заливка. Фирменный мотив — пунктирный маршрут, метка и искры."
  >
    <div class="icons-grid">
      <UiSurface v-for="name in ICON_NAMES" :key="name" class="icons-cell">
        <UiIcon :name="name" :size="24" />
        <code>{{ name }}</code>
      </UiSurface>
    </div>

    <ShowcaseSubheading>Фирменный мотив</ShowcaseSubheading>
    <ShowcaseStage class="icons-motif">
      <UiRouteMotif />
      <UiText variant="caption">Пунктир 5/7, штрих 1.5 px; метка-пин и четырёхконечная искра. В тёмной теме лайм, в светлой чёрный с лаймовой меткой</UiText>
    </ShowcaseStage>
  </ShowcaseSection>
</template>

<style scoped>
.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--s-4);
}

.icons-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--s-4);
  text-align: center;
}

.icons-motif {
  display: grid;
  place-items: center;
  gap: var(--s-2);
  padding: var(--s-8);
}

@media (max-width: 720px) {
  .icons-grid {
    gap: var(--s-3);
  }

  .icons-cell {
    padding: var(--s-3) 4px;
  }
}
</style>
