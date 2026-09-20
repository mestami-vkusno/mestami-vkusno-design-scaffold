<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import DrawerDemo from '../demos/DrawerDemo.vue'
import DropdownDemo from '../demos/DropdownDemo.vue'
import ModalDemo from '../demos/ModalDemo.vue'
import ToastDemo from '../demos/ToastDemo.vue'
import TooltipDemo from '../demos/TooltipDemo.vue'
</script>

<template>
  <ShowcaseSection id="overlays" title="Окна, списки и подсказки" lead="Всплывающее растёт из того, что его вызвало: список — из кнопки, окно — из центра, шторка — из края экрана. Ничто не появляется из пустоты и не начинается с нулевого размера.">
    <UiGrid :min="340" align="start">
      <ModalDemo />
      <DrawerDemo />
      <DropdownDemo />
      <TooltipDemo />
      <ToastDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
