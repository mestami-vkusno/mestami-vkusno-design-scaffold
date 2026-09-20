<script setup lang="ts">
defineProps<{ name: string; spec: string }>()
</script>

<template>
  <div class="showcase-type-row">
    <div class="showcase-type-row__meta">
      <b class="showcase-type-row__name">{{ name }}</b>
      {{ spec }}
    </div>
    <div><slot /></div>
  </div>
</template>

<style scoped>
.showcase-type-row {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: var(--s-6);
  align-items: baseline;
  padding: var(--s-5) 0;
  border-top: 1px solid var(--border);
}

.showcase-type-row:first-child {
  border-top: 0;
}

.showcase-type-row__meta {
  color: var(--text-3);
  font-size: 12.5px;
}

.showcase-type-row__name {
  display: block;
  margin-bottom: 2px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .showcase-type-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
