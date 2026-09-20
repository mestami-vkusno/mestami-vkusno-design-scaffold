<template>
  <p class="showcase-note"><slot /></p>
</template>

<style scoped>
.showcase-note {
  margin: var(--s-6) 0 0;
  padding: var(--s-3) var(--s-4);
  border-left: 2px solid var(--lime);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  background: var(--lime-soft);
  color: var(--text-2);
  font-size: 14px;
}

.showcase-note :deep(b) {
  color: var(--text);
}

@media (max-width: 720px) {
  .showcase-note {
    font-size: 13.5px;
  }
}
</style>
