<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/** Скринридер не видит смены страницы в одностраничном приложении: сообщаем заголовок новой страницы. */
const route = useRoute()
const message = ref('')

watch(
  () => route.path,
  () => {
    message.value = document.title
  },
)
</script>

<template>
  <div class="route-announcer" role="status" aria-live="polite" aria-atomic="true">{{ message }}</div>
</template>

<style scoped>
.route-announcer {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
