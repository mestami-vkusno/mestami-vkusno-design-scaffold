<script setup lang="ts">
import { UiText } from '@/design-system'

/* Строка настройки с органом управления под заголовком (сегмент, кнопка): заголовок, пояснение `caption` и слот. Переключатели и ссылки — `UiListRow`. */
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="settings-field">
    <div class="settings-field__text">
      <span class="settings-field__title">{{ title }}</span>
      <UiText v-if="description" variant="caption" class="settings-field__description">{{ description }}</UiText>
    </div>
    <div class="settings-field__control"><slot /></div>
  </div>
</template>

<style scoped>
.settings-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  padding: var(--s-3);
}

.settings-field__text {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px;
}

.settings-field__title {
  font-weight: 500;
}

.settings-field__description {
  color: var(--text-3);
}

.settings-field__control {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-2);
}
</style>
