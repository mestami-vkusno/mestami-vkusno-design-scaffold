<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiBadge, UiButton, UiListRow, UiText, useToast } from '@/design-system'
import { formatDate } from '@/mocks/format'
import { openProfileEdit } from '@/overlays/useOverlays'
import { useViewer } from '@/shell/composables/useViewer'
import { usePremium } from '@/state/usePremium'
import { useSettings } from '@/state/settings'
import DeleteAccountSheet from './DeleteAccountSheet.vue'
import EmailChangeSheet from './EmailChangeSheet.vue'
import SettingsGroup from './SettingsGroup.vue'

/*
  ST1 · Аккаунт (§5.7): email (смена через код на новый адрес), профиль (форма A3), Премиум (PR1), выход без подтверждения (assumption),
  запрос на удаление аккаунта (`--danger`, подтверждение и учёт активного Премиум).
*/

const settings = useSettings()
const premium = usePremium()
const router = useRouter()
const { show } = useToast()
const { signOut } = useViewer()

const emailOpen = ref(false)
const deleteOpen = ref(false)

const data = computed(() => settings.settings.value)
const premiumActive = computed(() => ['trial', 'active', 'grace', 'canceled_active'].includes(premium.phase.value))
const premiumValue = computed(() => (premiumActive.value && premium.activeUntil.value ? `Активен до ${formatDate(premium.activeUntil.value)}` : 'Не подключён'))

function onSignOut(): void {
  signOut()
  show({ text: 'Вы вышли' })
  void router.push('/')
}

function onDelete(): void {
  settings.requestAccountDeletion()
  show({ text: 'Запрос на удаление аккаунта отправлен', variant: 'success' })
}
</script>

<template>
  <SettingsGroup id="account" title="Аккаунт">
    <UiListRow title="Email" :description="data.email">
      <template #trailing>
        <span class="settings-account__email">
          <UiBadge v-if="data.pendingEmail" variant="warning">Ожидает подтверждения</UiBadge>
          <UiButton variant="ghost" size="sm" @click="emailOpen = true">Изменить</UiButton>
        </span>
      </template>
    </UiListRow>
    <UiListRow title="Профиль" description="Имя, @username, «О себе», видимость" @click="openProfileEdit()" />
    <UiListRow title="Премиум" href="/premium" :value="premiumValue" />
    <UiListRow title="Выйти" icon="logout" :chevron="false" @click="onSignOut" />
    <div v-if="data.deletionRequestedAt" class="settings-account__pending">
      <UiBadge variant="warning">Запрос на удаление отправлен</UiBadge>
      <UiText variant="caption" class="settings-account__hint">Аккаунт пока работает. Запрос можно отменить.</UiText>
      <UiButton size="sm" variant="outline" @click="settings.cancelAccountDeletion()">Отменить запрос</UiButton>
    </div>
    <UiListRow v-else title="Запрос на удаление аккаунта" danger :chevron="false" @click="deleteOpen = true" />

    <EmailChangeSheet v-model:open="emailOpen" />
    <DeleteAccountSheet v-model:open="deleteOpen" :premium-active="premiumActive" @confirm="onDelete" />
  </SettingsGroup>
</template>

<style scoped>
.settings-account__email {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--s-2);
}

.settings-account__pending {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-2);
  padding: var(--s-3);
}

.settings-account__hint {
  color: var(--text-3);
}
</style>
