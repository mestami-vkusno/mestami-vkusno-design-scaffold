<script setup lang="ts">
import { ref, watch } from 'vue'
import { UiBanner, UiButton, UiEmptyState, UiField, UiSelect, UiSheet, UiTextarea } from '@/design-system'
import { DATA_REQUEST_LABEL, useSettings } from '@/state/settings'
import type { DataRequestType } from '@/state/settings'

/*
  Запрос по персональным данным (§20А): отдельный юридический сценарий, а не удаление аккаунта (обратная отсылка есть и в диалоге удаления).
  Типы запроса — рабочий дефолт мока: ТЗ называет прекращение распространения, отзыв согласия и общий запрос по данным (assumption).
  После отправки запрос принимается и получает статус; срок ответа ТЗ не задаёт.
*/

const open = defineModel<boolean>('open', { required: true })
const settings = useSettings()

const type = ref<DataRequestType | ''>('')
const description = ref('')
const sent = ref(false)

const OPTIONS = (Object.keys(DATA_REQUEST_LABEL) as DataRequestType[]).map((value) => ({ value, label: DATA_REQUEST_LABEL[value] }))

watch(open, (value) => {
  if (!value) return
  type.value = ''
  description.value = ''
  sent.value = false
}, { immediate: true })

function submit(): void {
  if (type.value === '') return
  settings.submitDataRequest(type.value, description.value)
  sent.value = true
}
</script>

<template>
  <UiSheet v-model:open="open" title="Запрос по персональным данным">
    <div class="data-request">
      <UiEmptyState v-if="sent" icon="check" mode="empty" title="Запрос принят" description="Он получит статус «Принят» в настройках. Ответ придёт на ваш email." :heading-level="3">
        <template #actions><UiButton variant="ghost" @click="open = false">Закрыть</UiButton></template>
      </UiEmptyState>
      <form v-else class="data-request__form" novalidate @submit.prevent="submit">
        <UiBanner variant="info">Это не удаление аккаунта. Чтобы удалить аккаунт, используйте «Запрос на удаление аккаунта» в группе «Аккаунт».</UiBanner>
        <UiField label="Тип запроса">
          <template #default="{ id }">
            <UiSelect :id="id" v-model="type" :options="OPTIONS" placeholder="Выберите тип" />
          </template>
        </UiField>
        <UiField label="Описание (необязательно)">
          <template #default="{ id }">
            <UiTextarea :id="id" v-model="description" :max-length="1000" :rows="4" />
          </template>
        </UiField>
        <UiButton type="submit" block :disabled="type === ''">Отправить</UiButton>
      </form>
    </div>
  </UiSheet>
</template>

<style scoped>
.data-request,
.data-request__form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}
</style>
