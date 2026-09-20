<script setup lang="ts">
import UiBadge from '../../atoms/UiBadge/UiBadge.vue'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiSparks from '../../atoms/UiSparks/UiSparks.vue'
import UiThemeScope from '../../atoms/UiThemeScope/UiThemeScope.vue'
import type { UiPromoPanelProps } from './types'

defineProps<UiPromoPanelProps>()
defineSlots<{ /** Поле ввода или кнопка действия. */ default?(): unknown }>()
</script>

<!-- Акцентный блок всегда тёмный — «остров» с лаймовым контуром и свечением, в том числе в светлой теме. -->
<template>
  <UiThemeScope theme="dark" as="section" class="ui-promo-panel">
    <UiSparks class="ui-promo-panel__sparks" />
    <h4 class="ui-promo-panel__title">
      {{ title }}
      <UiBadge v-if="badge" pill>{{ badge }}</UiBadge>
    </h4>
    <p v-if="description" class="ui-promo-panel__description">{{ description }}</p>
    <div class="ui-promo-panel__action"><slot /></div>
    <p v-if="note" class="ui-promo-panel__note">
      <UiIcon name="lock" :size="14" />
      {{ note }}
    </p>
  </UiThemeScope>
</template>

<style scoped>
.ui-promo-panel {
  position: relative;
  display: grid;
  gap: var(--s-4);
  overflow: hidden;
  padding: var(--s-6);
  background: radial-gradient(120% 140% at 0% 0%, var(--promo-tint), transparent 55%), var(--bg);
  border: 1px solid var(--lime-line);
  border-radius: var(--r-lg);
  box-shadow: var(--glow);
}

.ui-promo-panel__sparks {
  position: absolute;
  right: 18px;
  top: 10px;
  width: 120px;
  opacity: 0.85;
  pointer-events: none;
}

.ui-promo-panel__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding-right: 110px;
  font-size: 26px;
  font-weight: 700;
}

.ui-promo-panel__description {
  margin: 0;
  color: var(--text-2);
  font-size: 14px;
}

.ui-promo-panel__action {
  max-width: 640px;
}

.ui-promo-panel__note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--text-3);
  font-size: 12px;
}

@media (max-width: 720px) {
  .ui-promo-panel {
    padding: var(--s-5) var(--s-4);
  }

  .ui-promo-panel__title {
    padding-right: 56px;
    font-size: 22px;
  }

  .ui-promo-panel__sparks {
    width: 64px;
    right: 8px;
    top: 6px;
    opacity: 0.55;
  }
}
</style>
