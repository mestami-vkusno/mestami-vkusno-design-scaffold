<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiButton, UiCluster, UiRouteMotif, UiSearchInput, UiText } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'

const router = useRouter()

function search(query: string): void {
  const text = query.trim()
  void router.push({ path: '/search', query: text ? { q: text } : {} })
}
</script>

<!-- Страница 404 (X1): оболочка продукта остаётся, адрес не меняется. Референс — materials/design/not-found-404.png. -->
<template>
  <main class="not-found">
    <ShellContainer>
      <div class="not-found__hero">
        <div class="not-found__art" aria-hidden="true">
          <span class="not-found__code">404</span>
          <UiRouteMotif class="not-found__motif" :width="540" />
        </div>
        <div class="not-found__text">
          <UiText as="h1" variant="h2">Кажется, этого места здесь нет</UiText>
          <UiText variant="body-lg">Возможно, страница была перемещена или ссылка больше не работает.</UiText>
          <UiText variant="body-lg" class="not-found__accent">Но вкусные места никуда не делись.</UiText>
          <UiCluster>
            <UiButton href="/" size="lg">На главную</UiButton>
            <UiButton href="/search" size="lg" variant="outline">Открыть каталог</UiButton>
          </UiCluster>
        </div>
      </div>
      <section class="not-found__search" aria-labelledby="not-found-search">
        <UiText id="not-found-search" as="h2" variant="body-lg">Или найдите место</UiText>
        <UiSearchInput label="Поиск заведений" placeholder="Найти ресторан, кухню или блюдо…" @submit="search" />
      </section>
    </ShellContainer>
  </main>
</template>

<style scoped>
.not-found {
  padding-block: var(--s-8) var(--s-12);
}

.not-found__hero {
  display: grid;
  align-items: center;
  gap: var(--s-8);
}

.not-found__art {
  position: relative;
  display: grid;
  place-items: center;
  max-width: 540px;
}

/* Крупные цифры за маршрутом, приглушённые лаймом; по размеру подстраиваются под ширину экрана. */
.not-found__code {
  color: var(--lime-soft);
  font-size: clamp(120px, 38vw, 240px);
  font-weight: 800;
  line-height: 1;
}

.not-found__motif {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.not-found__text {
  display: grid;
  gap: var(--s-4);
  justify-items: start;
}

.not-found__accent {
  color: var(--accent-fg);
}

.not-found__search {
  display: grid;
  gap: var(--s-3);
  max-width: 640px;
  margin: var(--s-10) auto 0;
  text-align: center;
}

@media (min-width: 900px) {
  .not-found__hero {
    grid-template-columns: 1.1fr 1fr;
  }
}
</style>
