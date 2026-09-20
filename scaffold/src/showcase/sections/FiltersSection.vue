<script setup lang="ts">
import { ref } from 'vue'
import { UiChip, UiCluster, UiLink, UiPagination, UiSegmented, UiTabs, UiText } from '@/design-system'
import { SEGMENT_ITEMS, TAB_ITEMS } from '../data/filters'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const selectedChip = ref('all')
const activeTab = ref('first')
const viewMode = ref('list')
const page = ref(1)
const activeTags = ref(['Значение', 'До 2500'])
</script>

<template>
  <ShowcaseSection id="filters" title="Чипы, вкладки, сегменты" lead="Чипы — полностью скруглённые. Активный чип заливается лаймом.">
    <ShowcaseSubheading first>Чипы</ShowcaseSubheading>
    <ShowcaseStage>
      <UiCluster>
        <UiChip :selected="selectedChip === 'all'" @click="selectedChip = 'all'">Все</UiChip>
        <UiChip :selected="selectedChip === 'option'" @click="selectedChip = 'option'">Вариант</UiChip>
        <UiChip icon="heart">С иконкой</UiChip>
        <UiChip trailing-icon="chev-d">Ещё</UiChip>
        <UiChip variant="inverse">Инверсный</UiChip>
        <UiChip size="sm">Малый</UiChip>
        <UiChip size="sm" selected>Малый выбран</UiChip>
      </UiCluster>
      <UiCluster class="filters-tags">
        <UiText variant="caption" as="span">Выбрано:</UiText>
        <UiChip v-for="tag in activeTags" :key="tag" variant="tag" size="sm" removable :remove-label="`Убрать: ${tag}`" @remove="activeTags = activeTags.filter((item) => item !== tag)">{{ tag }}</UiChip>
        <UiLink href="#filters" @click.prevent="activeTags = []">Сбросить всё</UiLink>
      </UiCluster>
    </ShowcaseStage>

    <ShowcaseSubheading>Вкладки и сегменты</ShowcaseSubheading>
    <ShowcaseStage>
      <UiTabs v-model="activeTab" :items="TAB_ITEMS" label="Пример вкладок" />
      <UiCluster justify="between" class="filters-controls">
        <UiSegmented v-model="viewMode" :items="SEGMENT_ITEMS" label="Режим" />
        <UiPagination v-model:page="page" :page-count="24" />
      </UiCluster>
    </ShowcaseStage>
  </ShowcaseSection>
</template>

<style scoped>
.filters-tags,
.filters-controls {
  margin-top: 20px;
}

.filters-tags {
  margin-top: 14px;
}
</style>
