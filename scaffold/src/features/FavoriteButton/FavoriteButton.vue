<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { EASE, UiButton, UiIconButton, cubicBezierCss, useMotion } from '@/design-system'
import { useLibrary } from '@/state/useLibrary'
import { FEATURE_LABELS } from '../labels'
import type { FavoriteButtonProps } from './types'

const props = withDefaults(defineProps<FavoriteButtonProps>(), { variant: 'overlay', size: 'sm' })

/*
  Гость: нажатие ведёт на `/auth` с отложенным действием, состояние не меняется.
  Вошедший: состояние библиотеки общее и синхронное, поэтому кнопка переключается сразу (оптимистично),
  а тост об итоге показывает сама библиотека.
*/
const library = useLibrary()
const active = computed(() => library.isFavorite(props.venueId))
const label = computed(() => (props.subject ? `${FEATURE_LABELS.favorite}: ${props.subject}` : FEATURE_LABELS.favorite))

const iconButton = useTemplateRef<InstanceType<typeof UiIconButton>>('icon-button')
const { duration, isReduced } = useMotion()

function toggle(): void {
  library.toggleFavorite(props.venueId, props.origin)
}

// «Подпрыгивание» сердца только при включении, при уменьшенном движении его нет.
watch(active, (on) => {
  const element = iconButton.value?.$el as HTMLElement | undefined
  if (!on || element === undefined || isReduced.value) return
  element.animate({ transform: ['scale(1)', 'scale(1.3)', 'scale(1)'] }, { duration: duration(0.35) * 1000, easing: cubicBezierCss(EASE.out) })
})
</script>

<template>
  <UiButton v-if="variant === 'button'" variant="outline" :icon-left="'heart'" :aria-pressed="active" @click="toggle">
    {{ active ? FEATURE_LABELS.favoriteOn : FEATURE_LABELS.favorite }}<span v-if="subject" class="fx-sr-only">: {{ subject }}</span>
  </UiButton>
  <UiIconButton v-else ref="icon-button" icon="heart" :variant="variant" :size="size" :label="label" :pressed="active" @click="toggle" />
</template>
