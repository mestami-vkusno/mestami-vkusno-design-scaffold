<script setup lang="ts">
defineProps<{ cityName: string }>()
</script>

<!-- §6.3: заведение другого города открывается по прямой ссылке без смены активного города — только ненавязчивая плашка. -->
<template>
  <p class="other-city-banner">
    <span class="other-city-banner__dot" aria-hidden="true" />
    Заведение из другого города: {{ cityName }}
  </p>
</template>

<style scoped>
.other-city-banner {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  padding: var(--s-2) var(--s-3);
  background: var(--surface-2);
  border-radius: var(--r-pill);
  color: var(--text-2);
  font-size: 13px;
  width: fit-content;
}

.other-city-banner__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-fg);
}
</style>
