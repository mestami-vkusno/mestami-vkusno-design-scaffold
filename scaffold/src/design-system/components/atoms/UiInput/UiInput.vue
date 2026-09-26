<script setup lang="ts">
import type { UiInputProps } from './types'

withDefaults(defineProps<UiInputProps>(), { type: 'text' })

const model = defineModel<string>({ default: '' })
</script>

<!-- Остальные атрибуты (id, name, placeholder, disabled, aria-*) уходят прямо на <input>. Дата — нативное поле: на телефоне открывается системный выбор, цвета календаря следуют теме через color-scheme. -->
<template>
  <input v-model="model" class="ui-input" :class="{ 'ui-input--invalid': invalid }" :type="type" :max="max" :min="min" :aria-invalid="invalid || undefined" :data-preview="previewState" />
</template>

<style scoped>
.ui-input {
  height: 44px;
  width: 100%;
  padding: 0 14px;
  background: var(--field);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  font: 400 15px var(--font);
}

.ui-input::placeholder {
  color: var(--text-3);
}

.ui-input:hover {
  border-color: var(--border-hover);
}

.ui-input:focus,
.ui-input[data-preview='focus'] {
  outline: none;
  border-color: var(--accent-fg);
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-input--invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 14%, transparent);
}

.ui-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Нативная дата: iOS Safari без явной высоты схлопывает поле и центрирует значение. */
.ui-input[type='date'] {
  appearance: none;
  min-height: 44px;
  text-align: start;
  font-variant-numeric: tabular-nums;
}

.ui-input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.ui-input[type='date']:disabled::-webkit-calendar-picker-indicator {
  cursor: not-allowed;
}
</style>
