<script setup lang="ts">
/*
  Список личных записей с «Добавлением и удалением в списке» (`screens-without-reference.md` §3.1): запись уходит прозрачностью и
  лёгким сжатием, соседи сдвигаются `transform` за `--dur-reflow` (FLIP на `<TransitionGroup>`, без библиотек). Ключ у детей обязателен.
  Колонка — одна запись в ряд, сетка — от `min` px на колонку; `minmax(0, …)` не даёт широкой записи раздуть страницу.
*/
withDefaults(defineProps<{ layout?: 'column' | 'grid'; min?: number }>(), { layout: 'column', min: 320 })
</script>

<template>
  <TransitionGroup tag="ul" name="me-list" class="me-list" :class="`me-list--${layout}`" :style="{ '--me-list-min': `${min}px` }">
    <slot />
  </TransitionGroup>
</template>

<style>
.me-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  contain: layout;
}

.me-list--grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--me-list-min)), 1fr));
}

.me-list > * {
  min-width: 0;
}

.me-list-enter-active,
.me-list-leave-active {
  transition:
    opacity var(--dur-modal) var(--ease-out),
    transform var(--dur-modal) var(--ease-out);
}

.me-list--column > .me-list-leave-active {
  position: absolute;
  inset-inline: 0;
}

.me-list-enter-from {
  opacity: 0;
  transform: translateY(calc(-8px * var(--motion-distance)));
}

.me-list-leave-to {
  opacity: 0;
  transform: scale(calc(1 - 0.04 * var(--motion-distance)));
}

.me-list-move {
  transition: transform var(--dur-reflow) var(--ease-out);
}
</style>
