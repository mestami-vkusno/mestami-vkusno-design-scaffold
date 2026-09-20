<script setup lang="ts">
import type { UiRouteMotifProps } from './types'

withDefaults(defineProps<UiRouteMotifProps>(), { width: 540 })
</script>

<!-- Фирменный мотив: пунктирный маршрут, метка-пин и четырёхконечная искра. -->
<template>
  <svg class="ui-route-motif" viewBox="0 0 540 200" :width="width" fill="none" aria-hidden="true">
    <path d="M10 170C90 190 150 110 230 120s120 60 170 0 60-90 105-70" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 7" stroke-linecap="round" />
    <circle cx="10" cy="170" r="6" stroke="currentColor" stroke-width="2" />
    <path d="M505 8c-10 0-17 7.5-17 17 0 12 17 27 17 27s17-15 17-27c0-9.5-7-17-17-17z" class="ui-route-motif__pin" stroke="currentColor" stroke-width="2" />
    <circle cx="505" cy="25" r="5" fill="currentColor" />
    <path d="M330 60c1.5 11 6 15.5 17 17-11 1.5-15.5 6-17 17-1.5-11-6-15.5-17-17 11-1.5 15.5-6 17-17z" fill="currentColor" />
  </svg>
</template>

<style scoped>
.ui-route-motif {
  max-width: 100%;
  height: auto;
  color: var(--deco);
}

.ui-route-motif__pin {
  fill: var(--pin-fill);
}
</style>
