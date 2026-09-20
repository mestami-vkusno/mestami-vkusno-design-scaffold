<script setup lang="ts">
defineProps<{ first?: boolean }>()
</script>

<template>
  <h3 class="showcase-subheading" :class="{ 'showcase-subheading--first': first }"><slot /></h3>
</template>

<style scoped>
.showcase-subheading {
  margin: var(--s-8) 0 var(--s-4);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  font-weight: 600;
  scroll-margin-top: 104px;
}

.showcase-subheading--first {
  margin-top: 0;
}

@media (max-width: 720px) {
  .showcase-subheading {
    margin: var(--s-6) 0 var(--s-3);
  }

  .showcase-subheading--first {
    margin-top: 0;
  }
}
</style>
