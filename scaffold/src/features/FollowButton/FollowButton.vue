<script setup lang="ts">
import { computed } from 'vue'
import { UiButton } from '@/design-system'
import { useLibrary } from '@/state/useLibrary'
import { FEATURE_LABELS } from '../labels'
import '../shared/base.css'
import type { FollowButtonProps } from './types'

const props = withDefaults(defineProps<FollowButtonProps>(), { size: 'md' })

const library = useLibrary()
const active = computed(() => (props.kind === 'author' ? library.isFollowingAuthor(props.id) : library.isFollowingVenue(props.id)))

function toggle(): void {
  if (props.kind === 'author') library.toggleFollowAuthor(props.id, props.origin)
  else library.toggleFollowVenue(props.id, props.origin)
}
</script>

<template>
  <UiButton :variant="active ? 'neutral' : 'outline'" :size="size" :block="block" :icon-left="active ? 'check' : undefined" :aria-pressed="active" @click="toggle">
    {{ active ? FEATURE_LABELS.following : FEATURE_LABELS.follow }}<span v-if="name" class="fx-sr-only"> {{ name }}</span>
  </UiButton>
</template>
