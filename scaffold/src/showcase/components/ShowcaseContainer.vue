<template>
  <div class="showcase-container"><slot /></div>
</template>

<style scoped>
.showcase-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 max(var(--s-4), env(safe-area-inset-right)) 0 max(var(--s-4), env(safe-area-inset-left));
}
</style>
