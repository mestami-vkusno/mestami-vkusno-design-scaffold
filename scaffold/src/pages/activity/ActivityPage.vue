<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { UiBadge, UiBanner, UiButton, UiEmptyState, UiIcon, UiIconButton, UiListRow, UiSkeleton, UiSurface, UiSwitch, UiTabs, UiText } from '@/design-system'
import type { IconName, UiBadgeVariant } from '@/design-system'
import { PhotoAvatar } from '@/features'
import { formatAgo } from '@/mocks/format'
import { daysFromToday, dayPart } from '@/mocks/time'
import { getVenue } from '@/mocks/selectors/places'
import { getAuthor } from '@/mocks/selectors/social'
import type { AppNotification, NotificationKind, NotificationTab, NotificationTarget } from '@/mocks/types'
import MeScreen from '@/pages/me/components/MeScreen.vue'
import { useActivity } from '@/state/activity'

/*
  AC1 «Центр активности» (§19.1, §21.4, §11.1, §25, `/activity`): вкладки «Все / Активность / Обновления / Системные», уведомления сгруппированы
  по дате («Сегодня», «Вчера», «Ранее»). Тап ведёт на объект: публикацию, профиль, заведение, событие, `/premium`. Системные — модерация,
  результат жалобы (J12), безопасность, платежи и перенос или отмена сохранённого события (J5, `Перенесено` / `Отменено` бейджем).
  Гость видит приглашение войти. Точка «прочитано» исчезает без перехода, каскада строк нет: список длинный и часто открывается.
*/

type Tab = NotificationTab | 'all'

const TAB_LABEL: Record<Tab, string> = { all: 'Все', activity: 'Активность', updates: 'Обновления', system: 'Системные' }
const TAB_ORDER: readonly Tab[] = ['all', 'activity', 'updates', 'system']
const EMPTY_TEXT: Record<Tab, string> = {
  all: 'Пока ничего нового',
  activity: 'Ответы и подписчики появятся здесь',
  updates: 'Обновления заведений, на которые вы подписаны',
  system: 'Сообщения сервиса о модерации, платежах и событиях',
}

const ICON: Record<NotificationKind, IconName> = {
  new_follower: 'user',
  likes: 'heart',
  comment: 'comment',
  reply: 'comment',
  venue_update: 'pin',
  event_relevant: 'calendar',
  event_cancelled: 'calendar',
  event_rescheduled: 'calendar',
  moderation: 'shield',
  complaint_result: 'flag',
  security: 'lock',
  payment: 'crown',
}

const activity = useActivity()
const tab = ref<Tab>('all')
const onlyUnread = ref(false)

// Короткая загрузка: на первый показ рисуем скелет (§26.1), дальше список сразу.
const loading = ref(true)
onMounted(() => window.setTimeout(() => void (loading.value = false), 350))

// Нет сети (`offline_cached`): показываем сохранённые уведомления с баннером.
const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const syncOnline = (): void => void (online.value = navigator.onLine)
onMounted(() => {
  window.addEventListener('online', syncOnline)
  window.addEventListener('offline', syncOnline)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', syncOnline)
  window.removeEventListener('offline', syncOnline)
})

const tabs = computed(() => TAB_ORDER.map((id) => ({ id, label: TAB_LABEL[id], dot: id !== 'all' && activity.unreadCount(id) > 0 })))
const items = computed(() => activity.inTab(tab.value).filter((item) => !onlyUnread.value || !item.read))
const hasUnread = computed(() => activity.unreadCount('all') > 0)

interface Group {
  key: string
  label: string
  items: readonly AppNotification[]
}

function groupKey(item: AppNotification): 'today' | 'yesterday' | 'earlier' {
  const diff = daysFromToday(dayPart(item.at))
  if (diff >= 0) return 'today'
  return diff === -1 ? 'yesterday' : 'earlier'
}

const groups = computed<Group[]>(() => {
  const labels = { today: 'Сегодня', yesterday: 'Вчера', earlier: 'Ранее' } as const
  return (['today', 'yesterday', 'earlier'] as const).flatMap((key) => {
    const list = items.value.filter((item) => groupKey(item) === key)
    return list.length === 0 ? [] : [{ key, label: labels[key], items: list }]
  })
})

function hrefOf(target: NotificationTarget | undefined, kind: NotificationKind): string | undefined {
  if (kind === 'payment') return '/premium'
  if (target === undefined) return undefined
  if (target.kind === 'author') {
    const author = getAuthor(target.id)
    return author === undefined ? undefined : `/u/${author.username}`
  }
  return `/${target.kind}/${target.id}`
}

function actor(item: AppNotification) {
  const id = item.actorIds?.[0]
  return id === undefined ? undefined : getAuthor(id)
}

function venuePhoto(item: AppNotification) {
  return item.target?.kind === 'venue' ? getVenue(item.target.id)?.gallery[0] : undefined
}

function badge(item: AppNotification): { label: string; variant: UiBadgeVariant } | undefined {
  if (item.kind === 'event_rescheduled') return { label: 'Перенесено', variant: 'warning' }
  if (item.kind === 'event_cancelled') return { label: 'Отменено', variant: 'danger' }
  return undefined
}
</script>

<template>
  <MeScreen title="Активность" guest-text="Войдите, чтобы видеть ответы, подписчиков и обновления заведений." back-href="/" back-label="Назад" width="wide">
    <template #actions="{ desktop }">
      <UiButton v-if="hasUnread" variant="ghost" size="sm" @click="activity.markAllRead()">Прочитать всё</UiButton>
      <UiIconButton v-if="!desktop" icon="settings" label="Настройки уведомлений" variant="plain" href="/settings#notifications" />
    </template>

    <div class="activity">
      <div class="activity__main">
        <UiTabs v-model="tab" :items="tabs" label="Раздел уведомлений" />

        <UiBanner v-if="!online" variant="warning" icon="wifi-off">Нет сети. Показаны сохранённые уведомления.</UiBanner>

        <div v-if="loading" class="activity__skeleton" role="status" aria-busy="true" aria-label="Загрузка уведомлений">
          <div v-for="row in 6" :key="row" class="activity__skeleton-row">
            <UiSkeleton variant="circle" :size="40" />
            <UiSkeleton variant="text" :lines="2" :height="12" />
          </div>
        </div>

        <UiEmptyState v-else-if="groups.length === 0" :title="onlyUnread ? 'Непрочитанных нет' : EMPTY_TEXT[tab]" :description="onlyUnread ? 'Выключите фильтр, чтобы увидеть все уведомления.' : undefined" />

        <template v-else>
        <section v-for="group in groups" :key="group.key" class="activity__group" :aria-label="group.label">
          <UiText variant="overline" class="activity__date">{{ group.label }}</UiText>
          <UiSurface as="ul" variant="panel" class="activity__list">
            <li v-for="item in group.items" :key="item.id">
              <UiListRow :title="item.title" :description="item.body" :href="hrefOf(item.target, item.kind)" divider :chevron="false" @click="activity.markRead(item.id)">
                <template #leading>
                  <PhotoAvatar v-if="actor(item)" :photo="actor(item)!.avatar" :name="actor(item)!.displayName" size="sm" decorative />
                  <span v-else-if="venuePhoto(item)" class="activity__thumb"><PhotoAvatar :photo="venuePhoto(item)!" name="" size="sm" shape="rounded" decorative /></span>
                  <span v-else class="activity__icon"><UiIcon :name="ICON[item.kind]" :size="18" /></span>
                </template>
                <template #trailing>
                  <span class="activity__trailing">
                    <UiBadge v-if="badge(item)" :variant="badge(item)!.variant">{{ badge(item)!.label }}</UiBadge>
                    <UiText variant="caption" class="activity__time">{{ formatAgo(item.at) }}</UiText>
                    <UiBadge v-if="!item.read" dot variant="accent" label="Не прочитано" />
                  </span>
                </template>
              </UiListRow>
            </li>
          </UiSurface>
        </section>
        </template>
      </div>

      <aside class="activity__side" aria-label="Фильтр и настройки">
        <UiSurface variant="panel" class="activity__panel">
          <UiText variant="h3">Настройки уведомлений</UiText>
          <UiButton variant="outline" size="sm" href="/settings#notifications">Открыть настройки</UiButton>
          <UiSwitch v-model="onlyUnread">Только непрочитанные</UiSwitch>
        </UiSurface>
      </aside>
    </div>
  </MeScreen>
</template>

<style scoped>
.activity {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  align-items: start;
}

.activity__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.activity__side {
  display: none;
}

.activity__group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
  content-visibility: auto;
  contain-intrinsic-size: auto 240px;
}

.activity__date {
  color: var(--text-3);
}

.activity__list {
  margin: 0;
  padding: var(--s-1);
  list-style: none;
}

.activity__list :deep(.ui-list-row--divider) {
  align-items: flex-start;
}

.activity__list li:last-child :deep(.ui-list-row--divider) {
  border-bottom: 0;
}

.activity__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--accent-fg);
}

.activity__thumb {
  display: inline-flex;
}

.activity__trailing {
  display: grid;
  justify-items: end;
  gap: var(--s-1);
}

.activity__time {
  color: var(--text-3);
  white-space: nowrap;
}

.activity__skeleton {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.activity__skeleton-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--s-3);
}

.activity__panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--s-3);
}

@media (min-width: 900px) {
  .activity {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: var(--s-6);
  }

  .activity__side {
    display: block;
    position: sticky;
    top: calc(56px + var(--s-4));
  }
}
</style>
