<script setup lang="ts">
import { UiAccentText, UiText } from '@/design-system'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseTypeRow from '../components/ShowcaseTypeRow.vue'
</script>

<template>
  <ShowcaseSection id="type" title="Типографика">
    <template #lead>
      Гротеск без засечек с кириллицей (Inter — предположение по референсам, заменяется одной переменной <code>--font</code>). Заголовки плотные и жирные, текст спокойный. Ключевое слово в заголовке можно выделить лаймом.
    </template>

    <ShowcaseTypeRow name="Display" spec="56 / 1.05 · 800">
      <UiText variant="display">Открывайте <UiAccentText>вкусный</UiAccentText> город</UiText>
    </ShowcaseTypeRow>
    <ShowcaseTypeRow name="H1" spec="40 / 1.1 · 700"><UiText variant="h1" as="p">Заголовок страницы</UiText></ShowcaseTypeRow>
    <ShowcaseTypeRow name="H2" spec="28 / 1.2 · 700"><UiText variant="h2" as="p">Заголовок раздела</UiText></ShowcaseTypeRow>
    <ShowcaseTypeRow name="H3" spec="20 / 1.3 · 600"><UiText variant="h3" as="p">Заголовок блока или карточки</UiText></ShowcaseTypeRow>
    <ShowcaseTypeRow name="Основной крупный" spec="16 / 1.55 · 400">
      <UiText variant="body-lg">Основной текст для описаний и лидов. Строка не длиннее 70–80 знаков, чтобы читалось легко.</UiText>
    </ShowcaseTypeRow>
    <ShowcaseTypeRow name="Основной" spec="14 / 1.5 · 400">
      <UiText variant="body">Вторичный текст: описания в карточках, подсказки, пояснения к элементам управления.</UiText>
    </ShowcaseTypeRow>
    <ShowcaseTypeRow name="Подпись" spec="12 / 1.4 · 400"><UiText variant="caption">Подпись, метаданные, юридическая мелочь</UiText></ShowcaseTypeRow>
    <ShowcaseTypeRow name="Надзаголовок" spec="12 · 600 · капс"><UiText variant="overline">Раздел · метка</UiText></ShowcaseTypeRow>
  </ShowcaseSection>
</template>
