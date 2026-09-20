<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import ThemeTransitionDemo from '../demos/ThemeTransitionDemo.vue'
</script>

<template>
  <ShowcaseSection id="theme" title="Темы" lead="Обе темы построены на одних токенах, поэтому переход — это смена значений на всей странице одним кадром, а анимируется только переход между двумя снимками.">
    <UiGrid :min="340" align="start">
      <ThemeTransitionDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
