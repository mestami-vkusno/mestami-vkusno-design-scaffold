<script setup lang="ts">
import { UiScreenBar } from '@/design-system'

/*
  Рамка небольших редакторов (CR3, CR4): ScreenBar с закрытием и колонка по центру. На телефоне — во весь экран, на широком экране —
  колонка 560 px, как диалог по центру (у редакторов есть маршрут, поэтому это страница, а не оверлей: решение вопроса 18).
*/
defineProps<{ title: string }>()
defineSlots<{ default(): unknown; actions?(): unknown }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <main class="editor-frame">
    <UiScreenBar :title="title" back-label="Закрыть" @back="emit('close')">
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </UiScreenBar>
    <div class="editor-frame__column"><slot /></div>
  </main>
</template>

<style scoped>
.editor-frame {
  min-height: 100dvh;
  padding-bottom: var(--s-12);
}

.editor-frame__column {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  max-width: 560px;
  margin: 0 auto;
  padding: var(--s-4) max(var(--s-4), env(safe-area-inset-right)) 0 max(var(--s-4), env(safe-area-inset-left));
}

@media (min-width: 900px) {
  .editor-frame__column {
    padding-top: var(--s-8);
  }
}
</style>
