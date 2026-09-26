<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import UiIcon from '../UiIcon/UiIcon.vue'
import type { UiRatingInputProps } from './types'

const props = withDefaults(defineProps<UiRatingInputProps>(), { valueLabel: (value: number) => `${value} из 5` })

/** Оценка 1–5; 0 — ещё не выбрана. */
const model = defineModel<number>({ default: 0 })
const name = useId()

// Подсветка под курсором только у мыши: на тач-экране наведения нет.
const hovered = ref(0)
const shown = computed(() => (props.disabled ? model.value : hovered.value || model.value))

function onEnter(event: PointerEvent, value: number): void {
  if (event.pointerType === 'mouse') hovered.value = value
}
</script>

<!-- Нативные радио: стрелки меняют оценку, Tab входит в группу один раз. Звезда — подпись, не кнопка. -->
<template>
  <div class="ui-rating-input" :class="{ 'ui-rating-input--invalid': invalid }" role="radiogroup" :aria-label="label" :aria-invalid="invalid || undefined" :aria-disabled="disabled || undefined" @pointerleave="hovered = 0">
    <label v-for="value in 5" :key="value" class="ui-rating-input__item" @pointerenter="onEnter($event, value)">
      <input
        class="ui-rating-input__input"
        type="radio"
        :name="name"
        :value="value"
        :checked="model === value"
        :disabled="disabled"
        :aria-label="valueLabel(value)"
        :data-preview="previewState && model === value ? previewState : undefined"
        @change="model = value"
      />
      <UiIcon name="star" :size="28" :filled="value <= shown" class="ui-rating-input__star" :class="{ 'ui-rating-input__star--on': value <= shown }" />
    </label>
  </div>
</template>

<style scoped>
.ui-rating-input {
  display: inline-flex;
}

.ui-rating-input__item {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  cursor: pointer;
}

.ui-rating-input__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}

.ui-rating-input__star {
  color: var(--text-3);
  transition: color var(--dur-hover) ease, transform var(--dur-press) var(--ease-out);
  pointer-events: none;
}

.ui-rating-input__star--on {
  color: var(--star);
}

.ui-rating-input__item:active .ui-rating-input__star {
  transform: scale(calc(1 - 0.12 * var(--motion-distance)));
}

.ui-rating-input__item:has(.ui-rating-input__input:focus-visible),
.ui-rating-input__item:has(.ui-rating-input__input[data-preview='focus']) {
  box-shadow: var(--ring);
}

.ui-rating-input--invalid .ui-rating-input__star:not(.ui-rating-input__star--on) {
  color: var(--danger);
}

.ui-rating-input[aria-disabled='true'] {
  opacity: 0.5;
}

.ui-rating-input[aria-disabled='true'] .ui-rating-input__item {
  cursor: not-allowed;
}
</style>
