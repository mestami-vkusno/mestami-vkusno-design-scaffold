<script setup lang="ts">
import { UiIcon, UiLink } from '@/design-system'

defineProps<{
  /** На первом шаге («Закрыть») выход из потока закрывает его целиком; на следующих — обычный шаг назад. */
  variant: 'close' | 'back'
  label: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="auth-top-bar">
    <UiLink variant="muted" :icon-left="variant === 'close' ? 'close' : 'arrow-l'" href="#" @click.prevent="emit('action')">{{ label }}</UiLink>
    <span class="auth-top-bar__brand">
      <UiIcon name="pin" :size="16" />
      Местами вкусно
    </span>
  </div>
</template>

<style scoped>
.auth-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding-block: var(--s-2);
}

.auth-top-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-3);
  font-size: 13px;
}
</style>
