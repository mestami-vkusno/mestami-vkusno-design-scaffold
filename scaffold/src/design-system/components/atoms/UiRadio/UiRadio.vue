<script setup lang="ts">
import { computed, inject } from 'vue'
import { RADIO_GROUP_KEY } from './context'
import type { UiRadioProps } from './types'

const props = defineProps<UiRadioProps>()
defineSlots<{ default?(): unknown }>()

// Внутри UiRadioGroup выбор хранит группа; отдельное радио ведёт свой v-model.
const group = inject(RADIO_GROUP_KEY, null)
const own = defineModel<string>({ default: '' })

const checked = computed(() => (group ? group.model.value : own.value) === props.value)
const isDisabled = computed(() => props.disabled || group?.disabled.value === true)

function select(): void {
  if (group) group.model.value = props.value
  else own.value = props.value
}
</script>

<!-- Нативный <input type="radio">: стрелки, Tab и группировку по name даёт браузер; вся строка — область нажатия. -->
<template>
  <label class="ui-radio" :class="{ 'ui-radio--disabled': isDisabled, 'ui-radio--invalid': group?.invalid.value === true }">
    <input
      class="ui-radio__input"
      type="radio"
      :name="group?.name ?? name"
      :value="value"
      :checked="checked"
      :disabled="isDisabled"
      :data-preview="previewState"
      @change="select"
    />
    <span class="ui-radio__text">
      <span class="ui-radio__label"><slot /></span>
      <span v-if="description" class="ui-radio__description">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped>
.ui-radio {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 32px;
  padding: 4px 0;
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
}

.ui-radio--disabled {
  cursor: not-allowed;
}

.ui-radio--disabled .ui-radio__input,
.ui-radio--disabled .ui-radio__text {
  opacity: 0.5;
}

.ui-radio__input {
  appearance: none;
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin: 2px 0 0;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--field);
  cursor: inherit;
  transition: background var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.ui-radio__input::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--on-accent);
  opacity: 0;
  transform: scale(calc(1 - var(--motion-distance)));
  transition:
    opacity var(--dur-press) var(--ease-out),
    transform var(--dur-press) var(--ease-out);
}

.ui-radio__input:checked {
  background: var(--lime);
  border-color: var(--accent-fg);
}

/* В режиме «Меньше» масштаб не меняется (--motion-distance = 0 → scale(1)), точка только проявляется. */
.ui-radio__input:checked::after {
  opacity: 1;
  transform: scale(1);
}

.ui-radio--invalid .ui-radio__input:not(:checked) {
  border-color: var(--danger);
}

.ui-radio__input:focus-visible,
.ui-radio__input[data-preview='focus'] {
  box-shadow: var(--ring);
}

.ui-radio__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ui-radio__label {
  line-height: 1.35;
}

.ui-radio__description {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-3);
}

/* На тач-экране нажимается вся строка не ниже 44 px. */
@media (pointer: coarse) {
  .ui-radio {
    min-height: 44px;
    padding: 10px 0;
    align-items: center;
  }

  .ui-radio__input {
    width: 22px;
    height: 22px;
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-radio__input::after {
    transition: none;
  }
}
</style>
