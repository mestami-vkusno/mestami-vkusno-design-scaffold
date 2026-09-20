<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import DragDismissDemo from '../demos/DragDismissDemo.vue'
import InterruptionDemo from '../demos/InterruptionDemo.vue'
</script>

<template>
  <ShowcaseSection id="gestures" title="Жесты и прерывание" lead="Пользователь может передумать посреди движения. Поэтому у жестов и частых действий — пружины и transition, которые подхватывают текущее состояние, а не keyframes, которые начинают заново.">
    <UiGrid :min="340" align="start">
      <DragDismissDemo />
      <InterruptionDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
