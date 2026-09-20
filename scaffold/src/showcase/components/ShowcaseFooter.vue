<script setup lang="ts">
import ShowcaseContainer from './ShowcaseContainer.vue'
</script>

<template>
  <footer class="showcase-footer">
    <ShowcaseContainer>
      <p class="showcase-footer__text">
        Каркас дизайна «Местами вкусно» · версия 0.1 · токены — в <code>src/design-system/styles/tokens.css</code>. Логотип — текстовый макет, заменить оригинальным знаком.
      </p>
    </ShowcaseContainer>
  </footer>
</template>

<style scoped>
.showcase-footer {
  padding: var(--s-8) 0 var(--s-12);
}

.showcase-footer__text {
  margin: 0;
  color: var(--text-3);
  font-size: 12px;
}
</style>
