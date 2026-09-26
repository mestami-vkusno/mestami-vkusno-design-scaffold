<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiButton, UiEmptyState, UiField, UiRadio, UiRadioGroup, UiSheet, UiText, UiTextarea } from '@/design-system'
import { CONTENT_COMPLAINT_CATEGORIES, EVENT_DATA_CATEGORIES, VENUE_DATA_CATEGORIES, useActivity, type ComplaintCategory, type ComplaintFlow, type ComplaintTarget } from '@/state/activity'

/*
  O9 · Жалобы: два разных потока (§21.2, §21.3). O9а «Пожаловаться» — на контент (публикация, отзыв, комментарий, профиль):
  причина, описание, итог со ссылкой на «Центр активности → Системные» (J12). O9б «Сообщить о неточности» — данные заведения
  или события: свои причины, итог «Спасибо, проверим данные», в Центр активности не дублируется. Гость сначала проходит вход
  (O5, гейт в `useOverlays`): жалоба от гостя открыла бы путь скоординированным жалобам (§21.2, assumption). Без сети и с ошибкой отправки мок не ломается:
  жалоба принимается всегда.
*/

const props = defineProps<{ flow: ComplaintFlow; target: ComplaintTarget }>()
const open = defineModel<boolean>('open', { required: true })

const activity = useActivity()
const step = ref<'reason' | 'details' | 'done'>('reason')
const categoryId = ref('')
const description = ref('')

const isData = computed(() => props.flow === 'data')
const categories = computed<readonly ComplaintCategory[]>(() => {
  if (!isData.value) return CONTENT_COMPLAINT_CATEGORIES
  return props.target.kind === 'event' ? EVENT_DATA_CATEGORIES : VENUE_DATA_CATEGORIES
})
const category = computed(() => categories.value.find((item) => item.id === categoryId.value))
const title = computed(() => (isData.value ? 'Сообщить о неточности' : 'Пожаловаться'))

watch(open, (value) => {
  if (!value) return
  step.value = 'reason'
  categoryId.value = ''
  description.value = ''
}, { immediate: true })

function next(): void {
  if (category.value !== undefined) step.value = 'details'
}

function send(): void {
  if (category.value === undefined) return
  activity.submitComplaint({ flow: props.flow, target: props.target, category: category.value, description: description.value })
  step.value = 'done'
}
</script>

<template>
  <UiSheet v-model:open="open" :title="title">
    <div class="report">
      <template v-if="step !== 'done'">
        <UiText variant="body" class="report__subject">{{ isData ? 'Данные:' : 'На что жалоба:' }} <strong>{{ target.title }}</strong></UiText>

        <template v-if="step === 'reason'">
          <UiText v-if="!isData" variant="caption" class="report__note">Несогласие с мнением о месте нарушением не считается.</UiText>
          <UiRadioGroup v-model="categoryId" :label="isData ? 'Что неверно' : 'Причина жалобы'">
            <UiRadio v-for="item in categories" :key="item.id" :value="item.id">{{ item.label }}</UiRadio>
          </UiRadioGroup>
          <UiButton block :disabled="category === undefined" @click="next">Далее</UiButton>
        </template>

        <template v-else>
          <UiText variant="caption" class="report__note">{{ category?.label }}</UiText>
          <UiField :label="isData ? 'Что верно (необязательно)' : 'Описание (необязательно)'">
            <template #default="{ id }">
              <UiTextarea :id="id" v-model="description" :max-length="500" :rows="4" />
            </template>
          </UiField>
          <div class="report__actions">
            <UiButton block @click="send">{{ isData ? 'Отправить' : 'Отправить жалобу' }}</UiButton>
            <UiButton variant="ghost" block @click="step = 'reason'">Назад</UiButton>
          </div>
        </template>
      </template>

      <template v-else>
        <UiEmptyState
          mode="empty"
          icon="check"
          :title="isData ? 'Спасибо, проверим данные' : 'Жалоба отправлена'"
          :description="isData ? 'Если данные подтвердятся, карточка обновится.' : 'Статус можно посмотреть в Центре активности, вкладка «Системные».'"
          :heading-level="3"
        >
          <template #actions>
            <UiButton v-if="!isData" variant="outline" href="/activity" @click="open = false">Открыть Центр активности</UiButton>
            <UiButton variant="ghost" @click="open = false">Закрыть</UiButton>
          </template>
        </UiEmptyState>
      </template>
    </div>
  </UiSheet>
</template>

<style scoped>
.report {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.report__subject {
  overflow-wrap: anywhere;
}

.report__note {
  color: var(--text-3);
}

.report__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}
</style>
