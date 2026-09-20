<script setup lang="ts">
import type { UiCheckboxProps } from './types'

defineProps<UiCheckboxProps>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="ui-checkbox" :class="{ 'ui-checkbox--disabled': disabled }">
    <input v-model="model" class="ui-checkbox__box" type="checkbox" :disabled="disabled" />
    <span class="ui-checkbox__label"><slot /></span>
  </label>
</template>

<style scoped>
.ui-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--text-2);
  cursor: pointer;
}

.ui-checkbox--disabled {
  cursor: not-allowed;
}

.ui-checkbox--disabled .ui-checkbox__label {
  opacity: 0.5;
}

.ui-checkbox__box {
  appearance: none;
  display: grid;
  place-items: center;
  flex: none;
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  background: var(--field);
  cursor: inherit;
}

.ui-checkbox__box:checked {
  background: var(--lime);
  border-color: var(--lime);
}

.ui-checkbox__box:checked::after {
  content: '';
  width: 9px;
  height: 5px;
  border: 2px solid var(--on-accent);
  border-top: 0;
  border-right: 0;
  transform: rotate(-45deg) translate(1px, -1px);
}

.ui-checkbox__box:focus-visible {
  box-shadow: var(--ring);
}

@media (pointer: coarse) {
  .ui-checkbox__box {
    width: 22px;
    height: 22px;
    margin-top: 0;
  }
}
</style>
