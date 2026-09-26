<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UiBreadcrumbs, UiButton, UiEmptyState, UiLink, UiSideMenu, UiSurface, UiText, useToast } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import SrHeading from './SrHeading.vue'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { findHelpTopic, HELP_TOPICS } from './helpTopics'

// X4 «Помощь / Поддержка / Обратная связь / Как это работает / Вопросы и ответы» — один шаблон на четыре раздела
// (§2.8 `docs/front-structure.md`; в ТЗ не описаны, содержание — assumption, см. задачу 0017). Без слага — хаб со
// списком разделов; со слагом — сам раздел.

const route = useRoute()
const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : undefined))
const topic = computed(() => findHelpTopic(slug.value))
const menuItems = computed(() => HELP_TOPICS.map((item) => ({ id: item.slug, label: item.title, href: `/help/${item.slug}` })))

useDocumentTitle(() => topic.value?.title ?? (slug.value ? undefined : 'Помощь'))

const { show } = useToast()

function submitStub(): void {
  show({ text: 'Это макет: обращение никуда не отправлено.' })
}
</script>

<template>
  <main class="help-page">
    <ShellContainer>
      <UiBreadcrumbs :items="slug ? [{ label: 'Главная', href: '/' }, { label: 'Помощь', href: '/help' }, { label: topic?.title ?? 'Раздел' }] : [{ label: 'Главная', href: '/' }, { label: 'Помощь' }]" class="help-page__crumbs" />

      <template v-if="!slug">
        <UiText as="h1" variant="h1">Помощь</UiText>
        <UiText variant="body-lg" class="help-page__lead">Как пользоваться сервисом, частые вопросы, поддержка и обратная связь.</UiText>
        <div class="help-page__grid">
          <UiSurface v-for="item in HELP_TOPICS" :key="item.slug" variant="panel" as="a" :href="`/help/${item.slug}`" class="help-page__card">
            <UiText as="h2" variant="h3">{{ item.title }}</UiText>
            <UiText variant="body">{{ item.lead }}</UiText>
          </UiSurface>
        </div>
      </template>

      <template v-else-if="topic">
        <UiText as="h1" variant="h1">{{ topic.title }}</UiText>
        <UiText variant="body-lg" class="help-page__lead">{{ topic.lead }}</UiText>

        <div class="help-page__layout">
          <UiSideMenu class="help-page__menu" label="Разделы помощи" :items="menuItems" :model-value="topic.slug" />

          <div class="help-page__content">
            <template v-if="topic.faq">
              <section v-for="(item, index) in topic.faq" :key="index" class="help-page__faq-item">
                <UiText as="h2" variant="h3">{{ item.question }}</UiText>
                <UiText variant="body">{{ item.answer }}</UiText>
              </section>
            </template>

            <template v-else>
              <UiText v-for="(paragraph, index) in topic.paragraphs" :key="index" variant="body-lg" as="p" class="help-page__paragraph">{{ paragraph }}</UiText>
              <UiButton v-if="topic.contactAction" class="help-page__submit" @click="submitStub">{{ topic.contactAction }}</UiButton>
            </template>
          </div>
        </div>
      </template>

      <template v-else>
        <SrHeading>Раздел не найден</SrHeading>
        <UiEmptyState mode="empty" page :heading-level="2" title="Раздел не найден" description="Такого раздела помощи нет. Выберите раздел из списка.">
          <template #actions>
            <UiLink v-for="item in HELP_TOPICS" :key="item.slug" :href="`/help/${item.slug}`">{{ item.title }}</UiLink>
          </template>
        </UiEmptyState>
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.help-page {
  padding-block: var(--s-6) var(--s-12);
}

.help-page__crumbs {
  margin-bottom: var(--s-4);
}

.help-page__lead {
  display: block;
  margin-top: var(--s-2);
  max-width: 64ch;
  color: var(--text-2);
}

.help-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  margin-top: var(--s-6);
}

.help-page__card {
  display: grid;
  gap: var(--s-1);
  text-decoration: none;
  color: inherit;
}

.help-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  margin-top: var(--s-6);
}

/* На телефоне список разделов уходит под текст, на десктопе — колонка слева. */
.help-page__menu.ui-side-menu {
  order: 1;
  width: 100%;
}

.help-page__content {
  display: grid;
  gap: var(--s-4);
  max-width: 68ch;
}

.help-page__faq-item {
  display: grid;
  gap: var(--s-1);
}

.help-page__paragraph {
  color: var(--text-2);
  line-height: 1.6;
}

.help-page__submit {
  justify-self: start;
}

@media (min-width: 640px) {
  .help-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .help-page__layout {
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
  }

  .help-page__menu.ui-side-menu {
    order: 0;
    position: sticky;
    top: var(--s-6);
  }
}
</style>
