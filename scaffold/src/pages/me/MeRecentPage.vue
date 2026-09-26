<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiBadge, UiButton, UiEmptyState, UiSurface, UiText } from '@/design-system'
import { formatRelativeDay } from '@/mocks/format'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { getCollection } from '@/mocks/selectors/collections'
import { getEvent } from '@/mocks/selectors/events'
import { getMenuItem } from '@/mocks/selectors/menu'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import type { Photo, RecentlyViewed, RecentlyViewedKind } from '@/mocks/types'
import ConfirmSheet from '@/pages/create/components/ConfirmSheet.vue'
import { useLibrary } from '@/state/useLibrary'
import MeList from './components/MeList.vue'
import MeScreen from './components/MeScreen.vue'

/*
  M8 «Недавно просмотренное» (§18, §20.1 «управление историей», `/me/recent`): заведения, блюда, события и подборки, которые пользователь открывал,
  свежие сверху. «Очистить» — с подтверждением O12; объекты при этом не удаляются, только список. Историю можно чистить и в «Настройки → История».
*/

interface Row {
  key: string
  kind: RecentlyViewedKind
  title: string
  subtitle: string
  href: string
  photo?: Photo
  when: string
}

const KIND_LABEL: Record<RecentlyViewedKind, string> = { venue: 'Заведение', menu_item: 'Блюдо', event: 'Событие', collection: 'Подборка' }

const library = useLibrary()
const confirm = ref(false)

function resolve(item: RecentlyViewed): Row | null {
  const base = { key: `${item.kind}:${item.id}`, kind: item.kind, when: formatRelativeDay(item.viewedAt).toLowerCase() }
  if (item.kind === 'venue') {
    const venue = getVenue(item.id)
    return venue === undefined ? null : { ...base, title: venue.name, subtitle: venueLocationLabel(venue), href: `/venue/${venue.id}`, ...(venue.gallery[0] ? { photo: venue.gallery[0] } : {}) }
  }
  if (item.kind === 'event') {
    const event = getEvent(item.id)
    return event === undefined ? null : { ...base, title: event.title, subtitle: getVenue(event.venueId)?.name ?? '', href: `/event/${event.id}`, photo: event.photo }
  }
  if (item.kind === 'menu_item') {
    const dish = getMenuItem(item.id)
    if (dish === undefined) return null
    return { ...base, title: dish.name, subtitle: getVenue(dish.venueId)?.name ?? '', href: `/venue/${dish.venueId}/menu/${dish.id}`, ...(dish.photo ? { photo: dish.photo } : {}) }
  }
  const collection = getCollection(item.id)
  return collection === undefined ? null : { ...base, title: collection.title, subtitle: `Мест: ${collection.items.length}`, href: `/collection/${collection.id}`, photo: collection.cover }
}

const rows = computed(() => library.recentlyViewed.value.flatMap((item) => resolve(item) ?? []))
</script>

<template>
  <MeScreen title="Недавно просмотренное" guest-text="Войдите, чтобы видеть места, которые вы недавно смотрели." priv>
    <template #actions="{ desktop }">
      <UiButton v-if="rows.length > 0" variant="ghost" size="sm" :icon-left="desktop ? 'trash' : undefined" @click="confirm = true">Очистить</UiButton>
    </template>

    <UiEmptyState v-if="rows.length === 0" title="Здесь появятся места, которые вы смотрели" description="Откройте заведение, событие или подборку — они сохранятся в этом списке.">
      <template #actions><UiButton variant="outline" href="/search">Найти место</UiButton></template>
    </UiEmptyState>

    <MeList v-else layout="grid" :min="320">
      <li v-for="row in rows" :key="row.key">
        <UiSurface as="article" class="recent-row">
          <div v-if="row.photo" class="recent-row__thumb"><UiPhotoPlaceholder :photo="row.photo" ratio="4:3" decorative /></div>
          <a class="recent-row__text" :href="row.href">
            <span class="recent-row__title">{{ row.title }}</span>
            <UiText v-if="row.subtitle" variant="caption" class="recent-row__sub">{{ row.subtitle }}</UiText>
          </a>
          <div class="recent-row__meta">
            <UiBadge variant="neutral" pill>{{ KIND_LABEL[row.kind] }}</UiBadge>
            <UiText variant="caption" class="recent-row__sub">{{ row.when }}</UiText>
          </div>
        </UiSurface>
      </li>
    </MeList>

    <ConfirmSheet v-model:open="confirm" title="Очистить историю просмотров?" text="Список опустеет. Сами заведения, события и подборки не пострадают." confirm-label="Очистить" @confirm="library.clearRecentlyViewed()" />
  </MeScreen>
</template>

<style scoped>
.recent-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
  content-visibility: auto;
  contain-intrinsic-size: auto 80px;
}

.recent-row__thumb {
  width: 64px;
  overflow: hidden;
  border-radius: var(--r-md);
}

.recent-row__text {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px;
  color: inherit;
  text-decoration: none;
}

.recent-row__title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__sub {
  overflow: hidden;
  color: var(--text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row__meta {
  display: grid;
  justify-items: end;
  gap: 2px;
}
</style>
