<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UiBreadcrumbs, UiEmptyState, UiInfoList, UiLink, UiSideMenu, UiText } from '@/design-system'
import type { IconName } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import SrHeading from './SrHeading.vue'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { ABOUT_SECTIONS, findAboutSection } from './aboutSections'

// X5 «О нас / Контакты / Реквизиты» — один шаблон (§2.8 `docs/front-structure.md`); реквизиты и контакты взяты
// из §35 `user-agreement.md` («Реквизиты и контакты»), не выдуманы (см. `aboutSections.ts`).

const SECTION_ICON: Record<string, IconName> = { contacts: 'mail', requisites: 'list' }

const route = useRoute()
const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : undefined))
const section = computed(() => findAboutSection(slug.value))
const menuItems = computed(() => ABOUT_SECTIONS.map((item) => ({ id: item.slug || 'about', label: item.title, href: item.slug ? `/about/${item.slug}` : '/about' })))

useDocumentTitle(() => section.value?.title)

const infoItems = computed(() => {
  if (!section.value?.rows) return []
  const icon = SECTION_ICON[section.value.slug] ?? 'info'
  return section.value.rows.map((row) => ({ icon, title: row.value, subtitle: row.label }))
})
</script>

<template>
  <main class="about-page">
    <ShellContainer>
      <UiBreadcrumbs :items="slug ? [{ label: 'Главная', href: '/' }, { label: 'О нас', href: '/about' }, { label: section?.title ?? 'Раздел' }] : [{ label: 'Главная', href: '/' }, { label: 'О нас' }]" class="about-page__crumbs" />

      <template v-if="section">
        <UiText as="h1" variant="h1">{{ section.title }}</UiText>
        <UiText variant="body-lg" class="about-page__lead">{{ section.lead }}</UiText>

        <div class="about-page__layout">
          <UiSideMenu class="about-page__menu" label="Разделы «О нас»" :items="menuItems" :model-value="section.slug || 'about'" />

          <div class="about-page__content">
            <UiText v-for="(paragraph, index) in section.paragraphs" :key="index" variant="body-lg" as="p" class="about-page__paragraph">{{ paragraph }}</UiText>
            <UiInfoList v-if="infoItems.length > 0" :items="infoItems" />
          </div>
        </div>
      </template>

      <template v-else>
        <SrHeading>Раздел не найден</SrHeading>
        <UiEmptyState mode="empty" page :heading-level="2" title="Раздел не найден" description="Такого раздела нет. Выберите раздел из списка.">
          <template #actions>
            <UiLink v-for="item in ABOUT_SECTIONS" :key="item.slug" :href="item.slug ? `/about/${item.slug}` : '/about'">{{ item.title }}</UiLink>
          </template>
        </UiEmptyState>
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.about-page {
  padding-block: var(--s-6) var(--s-12);
}

.about-page__crumbs {
  margin-bottom: var(--s-4);
}

.about-page__lead {
  display: block;
  margin-top: var(--s-2);
  max-width: 64ch;
  color: var(--text-2);
}

.about-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  margin-top: var(--s-6);
}

/* На телефоне список разделов уходит под текст, на десктопе — колонка слева. */
.about-page__menu.ui-side-menu {
  order: 1;
  width: 100%;
}

.about-page__content {
  display: grid;
  gap: var(--s-4);
  max-width: 68ch;
}

.about-page__paragraph {
  color: var(--text-2);
  line-height: 1.6;
}

@media (min-width: 900px) {
  .about-page__layout {
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
  }

  .about-page__menu.ui-side-menu {
    order: 0;
    position: sticky;
    top: var(--s-6);
  }
}
</style>
