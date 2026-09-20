<script setup lang="ts">
import ShowcaseContainer from './ShowcaseContainer.vue'

defineProps<{ id: string; title: string; lead?: string }>()
defineSlots<{ default(): unknown; lead?(): unknown }>()
</script>

<template>
  <section :id="id" class="showcase-section">
    <ShowcaseContainer>
      <h2 class="showcase-section__title">{{ title }}</h2>
      <p v-if="lead || $slots.lead" class="showcase-section__lead"><slot name="lead">{{ lead }}</slot></p>
      <slot />
    </ShowcaseContainer>
  </section>
</template>

<style scoped>
.showcase-section {
  padding: var(--s-12) 0;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: 104px;
}

.showcase-section__title {
  margin: 0 0 var(--s-2);
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  font-weight: 700;
}

.showcase-section__lead {
  max-width: 720px;
  margin: 0 0 var(--s-8);
  color: var(--text-2);
}

@media (max-width: 720px) {
  .showcase-section {
    padding: var(--s-8) 0;
  }

  .showcase-section__title {
    font-size: 26px;
  }

  .showcase-section__lead {
    margin-bottom: var(--s-6);
  }
}
</style>
