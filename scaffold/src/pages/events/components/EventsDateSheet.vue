<script setup lang="ts">
/* Выбор конкретной даты Афиши (§11.2 «Дата»): шторка на телефоне, окно по центру от 720 px (см. UiSheet). */
import { ref, watch } from 'vue'
import { UiButton, UiCluster, UiField, UiInput, UiSheet, UiStack } from '@/design-system'
import { addDays, MOCK_TODAY } from '@/mocks/time'

const props = defineProps<{ date: string | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ apply: [date: string | null] }>()

const MAX_DATE = addDays(MOCK_TODAY, 180)
const draft = ref(props.date ?? MOCK_TODAY)

watch(open, (isOpen) => {
  if (isOpen) draft.value = props.date ?? MOCK_TODAY
})

function apply(): void {
  emit('apply', draft.value)
  open.value = false
}

function reset(): void {
  emit('apply', null)
  open.value = false
}
</script>

<template>
  <UiSheet v-model:open="open" title="Выбрать дату">
    <UiStack :gap="6">
      <UiField label="Дата события">
        <template #default="{ id, describedBy }">
          <UiInput :id="id" v-model="draft" type="date" :min="MOCK_TODAY" :max="MAX_DATE" :aria-describedby="describedBy" />
        </template>
      </UiField>
      <UiCluster justify="between">
        <UiButton variant="outline" @click="reset">Сбросить</UiButton>
        <UiButton icon-right="arrow-r" @click="apply">Показать события</UiButton>
      </UiCluster>
    </UiStack>
  </UiSheet>
</template>
