<script setup lang="ts">
import { ref } from 'vue'
import { UiBadge, UiButton, UiDateBox, UiGrid, UiInfoList, UiMediaCard, UiPromoPanel, UiRating, UiSearchInput, UiStatCard, UiStack, UiSurface, UiText, UiTile } from '@/design-system'
import { INFO_ITEMS } from '../data/cards'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const firstFavorite = ref(false)
const secondFavorite = ref(true)
const promoQuery = ref('')
</script>

<template>
  <ShowcaseSection id="cards" title="Карточки и панели" lead="Изображение — главное. Вместо фотографий здесь градиенты-заглушки, в продукте подставляются реальные тёплые тёмные снимки.">
    <ShowcaseSubheading first>Карточка с изображением</ShowcaseSubheading>
    <UiGrid :min="180">
      <UiMediaCard v-model:favorite="firstFavorite" show-favorite title="Заголовок карточки" subtitle="Категория · Район">
        <template #badges><UiBadge variant="new">Новое</UiBadge></template>
        <UiText variant="caption" class="cards-row">$$$ · 1500 ₽</UiText>
        <UiRating class="cards-row" :value="4.7" :count="1287" />
      </UiMediaCard>
      <UiMediaCard v-model:favorite="secondFavorite" show-favorite tone="dusk" title="Заголовок карточки" subtitle="Категория · Район">
        <UiBadge pill class="cards-row">Метка</UiBadge>
      </UiMediaCard>
      <UiMediaCard tone="rust" title="Событие или предложение" subtitle="Организатор · Район">
        <template #badges><UiBadge variant="warning">Мало мест</UiBadge></template>
        <template #eyebrow>
          <UiDateBox :day="13" month="авг" />
          <UiText variant="caption" as="span">19:00</UiText>
        </template>
        <b class="cards-price">4500 ₽</b>
      </UiMediaCard>
      <UiMediaCard title="Заголовок карточки" subtitle="Организатор · Район">
        <template #badges><UiBadge variant="success">Бесплатно</UiBadge></template>
      </UiMediaCard>
    </UiGrid>

    <ShowcaseSubheading>Плитка с подписью на изображении</ShowcaseSubheading>
    <UiGrid :min="180">
      <UiTile title="Название плитки" caption="23 места" />
      <UiTile tone="dusk" title="Название плитки" caption="18 мест" />
      <UiTile tone="rust" title="Название плитки" caption="25 мест" />
      <UiTile title="Название плитки" caption="32 места"><template #badge><UiBadge variant="new">Новое</UiBadge></template></UiTile>
    </UiGrid>

    <ShowcaseSubheading>Показатели и списки</ShowcaseSubheading>
    <UiGrid :min="280" align="start">
      <div class="cards-stats">
        <UiStatCard icon="pin" :value="24" label="Показатель" />
        <UiStatCard icon="list" :value="17" label="Показатель" />
        <UiStatCard icon="heart" :value="38" label="Показатель" />
      </div>
      <UiInfoList :items="INFO_ITEMS" />
      <UiSurface variant="panel">
        <UiStack :gap="3">
          <UiButton block icon-right="arrow-r">Главное действие</UiButton>
          <UiButton block variant="neutral" icon-left="heart">Сохранить</UiButton>
          <UiButton block variant="neutral" icon-left="share">Поделиться</UiButton>
        </UiStack>
      </UiSurface>
    </UiGrid>

    <ShowcaseSubheading>Акцентный блок с полем ввода</ShowcaseSubheading>
    <UiPromoPanel title="Заголовок акцентного блока" badge="Метка" description="Короткое пояснение в одну–две строки. Блок обведён лаймовым контуром и слегка светится." note="Пояснение об ограничении">
      <UiSearchInput v-model="promoQuery" label="Поле" placeholder="Подсказка в поле…" button-icon="arrow-r" button-label="Отправить" />
    </UiPromoPanel>
  </ShowcaseSection>
</template>

<style scoped>
.cards-row {
  margin-top: 4px;
}

.cards-price {
  margin-top: 6px;
  font-size: 15px;
}

.cards-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: start;
}
</style>
