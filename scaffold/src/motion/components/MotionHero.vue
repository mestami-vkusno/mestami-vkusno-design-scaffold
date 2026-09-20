<script setup lang="ts">
import { UiAccentText, UiText } from '@/design-system'
import ShowcaseContainer from '@/showcase/components/ShowcaseContainer.vue'
</script>

<template>
  <div class="motion-hero">
    <ShowcaseContainer>
      <UiText variant="overline" class="motion-hero__overline">Движение · версия 0.1</UiText>
      <h1 class="motion-hero__title">Анимации<br /><UiAccentText>Местами вкусно</UiAccentText></h1>
      <p class="motion-hero__lead">Каждая анимация здесь отвечает на три вопроса: как часто её видят, зачем она нужна и из чего собрана. Управляйте замедлением и режимом уменьшенного движения внизу экрана.</p>
      <ul class="motion-hero__rules">
        <li><b>Часто — почти незаметно.</b> То, что делают десятки раз в день, реагирует за 100–160 мс.</li>
        <li><b>Только transform и opacity.</b> Остальное запускает перерасчёт раскладки.</li>
        <li><b>Меньше, а не ноль.</b> При уменьшенном движении уходят смещения, прозрачность остаётся.</li>
      </ul>
    </ShowcaseContainer>
  </div>
</template>

<style scoped>
.motion-hero {
  padding: var(--s-16) 0 var(--s-10);
  border-bottom: 1px solid var(--border);
}

.motion-hero__overline {
  margin-bottom: 12px;
}

.motion-hero__title {
  margin: 0 0 var(--s-4);
  font-size: clamp(36px, 6vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.motion-hero__lead {
  max-width: 640px;
  margin: 0;
  color: var(--text-2);
  font-size: 18px;
}

.motion-hero__rules {
  display: grid;
  gap: var(--s-2);
  max-width: 640px;
  margin: var(--s-6) 0 0;
  padding: 0;
  list-style: none;
  color: var(--text-2);
  font-size: 14px;
}

.motion-hero__rules b {
  color: var(--text);
}

@media (max-width: 720px) {
  .motion-hero {
    padding: var(--s-10) 0 var(--s-8);
  }

  .motion-hero__lead {
    font-size: 16px;
  }
}
</style>
