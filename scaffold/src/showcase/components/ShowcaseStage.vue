<script setup lang="ts">
defineProps<{ flush?: boolean }>()
</script>

<template>
  <div class="showcase-stage" :class="{ 'showcase-stage--flush': flush }"><slot /></div>
</template>

<style scoped>
.showcase-stage {
  padding: var(--s-6);
  background: var(--bg);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-lg);
}

.showcase-stage--flush {
  padding: 0;
}

@media (max-width: 720px) {
  .showcase-stage:not(.showcase-stage--flush) {
    padding: var(--s-4);
  }
}
</style>
