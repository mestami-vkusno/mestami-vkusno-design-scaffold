<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import PageTransitionDemo from '../demos/PageTransitionDemo.vue'
import RouteTransitionDemo from '../demos/RouteTransitionDemo.vue'
import SharedElementDemo from '../demos/SharedElementDemo.vue'
</script>

<template>
  <ShowcaseSection id="pages" title="Переходы между страницами" lead="Переход показывает, куда мы попали: глубже, в сторону или поверх. Тип перехода выбирается по смыслу навигации, а не по вкусу.">
    <UiGrid :min="340" align="start">
      <RouteTransitionDemo />
      <PageTransitionDemo />
      <SharedElementDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
