<script setup lang="ts">
import { UiBadge, UiCluster, UiRating } from '@/design-system'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
</script>

<template>
  <ShowcaseSection id="badges" title="Бейджи и метки" lead="Малые метки поверх изображений и в заголовках. Прямоугольные — статусы, «пилюли» — категории.">
    <ShowcaseStage>
      <UiCluster>
        <UiBadge variant="new">Новое</UiBadge>
        <UiBadge>Акцентный контур</UiBadge>
        <UiBadge pill>Контур-пилюля</UiBadge>
        <UiBadge icon="star">С иконкой</UiBadge>
        <UiBadge variant="warning">Внимание</UiBadge>
        <UiBadge variant="success">Успех</UiBadge>
        <UiBadge variant="neutral">Нейтральный</UiBadge>
        <UiRating :value="4.7" :count="1287" />
        <UiRating :value="4" variant="stars" />
      </UiCluster>
    </ShowcaseStage>
  </ShowcaseSection>
</template>
