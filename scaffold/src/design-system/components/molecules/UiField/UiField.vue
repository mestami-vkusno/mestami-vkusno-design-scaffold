<script setup lang="ts">
import { computed, useId } from 'vue'
import type { UiFieldProps, UiFieldSlotProps } from './types'

const props = defineProps<UiFieldProps>()
defineSlots<{ default(props: UiFieldSlotProps): unknown }>()

const id = useId()
const messageId = `${id}-message`
const hasMessage = computed(() => Boolean(props.error || props.hint))
const describedBy = computed(() => (hasMessage.value ? messageId : undefined))
</script>

<template>
  <div class="ui-field">
    <label class="ui-field__label" :for="id">{{ label }}</label>
    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />
    <span v-if="error" :id="messageId" class="ui-field__message ui-field__message--error" role="alert">{{ error }}</span>
    <span v-else-if="hint" :id="messageId" class="ui-field__message">{{ hint }}</span>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ui-field__label {
  font-size: 13px;
  color: var(--text-2);
}

.ui-field__message {
  font-size: 12px;
  color: var(--text-3);
}

.ui-field__message--error {
  color: var(--danger);
}
</style>
