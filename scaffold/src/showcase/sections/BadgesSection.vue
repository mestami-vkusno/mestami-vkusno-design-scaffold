<script setup lang="ts">
import { UiBadge, UiCluster, UiIcon, UiRating, UiText } from '@/design-system'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'
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
        <UiBadge variant="danger">Отклонено</UiBadge>
        <UiBadge variant="neutral">Нейтральный</UiBadge>
        <UiRating :value="4.7" :count="1287" />
        <UiRating :value="4" variant="stars" />
      </UiCluster>
    </ShowcaseStage>

    <ShowcaseSubheading>Точка «есть новое»</ShowcaseSubheading>
    <ShowcaseStage>
      <UiCluster :gap="6">
        <span class="badges-dot-host"><UiIcon name="bell" :size="24" /><UiBadge dot variant="danger" label="Есть непрочитанные" class="badges-dot" /></span>
        <span class="badges-dot-host"><UiIcon name="feed" :size="24" /><UiBadge dot class="badges-dot" /></span>
        <UiBadge dot variant="success" label="В сети" />
        <UiBadge dot variant="warning" label="Требует внимания" />
        <UiBadge dot variant="neutral" />
        <UiText variant="caption">Точка без текста: с подписью для скринридера или декоративная</UiText>
      </UiCluster>
    </ShowcaseStage>
  </ShowcaseSection>
</template>

<style scoped>
.badges-dot-host {
  position: relative;
  display: inline-flex;
}

.badges-dot {
  position: absolute;
  top: -1px;
  right: -1px;
}
</style>
