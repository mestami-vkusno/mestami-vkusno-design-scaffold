<script setup lang="ts">
import { UiIconButton, useToast } from '@/design-system'
import { FEATURE_LABELS } from '../labels'
import ActionButton from '../ActionButton/ActionButton.vue'
import { SHARE_EVENT, type ShareButtonProps, type ShareTarget } from './types'

const props = withDefaults(defineProps<ShareButtonProps>(), { variant: 'action', label: FEATURE_LABELS.share })
const emit = defineEmits<{ share: [target: ShareTarget] }>()
const { show } = useToast()

function absoluteUrl(target: ShareTarget): string {
  return new URL(target.href ?? window.location.pathname + window.location.search, window.location.origin).toString()
}

async function copyLink(target: ShareTarget): Promise<void> {
  try {
    await navigator.clipboard.writeText(absoluteUrl(target))
    show({ text: FEATURE_LABELS.linkCopied, variant: 'success' })
  } catch {
    show({ text: FEATURE_LABELS.linkCopyFailed, variant: 'danger' })
  }
}

function share(): void {
  emit('share', props.target)
  // Шторка «Поделиться» (0013) отменяет событие и берёт показ на себя; пока её нет, копируем ссылку.
  const handled = !window.dispatchEvent(new CustomEvent<ShareTarget>(SHARE_EVENT, { detail: props.target, cancelable: true }))
  if (!handled) void copyLink(props.target)
}
</script>

<template>
  <ActionButton v-if="variant === 'action'" icon="share" :label="`${label}: ${target.title}`" @click="share" />
  <UiIconButton v-else icon="share" :variant="variant" :label="`${label}: ${target.title}`" size="sm" @click="share" />
</template>
