<script setup lang="ts">
import { computed } from 'vue'
import { UiIconButton } from '@/design-system'
import { useLibrary } from '@/state/useLibrary'
import ActionButton from '../ActionButton/ActionButton.vue'
import { FEATURE_LABELS } from '../labels'
import type { SaveButtonProps } from './types'

const props = withDefaults(defineProps<SaveButtonProps>(), { variant: 'action' })

const library = useLibrary()
const saved = computed(() => {
  if (props.kind === 'post') return library.isPostSaved(props.id)
  return props.kind === 'collection' ? library.isCollectionSaved(props.id) : library.isEventSaved(props.id)
})
const label = computed(() => (props.subject ? `${FEATURE_LABELS.save}: ${props.subject}` : FEATURE_LABELS.save))

function toggle(): void {
  if (props.kind === 'post') library.toggleSavePost(props.id, props.origin)
  else if (props.kind === 'collection') library.toggleSaveCollection(props.id, props.origin)
  else library.toggleSaveEvent(props.id, props.origin)
}
</script>

<template>
  <ActionButton v-if="variant === 'action'" icon="bookmark" :label="label" :pressed="saved" @click="toggle" />
  <UiIconButton v-else icon="bookmark" :variant="variant" size="sm" :label="label" :pressed="saved" @click="toggle" />
</template>
