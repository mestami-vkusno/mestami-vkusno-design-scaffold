<script setup lang="ts">
import { computed } from 'vue'
import { UiBanner } from '@/design-system'
import type { UiBannerVariant } from '@/design-system'
import { VENUE_STATUS_LABEL } from '@/mocks/dictionaries'
import { formatDate } from '@/mocks/format'
import type { Venue } from '@/mocks/types'

const props = defineProps<{ venue: Venue }>()

const variant = computed<UiBannerVariant>(() => {
  switch (props.venue.status) {
    case 'closed_permanently':
      return 'danger'
    case 'temporarily_closed':
    case 'suspended':
      return 'warning'
    case 'opening_soon':
      return 'info'
    case 'published':
      return 'info'
  }
})

const text = computed(() => {
  if (props.venue.status === 'opening_soon' && props.venue.opensOn) return `Ожидаем открытие ${formatDate(props.venue.opensOn)}. Маршрут, звонок, сайт и бронирование появятся ближе к открытию.`
  if (props.venue.status === 'closed_permanently') return 'Страница сохранена по прямой ссылке. Операционные действия недоступны.'
  return props.venue.statusNote ?? 'Операционные действия сейчас недоступны.'
})
</script>

<template>
  <UiBanner v-if="venue.status !== 'published'" :variant="variant" :title="VENUE_STATUS_LABEL[venue.status]">
    {{ text }}
  </UiBanner>
</template>
