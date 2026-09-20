<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import ButtonPressDemo from '../demos/ButtonPressDemo.vue'
import ButtonStatusDemo from '../demos/ButtonStatusDemo.vue'
import HoldConfirmDemo from '../demos/HoldConfirmDemo.vue'
import ToggleDemo from '../demos/ToggleDemo.vue'
</script>

<template>
  <ShowcaseSection id="buttons" title="Кнопки и состояния" lead="Кнопки нажимают десятки раз в день, поэтому реакция короткая и без украшений. Больше движения — только там, где меняется смысл: сохранение, необратимое действие.">
    <UiGrid :min="340" align="start">
      <ButtonPressDemo />
      <ButtonStatusDemo />
      <ToggleDemo />
      <HoldConfirmDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
