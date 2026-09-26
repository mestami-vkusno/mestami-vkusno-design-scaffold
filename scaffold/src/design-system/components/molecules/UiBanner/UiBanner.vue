<script setup lang="ts">
import UiIcon from '../../atoms/UiIcon/UiIcon.vue'
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import type { IconName } from '../../../icons'
import type { UiBannerProps, UiBannerVariant } from './types'

const DEFAULT_ICON: Record<UiBannerVariant, IconName> = { info: 'info', success: 'check', warning: 'alert', danger: 'alert' }

withDefaults(defineProps<UiBannerProps>(), { variant: 'info', dismissLabel: 'Закрыть' })
defineSlots<{
  /** Текст баннера. */
  default?(): unknown
  /** Действие справа или под текстом: `UiButton size="sm"` «Повторить». */
  action?(): unknown
}>()
const emit = defineEmits<{ dismiss: [] }>()
</script>

<!-- Ошибка объявляется сразу (`alert`), остальное — вежливо (`status`). Появление и уход — прозрачность и сдвиг на токенах тоста. -->
<template>
  <Transition :css="animated" name="ui-banner" appear>
    <div class="ui-banner" :class="`ui-banner--${variant}`" :role="variant === 'danger' ? 'alert' : 'status'" @keydown.esc="dismissible && emit('dismiss')">
      <UiIcon class="ui-banner__icon" :name="icon ?? DEFAULT_ICON[variant]" :size="22" />
      <div class="ui-banner__body">
        <b v-if="title" class="ui-banner__title">{{ title }}</b>
        <span class="ui-banner__text"><slot /></span>
      </div>
      <div v-if="$slots.action" class="ui-banner__action"><slot name="action" /></div>
      <UiIconButton v-if="dismissible" class="ui-banner__close" icon="close" variant="plain" size="sm" :label="dismissLabel" @click="emit('dismiss')" />
    </div>
  </Transition>
</template>

<style scoped>
.ui-banner {
  --tone: var(--accent-fg);
  --tone-bg: var(--surface);
  --tone-line: var(--border-strong);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--tone-bg);
  border: 1px solid var(--tone-line);
  border-radius: var(--r-md);
  color: var(--text);
  font-size: 14px;
  line-height: 1.45;
}

.ui-banner--success {
  --tone: var(--success);
  --tone-bg: color-mix(in srgb, var(--success) 12%, var(--surface));
  --tone-line: color-mix(in srgb, var(--success) 55%, transparent);
}

.ui-banner--warning {
  --tone: var(--warning);
  --tone-bg: color-mix(in srgb, var(--warning) 12%, var(--surface));
  --tone-line: color-mix(in srgb, var(--warning) 55%, transparent);
}

.ui-banner--danger {
  --tone: var(--danger);
  --tone-bg: color-mix(in srgb, var(--danger) 12%, var(--surface));
  --tone-line: color-mix(in srgb, var(--danger) 55%, transparent);
}

.ui-banner__icon {
  align-self: flex-start;
  margin-top: 1px;
  color: var(--tone);
}

.ui-banner__body {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ui-banner__title {
  font-weight: 600;
}

.ui-banner__text {
  color: var(--text-2);
}

.ui-banner__title + .ui-banner__text,
.ui-banner__body > .ui-banner__text:only-child {
  color: var(--text);
}

.ui-banner__action {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--s-2);
}

.ui-banner__close {
  flex: none;
  margin: -6px -8px -6px 0;
}

/* Появление и уход: прозрачность и небольшой сдвиг сверху, как у тоста; остальное решает --motion-distance. */
.ui-banner-enter-active,
.ui-banner-leave-active {
  transition:
    opacity var(--dur-toast) var(--ease-out),
    transform var(--dur-toast) var(--ease-out);
}

.ui-banner-enter-from,
.ui-banner-leave-to {
  opacity: 0;
  transform: translateY(calc(-12px * var(--motion-distance)));
}
</style>
