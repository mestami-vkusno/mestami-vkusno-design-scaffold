<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import AccordionDemo from '../demos/AccordionDemo.vue'
import ListLayoutDemo from '../demos/ListLayoutDemo.vue'
import SlidingTabsDemo from '../demos/SlidingTabsDemo.vue'
import StaggerDemo from '../demos/StaggerDemo.vue'
</script>

<template>
  <ShowcaseSection id="lists" title="Списки, вкладки и блоки" lead="Состав и порядок меняются часто, поэтому движение должно быть прерываемым: пользователь не ждёт конца анимации, чтобы нажать снова.">
    <UiGrid :min="340" align="start">
      <SlidingTabsDemo />
      <AccordionDemo />
      <ListLayoutDemo />
      <StaggerDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
