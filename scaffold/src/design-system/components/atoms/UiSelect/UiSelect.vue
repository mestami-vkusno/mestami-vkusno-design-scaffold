<script setup lang="ts">
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiSelectProps } from './types'

defineProps<UiSelectProps>()
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })
</script>

<!-- Нативный <select>: на телефонах открывается системный выбор. Атрибуты (id, name, disabled) идут на <select>. -->
<template>
  <span class="ui-select">
    <select v-model="model" class="ui-select__control" :class="{ 'ui-select__control--placeholder': model === '' }" v-bind="$attrs" :aria-invalid="invalid || undefined">
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
    </select>
    <UiIcon name="chev-d" class="ui-select__chevron" />
  </span>
</template>

<style scoped>
.ui-select {
  position: relative;
  display: block;
}

.ui-select__control {
  appearance: none;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 14px;
  background: var(--field);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  font: 400 15px var(--font);
  cursor: pointer;
}

.ui-select__control--placeholder {
  color: var(--text-2);
}

.ui-select__control:hover {
  border-color: var(--border-hover);
}

.ui-select__control:focus {
  outline: none;
  border-color: var(--accent-fg);
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-select__control[aria-invalid='true'] {
  border-color: var(--danger);
}

.ui-select__control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-select__chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-2);
  pointer-events: none;
}
</style>
