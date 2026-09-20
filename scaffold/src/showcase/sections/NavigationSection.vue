<script setup lang="ts">
import { ref } from 'vue'
import { UiAppHeader, UiBreadcrumbs, UiButton, UiFooter, UiGrid, UiIconButton, UiLink, UiSideMenu, UiTabBar } from '@/design-system'
import { BREADCRUMBS, FOOTER_COLUMNS, FOOTER_SOCIALS, HEADER_ITEMS, SIDE_MENU_ITEMS, SIDE_MENU_SECONDARY, TAB_BAR_ITEMS } from '../data/navigation'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const headerActive = ref('section-1')
const tabBarActive = ref('home')
const sideMenuActive = ref('home')
</script>

<template>
  <ShowcaseSection id="nav" title="Навигация" lead="Верхняя панель на десктопе, нижняя на мобильных, боковое меню в кабинете. Активный пункт отмечен лаймом.">
    <ShowcaseSubheading first>Верхняя панель</ShowcaseSubheading>
    <UiAppHeader v-model="headerActive" :items="HEADER_ITEMS" city="Город" home-href="#nav">
      <template #actions>
        <UiIconButton icon="heart" label="Избранное" variant="plain" size="sm" />
        <UiButton variant="neutral" size="sm">Вход</UiButton>
        <UiButton size="sm">Регистрация</UiButton>
      </template>
    </UiAppHeader>

    <UiGrid :min="240" align="start" class="nav-row">
      <div>
        <ShowcaseSubheading first>Нижняя панель (мобильная)</ShowcaseSubheading>
        <UiTabBar v-model="tabBarActive" class="nav-tab-bar" :items="TAB_BAR_ITEMS" label="Пример нижней панели" />
      </div>
      <div>
        <ShowcaseSubheading first>Боковое меню</ShowcaseSubheading>
        <UiSideMenu v-model="sideMenuActive" :items="SIDE_MENU_ITEMS" :secondary-items="SIDE_MENU_SECONDARY" label="Пример бокового меню" />
      </div>
      <div>
        <ShowcaseSubheading first>Навигационная цепочка</ShowcaseSubheading>
        <UiBreadcrumbs :items="BREADCRUMBS" />
        <ShowcaseSubheading>Возврат</ShowcaseSubheading>
        <UiLink href="#nav" variant="muted" icon-left="arrow-l">На главную</UiLink>
      </div>
    </UiGrid>

    <ShowcaseSubheading>Подвал</ShowcaseSubheading>
    <UiFooter home-href="#nav" description="Короткое описание сервиса в две–три строки." :columns="FOOTER_COLUMNS" :socials="FOOTER_SOCIALS" />
  </ShowcaseSection>
</template>

<style scoped>
.nav-row {
  margin-top: var(--s-6);
}

.nav-tab-bar {
  max-width: 390px;
}
</style>
