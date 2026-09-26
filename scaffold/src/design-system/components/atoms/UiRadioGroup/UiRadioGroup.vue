<script setup lang="ts">
import { provide, toRef, useId } from 'vue'
import { RADIO_GROUP_KEY } from '../UiRadio/context'
import type { UiRadioGroupProps } from './types'

const props = defineProps<UiRadioGroupProps>()
defineSlots<{ /** Варианты — `UiRadio`. */ default(): unknown }>()

const model = defineModel<string>({ default: '' })
const generatedName = useId()

provide(RADIO_GROUP_KEY, {
  name: props.name ?? generatedName,
  model,
  disabled: toRef(props, 'disabled'),
  invalid: toRef(props, 'invalid'),
})
</script>

<!-- Стрелки внутри группы переключают выбор сами: это поведение нативных радио с общим name. -->
<template>
  <div class="ui-radio-group" role="radiogroup" :aria-label="label" :aria-invalid="invalid || undefined" :aria-disabled="disabled || undefined"><slot /></div>
</template>

<style scoped>
.ui-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}
</style>
