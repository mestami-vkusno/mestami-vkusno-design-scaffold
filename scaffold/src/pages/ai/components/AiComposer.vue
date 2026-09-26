<script setup lang="ts">
import { ref } from 'vue'
import { UiSearchInput } from '@/design-system'
import { FEATURE_LABELS } from '@/features'

/* Поле запроса к ИИ. Показывается только тем, кому доступна генерация (§23.1): остальным вместо него предложение подписки. */
const props = defineProps<{ placeholder?: string; initial?: string }>()
const emit = defineEmits<{ submit: [text: string] }>()

const text = ref(props.initial ?? '')

function onSubmit(value: string): void {
  const trimmed = value.trim()
  if (trimmed === '') return
  emit('submit', trimmed)
  text.value = ''
}
</script>

<template>
  <UiSearchInput v-model="text" :label="FEATURE_LABELS.aiField" :placeholder="placeholder" button-icon="send" :button-label="FEATURE_LABELS.aiSend" @submit="onSubmit" />
</template>
