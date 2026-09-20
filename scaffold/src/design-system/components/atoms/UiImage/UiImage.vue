<script setup lang="ts">
import type { UiImageProps } from './types'

withDefaults(defineProps<UiImageProps>(), { alt: '', tone: 'ember', ratio: '4/3' })
</script>

<template>
  <div class="ui-image" :class="[`ui-image--${tone}`, { 'ui-image--fill': ratio === 'fill' }]" :style="ratio === 'fill' ? undefined : { aspectRatio: ratio.replace('/', ' / ') }">
    <img v-if="src" class="ui-image__img" :src="src" :alt="alt" loading="lazy" />
    <div v-if="$slots['top-start']" class="ui-image__corner ui-image__corner--start"><slot name="top-start" /></div>
    <div v-if="$slots['top-end']" class="ui-image__corner ui-image__corner--end"><slot name="top-end" /></div>
  </div>
</template>

<style scoped>
.ui-image {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 20% 15%, rgba(255, 170, 80, 0.3), transparent 55%),
    radial-gradient(90% 90% at 85% 90%, rgba(204, 255, 0, 0.1), transparent 60%),
    linear-gradient(160deg, #2a221b, #0f0d0b 70%);
}

.ui-image--dusk {
  background:
    radial-gradient(100% 80% at 70% 20%, rgba(120, 160, 255, 0.22), transparent 55%),
    linear-gradient(200deg, #1a2030, #0b0d12 75%);
}

.ui-image--rust {
  background:
    radial-gradient(90% 90% at 30% 80%, rgba(255, 120, 80, 0.22), transparent 55%),
    linear-gradient(170deg, #2a1c1c, #0d0909 75%);
}

.ui-image--fill {
  width: 100%;
  height: 100%;
}

.ui-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-image__corner {
  position: absolute;
  top: 10px;
  display: flex;
  gap: 6px;
}

.ui-image__corner--start {
  left: 10px;
}

.ui-image__corner--end {
  right: 10px;
}
</style>
