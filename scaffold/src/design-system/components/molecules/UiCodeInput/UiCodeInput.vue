<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue'
import type { UiCodeInputProps } from './types'

const props = withDefaults(defineProps<UiCodeInputProps>(), { length: 6, cellLabel: 'Цифра {n}' })

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ complete: [code: string] }>()

const cells = useTemplateRef<HTMLInputElement[]>('cells')
const digits = computed(() => Array.from({ length: props.length }, (_, index) => model.value[index] ?? ''))

function focusCell(index: number): void {
  void nextTick(() => cells.value?.[Math.min(Math.max(index, 0), props.length - 1)]?.focus())
}

function commit(next: string): void {
  model.value = next.slice(0, props.length)
  if (model.value.length === props.length) emit('complete', model.value)
}

function onInput(index: number, event: Event): void {
  const input = event.target as HTMLInputElement
  const typed = input.value.replace(/\D/g, '')
  if (typed === '') {
    commit(model.value.slice(0, index) + model.value.slice(index + 1))
    input.value = digits.value[index] ?? ''
    return
  }
  commit(model.value.slice(0, index) + typed + model.value.slice(index + typed.length))
  input.value = digits.value[index] ?? ''
  focusCell(index + typed.length)
}

function onKeydown(index: number, event: KeyboardEvent): void {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    event.preventDefault()
    commit(model.value.slice(0, index - 1) + model.value.slice(index))
    focusCell(index - 1)
  } else if (event.key === 'ArrowLeft') {
    focusCell(index - 1)
  } else if (event.key === 'ArrowRight') {
    focusCell(index + 1)
  }
}
</script>

<template>
  <div class="ui-code-input" role="group">
    <input
      v-for="(digit, index) in digits"
      :id="index === 0 ? id : undefined"
      ref="cells"
      :key="index"
      class="ui-code-input__cell"
      :class="{ 'ui-code-input__cell--invalid': invalid }"
      type="text"
      inputmode="numeric"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :maxlength="props.length"
      :value="digit"
      :aria-label="cellLabel.replace('{n}', String(index + 1))"
      :aria-invalid="invalid || undefined"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>

<style scoped>
.ui-code-input {
  display: flex;
  gap: 10px;
}

.ui-code-input__cell {
  width: 44px;
  height: 48px;
  padding: 0;
  text-align: center;
  background: var(--field);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  font: 600 20px var(--font);
}

.ui-code-input__cell:focus {
  outline: none;
  border-color: var(--accent-fg);
  box-shadow: 0 0 0 3px var(--lime-soft);
}

.ui-code-input__cell--invalid {
  border-color: var(--danger);
}

@media (max-width: 720px) {
  .ui-code-input {
    gap: 6px;
  }

  .ui-code-input__cell {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    max-width: 48px;
  }
}
</style>
