<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiIcon, UiListRow, UiText, useToast } from '@/design-system'
import { useSettings } from '@/state/settings'
import type { NotificationCategory } from '@/state/settings'
import SettingsGroup from './SettingsGroup.vue'

/*
  ST1 · Уведомления (§19.2, §19.3, §20А): пять крупных категорий, а не десятки переключателей. «Системные» (безопасность, платежи, модерация)
  не отключаются, у них вместо переключателя замок. «Рекомендации и маркетинг» — точка отзыва согласия на рекламу (§20А): выключение отзывает
  его, пояснение обязательно. Каналы (§19.2) отдельными переключателями не показываем; для уведомлений на устройство — одна строка,
  системное разрешение браузера запрашивается только по нажатию (assumption, вопрос 23 в `screens-without-reference.md`).
*/

const settings = useSettings()
const { show } = useToast()

interface Category {
  id: NotificationCategory
  title: string
  description: string
}

const CATEGORIES: readonly Category[] = [
  { id: 'social', title: 'Социальные', description: 'Новые подписчики, «нравится», комментарии и ответы.' },
  { id: 'venueUpdates', title: 'Обновления заведений', description: 'Новое от заведений, на которые вы подписаны.' },
  { id: 'events', title: 'События', description: 'События в любимых местах и рядом с вами.' },
  { id: 'recommendationsAndMarketing', title: 'Рекомендации и маркетинг', description: 'Подборки и предложения. Выключение отзывает согласие на рекламные сообщения.' },
]

const data = computed(() => settings.settings.value)

function onToggle(id: NotificationCategory, value: boolean | undefined): void {
  const on = value === true
  settings.setNotification(id, on)
  show({ text: id === 'recommendationsAndMarketing' && !on ? 'Согласие на рекламные сообщения отозвано' : 'Сохранено', variant: 'success' })
}

// Уведомления на устройство: только по нажатию, отказ не ломает остальное.
const permission = ref<NotificationPermission | 'unsupported'>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)

async function askPermission(): Promise<void> {
  if (typeof Notification === 'undefined') return
  try {
    permission.value = await Notification.requestPermission()
  } catch {
    permission.value = 'denied'
  }
  show({ text: permission.value === 'granted' ? 'Уведомления на устройстве включены' : 'Уведомления на устройстве не включены', variant: permission.value === 'granted' ? 'success' : 'default' })
}
</script>

<template>
  <SettingsGroup id="notifications" title="Уведомления">
    <UiListRow v-for="item in CATEGORIES" :key="item.id" :title="item.title" :description="item.description" :toggle="data.notifications[item.id]" @update:toggle="onToggle(item.id, $event)" />
    <UiListRow title="Системные" description="Безопасность, платежи и модерация приходят всегда.">
      <template #trailing><span class="settings-notifications__always"><UiIcon name="lock" :size="16" />всегда</span></template>
    </UiListRow>
    <div class="settings-notifications__device">
      <div class="settings-notifications__device-text">
        <span class="settings-notifications__title">Уведомления на устройстве</span>
        <UiText variant="caption" class="settings-notifications__caption">
          {{ permission === 'granted' ? 'Включены в браузере.' : permission === 'denied' ? 'Запрещены в настройках браузера.' : permission === 'unsupported' ? 'Этот браузер их не поддерживает.' : 'Браузер спросит разрешение только после нажатия.' }}
        </UiText>
      </div>
      <UiButton v-if="permission === 'default'" size="sm" variant="outline" @click="askPermission">Разрешить</UiButton>
    </div>
  </SettingsGroup>
</template>

<style scoped>
.settings-notifications__always {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  color: var(--text-3);
  font-size: 13px;
}

.settings-notifications__device {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-3);
}

.settings-notifications__device-text {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px;
}

.settings-notifications__title {
  font-weight: 500;
}

.settings-notifications__caption {
  color: var(--text-3);
}
</style>
