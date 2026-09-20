<script setup lang="ts">
import type { UiInputProps } from './types'

withDefaults(defineProps<UiInputProps>(), { type: 'text' })

const model = defineModel<string>({ default: '' })
</script>

<!-- Остальные атрибуты (id, name, placeholder, disabled, aria-*) уходят прямо на <input>. -->
<template>
  <input v-model="model" class="ui-input" :class="{ 'ui-input--invalid': invalid }" :type="type" :aria-invalid="invalid || undefined" :data-preview="previewState" />
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
  border-color: #555;
}

.ui-input:focus,
.ui-input[data-preview='focus'] {
  outline: none;
  border-color: var(--accent-fg);
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-input--invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(255, 92, 92, 0.14);
}

.ui-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
