<script setup lang="ts">
/* Карта-заглушка «Как добраться»: в моке нет карт-провайдера, поэтому только статичный знак места и адрес текстом. */
import { UiIcon, UiText } from '@/design-system'

defineProps<{ address: string; district?: string; metro?: string }>()
</script>

<template>
  <div class="event-map">
    <div class="event-map__placeholder" role="img" aria-label="Схематичная карта расположения заведения">
      <UiIcon name="pin" :size="28" />
    </div>
    <div class="event-map__text">
      <UiText variant="body">{{ address }}</UiText>
      <UiText v-if="district" variant="caption">{{ district }}</UiText>
      <UiText v-if="metro" variant="caption">{{ metro }}</UiText>
    </div>
  </div>
</template>

<style scoped>
.event-map {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.event-map__placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  border-radius: var(--r-lg);
  border: 1px solid var(--border);
  background: repeating-linear-gradient(45deg, var(--surface) 0 12px, var(--surface-2) 12px 24px);
  color: var(--text-3);
}

.event-map__text {
  display: grid;
  gap: 2px;
  color: var(--text-2);
}
</style>
