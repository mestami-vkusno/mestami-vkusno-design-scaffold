<script setup lang="ts">
import { UiGrid } from '@/design-system'
import { COLOR_GROUPS } from '../data/colors'
import ShowcaseNote from '../components/ShowcaseNote.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
import ShowcaseSwatch from '../components/ShowcaseSwatch.vue'
</script>

<template>
  <ShowcaseSection
    id="colors"
    title="Цвета"
    lead="Основная тема тёмная, с одним акцентом. Лаймовый — только для действий, активных состояний и выделения, не как фон целых экранов. Светлая тема — на тех же токенах, см. блок «Тёмная и светлая тема»."
  >
    <template v-for="(group, index) in COLOR_GROUPS" :key="group.title">
      <ShowcaseSubheading :first="index === 0">{{ group.title }}</ShowcaseSubheading>
      <UiGrid :min="160">
        <ShowcaseSwatch v-for="color in group.tokens" :key="color.token" :color="color" />
      </UiGrid>
    </template>

    <ShowcaseNote>
      <b>Откуда значения.</b> Тёмные цвета взяты из ТЗ (§25А.1: фон #0D0D0D, поверхности около #1A1A1A, акцент лайм #CCFF00). На референсах измерено: фон темнее (≈ #050505–#0D0D0D), лайм чуть приглушённее (≈ #C8E600). Если нужно совпадение с референсами,
      меняется только токен <code>--lime</code>. Светлая тема в референсах отсутствует: она построена вокруг того, что лайм остаётся базовым цветом (подложка-маркер), а текст чёрный; значения в карточках выше показывают текущую тему (переключатель вверху).
    </ShowcaseNote>
  </ShowcaseSection>
</template>
