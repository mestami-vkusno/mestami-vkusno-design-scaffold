<script setup lang="ts">
import { useCssToken } from '@/design-system'
import type { ColorToken } from '../data/colors'

const props = defineProps<{ color: ColorToken }>()

const value = useCssToken(props.color.token)
</script>

<template>
  <div class="showcase-swatch">
    <i class="showcase-swatch__color" :style="{ background: `var(${color.token})` }" />
    <div class="showcase-swatch__info">
      <b class="showcase-swatch__name">{{ color.name }}</b>
      <code class="showcase-swatch__value">{{ color.token }} · {{ value }}</code>
      <small class="showcase-swatch__usage">{{ color.usage }}</small>
    </div>
  </div>
</template>

<style scoped>
.showcase-swatch {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
}

.showcase-swatch__color {
  display: block;
  height: 76px;
  border-bottom: 1px solid var(--border);
}

.showcase-swatch__info {
  padding: 10px 14px 12px;
}

.showcase-swatch__name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.showcase-swatch__value {
  display: block;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.showcase-swatch__usage {
  display: block;
  color: var(--text-3);
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 720px) {
  .showcase-swatch__color {
    height: 56px;
  }

  .showcase-swatch__info {
    padding: 8px 10px 10px;
  }

  .showcase-swatch__value {
    font-size: 11.5px;
  }

}
</style>
