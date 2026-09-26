<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge } from '@/design-system'
import { EVENT_STATUS_LABEL, VENUE_STATUS_LABEL } from '@/mocks/dictionaries'
import { EVENT_STATUS_VARIANT, VENUE_STATUS_VARIANT, type StatusBadgeProps } from './types'

const props = defineProps<StatusBadgeProps>()

const view = computed(() => {
  if (props.venueStatus !== undefined) return { text: VENUE_STATUS_LABEL[props.venueStatus], variant: VENUE_STATUS_VARIANT[props.venueStatus] }
  if (props.eventStatus !== undefined) return { text: EVENT_STATUS_LABEL[props.eventStatus], variant: EVENT_STATUS_VARIANT[props.eventStatus] }
  return null
})
</script>

<template>
  <UiBadge v-if="view" :variant="view.variant" :pill="pill">{{ label ?? view.text }}</UiBadge>
</template>
