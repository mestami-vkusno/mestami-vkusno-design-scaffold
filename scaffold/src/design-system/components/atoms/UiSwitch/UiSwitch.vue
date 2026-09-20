<script setup lang="ts">
import type { UiSwitchProps } from './types'

defineProps<UiSwitchProps>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="ui-switch">
    <span class="ui-switch__label"><slot /></span>
    <span class="ui-switch__control">
      <input v-model="model" class="ui-switch__input" type="checkbox" role="switch" :disabled="disabled" />
    </span>
  </label>
</template>

<style scoped>
.ui-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  font-size: 14px;
  color: var(--text-2);
  cursor: pointer;
}

.ui-switch__control {
  position: relative;
  flex: none;
  width: 44px;
  height: 26px;
}

.ui-switch__input {
  appearance: none;
  position: absolute;
  inset: 0;
  margin: 0;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: background 0.15s;
}

.ui-switch__input::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-2);
  transition: transform 0.15s, background 0.15s;
}

.ui-switch__input:checked {
  background: var(--switch-on-bg);
  border-color: var(--switch-on-line);
}

.ui-switch__input:checked::after {
  transform: translateX(18px);
  background: var(--switch-on-knob);
}

.ui-switch__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
