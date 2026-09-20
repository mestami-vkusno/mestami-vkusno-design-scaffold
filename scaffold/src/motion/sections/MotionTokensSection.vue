<script setup lang="ts">
import { UiGrid } from '@/design-system'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import DurationScaleDemo from '../demos/DurationScaleDemo.vue'
import EasingRaceDemo from '../demos/EasingRaceDemo.vue'
</script>

<template>
  <ShowcaseSection id="tokens" title="Токены движения">
    <template #lead>
      Три кривые и шкала длительностей живут в <code>styles/motion.css</code> и зеркалируются в <code>motion/tokens.ts</code>. Встроенные CSS-кривые слишком слабые, поэтому берём свои. Вход и выход — <code>ease-out</code>, движение по экрану — <code>ease-in-out</code>; <code>ease-in</code> в интерфейсе не используем: он медлит ровно тогда, когда пользователь смотрит.
    </template>
    <UiGrid :min="340" align="start">
      <EasingRaceDemo />
      <DurationScaleDemo />
    </UiGrid>
  </ShowcaseSection>
</template>
