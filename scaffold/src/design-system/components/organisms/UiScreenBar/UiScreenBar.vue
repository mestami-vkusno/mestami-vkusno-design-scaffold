<script setup lang="ts">
import UiIconButton from '../../atoms/UiIconButton/UiIconButton.vue'
import type { UiScreenBarProps } from './types'

withDefaults(defineProps<UiScreenBarProps>(), { backLabel: 'Назад', headingLevel: 1, sticky: true })
defineSlots<{
  /** До двух иконочных действий справа: `UiIconButton variant="plain"` с подписью. */
  actions?(): unknown
}>()
const emit = defineEmits<{ back: [] }>()
</script>

<!-- Верх экранов второго уровня: назад, заголовок, до двух действий. Высота 56 px плюс safe-area; в потоке с клавиатурой остаётся без нижней панели. -->
<template>
  <header class="ui-screen-bar" :class="{ 'ui-screen-bar--sticky': sticky }" :aria-label="label">
    <div class="ui-screen-bar__inner">
      <UiIconButton v-if="!hideBack" class="ui-screen-bar__back" icon="arrow-l" variant="plain" :label="backLabel" :href="backHref" @click="emit('back')" />
      <component :is="`h${headingLevel}`" class="ui-screen-bar__title" :class="{ 'ui-screen-bar__title--no-back': hideBack }">{{ title }}</component>
      <div v-if="$slots.actions" class="ui-screen-bar__actions"><slot name="actions" /></div>
    </div>
  </header>
</template>

<style scoped>
.ui-screen-bar {
  padding: env(safe-area-inset-top) max(var(--s-2), env(safe-area-inset-right)) 0 max(var(--s-2), env(safe-area-inset-left));
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.ui-screen-bar--sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

.ui-screen-bar__inner {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  min-height: 56px;
}

.ui-screen-bar__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.ui-screen-bar__title--no-back {
  padding-inline-start: var(--s-2);
}

.ui-screen-bar__actions {
  display: flex;
  flex: none;
  align-items: center;
}
</style>
