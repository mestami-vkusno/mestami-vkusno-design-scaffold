<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiBadge, UiListRow, UiText } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { DATA_REQUEST_LABEL, useSettings } from '@/state/settings'
import DataRequestSheet from './DataRequestSheet.vue'
import SettingsGroup from './SettingsGroup.vue'

/* ST1 · Персональные данные (§20А): юридический запрос субъекта ПД (не удаление аккаунта), «Удалить мой контент» (Дневник и черновики), документы (X3). */

const settings = useSettings()
const open = ref(false)
const requests = computed(() => settings.settings.value.dataRequests)
</script>

<template>
  <SettingsGroup id="data" title="Персональные данные">
    <UiListRow title="Запрос по персональным данным" description="Получить сведения, исправить данные, прекратить распространение или отозвать согласие. Это не удаление аккаунта." @click="open = true" />
    <div v-if="requests.length > 0" class="settings-data__requests" aria-label="Отправленные запросы">
      <div v-for="request in requests" :key="request.id" class="settings-data__request">
        <UiText variant="caption">{{ DATA_REQUEST_LABEL[request.type] }} · {{ formatDate(request.createdAt) }}</UiText>
        <UiBadge variant="neutral">Принят</UiBadge>
      </div>
    </div>
    <UiListRow title="Удалить мой контент" description="Записи Дневника и черновики можно удалить по одной." href="/me/diary" />
    <UiListRow title="Документы" href="/legal/user-agreement" />
    <DataRequestSheet v-model:open="open" />
  </SettingsGroup>
</template>

<style scoped>
.settings-data__requests {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
  padding: var(--s-2) var(--s-3);
}

.settings-data__request {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
}
</style>
