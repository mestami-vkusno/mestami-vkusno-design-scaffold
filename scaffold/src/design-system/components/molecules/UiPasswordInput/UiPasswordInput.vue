<script setup lang="ts">
import { ref } from 'vue'
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiInput from '../../atoms/UiInput/UiInput.vue'
import type { UiPasswordInputProps } from './types'

withDefaults(defineProps<UiPasswordInputProps>(), { showLabel: 'Показать пароль', hideLabel: 'Скрыть пароль' })
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<template>
  <div class="ui-password-input">
    <UiInput v-model="model" v-bind="$attrs" :type="visible ? 'text' : 'password'" :invalid="invalid" />
    <button class="ui-password-input__toggle" type="button" :aria-label="visible ? hideLabel : showLabel" :aria-pressed="visible" @click="visible = !visible">
      <UiIcon name="eye" />
    </button>
  </div>
</template>

<style scoped>
.ui-password-input {
  position: relative;
}

.ui-password-input :deep(.ui-input) {
  padding-right: 44px;
}

.ui-password-input__toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  padding: 6px;
  border: 0;
  background: none;
  color: var(--text-2);
  cursor: pointer;
}

.ui-password-input__toggle[aria-pressed='true'] {
  color: var(--accent-fg);
}
</style>
