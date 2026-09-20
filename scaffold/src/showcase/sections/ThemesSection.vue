<script setup lang="ts">
import { UiGrid, UiSurface, UiText } from '@/design-system'
import ShowcaseNote from '../components/ShowcaseNote.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
import ShowcaseThemeDemo from '../components/ShowcaseThemeDemo.vue'
</script>

<template>
  <ShowcaseSection id="themes" title="Тёмная и светлая тема">
    <template #lead>
      Основная тема — тёмная (так в ТЗ). Светлая строится теми же токенами: меняются только значения, разметка и компоненты те же. Тема переключается атрибутом <code>data-theme="light"</code> на <code>&lt;html&gt;</code> или на любом блоке (см. <code>UiThemeScope</code>).
    </template>

    <UiGrid :min="300">
      <ShowcaseThemeDemo theme="dark" title="Тёмная" />
      <ShowcaseThemeDemo theme="light" title="Светлая" />
    </UiGrid>

    <ShowcaseSubheading>Как лайм работает в светлой теме</ShowcaseSubheading>
    <UiGrid :min="240">
      <UiSurface variant="panel">
        <b>Заливка остаётся лаймом.</b>
        <UiText class="showcase-themes__text">Кнопки, активные чипы, метка «Новое», пагинация, выбранный переключатель — лайм с чёрным текстом в обеих темах (16.5:1).</UiText>
      </UiSurface>
      <UiSurface variant="panel">
        <b>Вместо лайм-текста — маркер.</b>
        <UiText class="showcase-themes__text">Лайм на белом не читается (1.2:1), поэтому текст и иконки чёрные, а лайм стоит под ними: толстое подчёркивание у ссылок, линия под активной вкладкой, кружок под иконкой, маркер под акцентным словом.</UiText>
      </UiSurface>
      <UiSurface variant="panel">
        <b>Чёрное — второй цвет бренда.</b>
        <UiText class="showcase-themes__text">Второстепенная кнопка — чёрная заливка, контурная — чёрный контур, блок ИИ — тёмный остров с лаймом. Нейтрали серые, без бежевого и зелёного оттенка.</UiText>
      </UiSurface>
    </UiGrid>

    <ShowcaseNote>
      <b>Контраст текста (WCAG).</b> Светлая тема: основной 19.4:1, вторичный 8.7:1, подписи 5.4:1 на белом (4.9:1 на карточке), статусы (успех, внимание, ошибка) ≥ 4.9:1, граница элементов ≈ 3.2:1. Тёмная: вторичный 9.8:1, подписи 5.2:1 на карточке, лайм 16.5:1.
      Тема по умолчанию — тёмная и не зависит от настроек системы; выбор пользователя запоминается в браузере.
    </ShowcaseNote>
  </ShowcaseSection>
</template>

<style scoped>
.showcase-themes__text {
  margin-top: 6px;
}
</style>
