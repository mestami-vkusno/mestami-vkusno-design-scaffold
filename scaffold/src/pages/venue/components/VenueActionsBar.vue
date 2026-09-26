<script setup lang="ts">
import { computed } from 'vue'
import { UiButton } from '@/design-system'
import type { Venue } from '@/mocks/types'
import { isOperational } from '@/mocks/selectors/places'
import { FavoriteButton, FollowButton } from '@/features/actions'
import { ShareButton } from '@/features'
import { routeUrl, telHref } from '../helpers'

const props = defineProps<{ venue: Venue }>()

/*
  Операционные действия отключаются по смыслу (§9.3, §9.5): у заведения, которое сейчас не принимает гостей
  («закрыто навсегда», «временно закрыто», «приостановлено», «скоро открытие»), маршрут, звонок, сайт и бронирование
  недоступны — статус уже объяснён рядом (заголовок, баннер). Клик по любой из них не считается фактом визита,
  звонка или брони — они обычные внешние ссылки.
*/
const operational = computed(() => isOperational(props.venue))
const origin = { sourceSurface: 'venue' as const }
</script>

<template>
  <div class="venue-actions">
    <FavoriteButton :venue-id="venue.id" :subject="venue.name" variant="button" :origin="origin" />
    <FollowButton kind="venue" :id="venue.id" :name="venue.name" :origin="origin" />
    <ShareButton :target="{ kind: 'venue', id: venue.id, title: venue.name, href: `/venue/${venue.id}` }" />

    <UiButton
      v-if="venue.address"
      variant="outline"
      icon-left="pin"
      :href="routeUrl(venue)"
      :disabled="!operational"
      target="_blank"
      rel="noopener noreferrer"
    >
      Маршрут
    </UiButton>
    <UiButton v-if="venue.phone" variant="outline" :href="telHref(venue.phone)" :disabled="!operational">
      Позвонить
    </UiButton>
    <UiButton
      v-if="venue.website"
      variant="outline"
      icon-left="external"
      :href="venue.website"
      :disabled="!operational"
      target="_blank"
      rel="noopener noreferrer"
    >
      Сайт
    </UiButton>
    <UiButton
      v-if="venue.bookingUrl"
      variant="outline"
      icon-left="external"
      :href="venue.bookingUrl"
      :disabled="!operational"
      target="_blank"
      rel="noopener noreferrer"
    >
      Забронировать
    </UiButton>
  </div>
</template>

<style scoped>
.venue-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
