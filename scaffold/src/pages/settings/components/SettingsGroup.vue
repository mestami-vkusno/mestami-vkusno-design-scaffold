<script setup lang="ts">
import { useId } from 'vue'
import { UiSurface, UiText } from '@/design-system'

/* Группа настроек (`screens-without-reference.md` §3.9): заголовок и плоская карточка со строками, без раскрывающихся блоков. `id` — якорь `/settings#…`. */
defineProps<{ id: string; title: string }>()
const headingId = useId()
</script>

<template>
  <section :id="id" class="settings-group" :aria-labelledby="headingId">
    <UiText :id="headingId" variant="h3" as="h2">{{ title }}</UiText>
    <UiSurface variant="card" class="settings-group__card"><slot /></UiSurface>
  </section>
</template>

<style scoped>
.settings-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  scroll-margin-top: calc(56px + var(--s-4));
}

.settings-group__card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding: var(--s-1);
}

.settings-group__card > :deep(*:not(:last-child)) {
  border-bottom: 1px solid var(--border);
}
</style>
