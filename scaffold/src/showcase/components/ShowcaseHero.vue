<script setup lang="ts">
import { UiAccentText, UiRouteMotif, UiText } from '@/design-system'
import ShowcaseContainer from './ShowcaseContainer.vue'
</script>

<template>
  <div class="showcase-hero">
    <ShowcaseContainer>
      <UiText variant="overline" class="showcase-hero__overline">Каркас дизайна · версия 0.1</UiText>
      <h1 class="showcase-hero__title">Дизайн-система<br /><UiAccentText>Местами вкусно</UiAccentText></h1>
      <p class="showcase-hero__lead">Токены, типографика и базовые компоненты. Без контекста приложения: только нейтральные подписи, чтобы видеть форму, цвет и состояния.</p>
    </ShowcaseContainer>
    <UiRouteMotif class="showcase-hero__route" :width="520" />
  </div>
</template>

<style scoped>
.showcase-hero {
  position: relative;
  overflow: hidden;
  padding: var(--s-16) 0 var(--s-10);
  border-bottom: 1px solid var(--border);
}

.showcase-hero__overline {
  margin-bottom: 12px;
}

.showcase-hero__title {
  margin: 0 0 var(--s-4);
  font-size: clamp(36px, 6vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.showcase-hero__lead {
  max-width: 640px;
  margin: 0;
  color: var(--text-2);
  font-size: 18px;
}

.showcase-hero__route {
  position: absolute;
  right: 0;
  top: 10px;
  width: min(520px, 60vw);
  opacity: 0.9;
  pointer-events: none;
}

@media (max-width: 720px) {
  .showcase-hero {
    padding: var(--s-10) 0 var(--s-8);
  }

  .showcase-hero__lead {
    font-size: 16px;
  }

  .showcase-hero__route {
    display: none;
  }
}
</style>
