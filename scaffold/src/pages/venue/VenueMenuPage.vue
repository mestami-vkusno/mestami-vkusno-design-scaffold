<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UiButton, UiChip, UiEmptyState, UiField, UiInput, UiScreenBar, UiText } from '@/design-system'
import { DishRow } from '@/features'
import { getPublicMenu } from '@/mocks/selectors/menu'
import { getCity, resolveVenueLink } from '@/mocks/selectors/places'
import { matchesQuery } from '@/mocks/selectors/text'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import OtherCityBanner from './components/OtherCityBanner.vue'

const route = useRoute()
const { cityId } = useCity()

const idParam = computed(() => String(route.params.id ?? ''))
const link = computed(() => resolveVenueLink(idParam.value, cityId.value))
const venue = computed(() => link.value?.object)
const menu = computed(() => (venue.value ? getPublicMenu(venue.value.id) : undefined))

useDocumentTitle(() => venue.value?.name)

const query = ref('')
const activeSection = ref<'all' | string>('all')

const sections = computed(() => menu.value?.sections ?? [])

const filteredSections = computed(() =>
  sections.value
    .filter((section) => activeSection.value === 'all' || section.id === activeSection.value)
    .map((section) => ({ ...section, items: section.items.filter((item) => matchesQuery(query.value, item.name, item.description)) }))
    .filter((section) => section.items.length > 0),
)

const totalFiltered = computed(() => filteredSections.value.reduce((sum, section) => sum + section.items.length, 0))

function resetFilters(): void {
  query.value = ''
  activeSection.value = 'all'
}
</script>

<template>
  <main class="venue-menu-page">
    <ShellContainer v-if="!venue">
      <UiEmptyState mode="empty" title="Такого заведения нет" description="Возможно, ссылка устарела или адрес введён неверно." page>
        <template #actions>
          <UiButton href="/search" size="lg">Открыть поиск</UiButton>
          <UiButton href="/" variant="outline" size="lg">На главную</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <template v-else>
      <UiScreenBar title="Меню" :back-href="`/venue/${venue.id}`" back-label="К заведению" />

      <ShellContainer class="venue-menu-page__body">
        <OtherCityBanner v-if="link?.isOtherCity" :city-name="getCity(venue.cityId)?.name ?? ''" />
        <UiText as="h2" variant="h2">{{ venue.name }} · Меню</UiText>

        <template v-if="sections.length > 0">
          <div class="venue-menu-page__filters">
            <div class="venue-menu-page__chips" role="group" aria-label="Категории меню">
              <UiChip :selected="activeSection === 'all'" size="sm" @click="activeSection = 'all'">Все</UiChip>
              <UiChip v-for="section in sections" :key="section.id" :selected="activeSection === section.id" size="sm" @click="activeSection = section.id">
                {{ section.title }}
              </UiChip>
            </div>
            <UiField label="Поиск по меню" class="venue-menu-page__search">
              <template #default="{ id }">
                <UiInput :id="id" v-model="query" type="search" placeholder="Найти блюдо…" />
              </template>
            </UiField>
          </div>

          <div v-if="filteredSections.length > 0" class="venue-menu-page__sections">
            <section v-for="section in filteredSections" :key="section.id" class="venue-menu-page__section" :aria-labelledby="`menu-section-${section.id}`">
              <UiText :id="`menu-section-${section.id}`" as="h2" variant="h3">{{ section.title }}</UiText>
              <div class="venue-menu-page__list">
                <DishRow v-for="item in section.items" :key="item.id" :item="item" :href="`/venue/${venue.id}/menu/${item.id}`" deferred />
              </div>
            </section>
          </div>
          <UiEmptyState v-else mode="empty" title="Ничего не нашли" description="Попробуйте другой запрос или категорию.">
            <template #actions>
              <UiButton variant="outline" @click="resetFilters">Сбросить фильтры</UiButton>
            </template>
          </UiEmptyState>
          <p class="fx-sr-only" role="status">Показано позиций: {{ totalFiltered }}</p>
        </template>

        <UiEmptyState v-else mode="empty" title="Меню пока не опубликовано" description="Загляните позже — заведение ещё готовит структурированное меню.">
          <template #actions>
            <UiButton :href="`/venue/${venue.id}`" variant="outline">К заведению</UiButton>
          </template>
        </UiEmptyState>
      </ShellContainer>
    </template>
  </main>
</template>

<style scoped>
.venue-menu-page__body {
  display: grid;
  gap: var(--s-5);
  padding-block: var(--s-5) var(--s-12);
}

.venue-menu-page__filters {
  display: grid;
  gap: var(--s-3);
  position: sticky;
  top: 56px;
  z-index: 5;
  padding-block: var(--s-2);
  background: var(--bg);
}

.venue-menu-page__chips {
  display: flex;
  gap: var(--s-2);
  overflow-x: auto;
  padding-bottom: var(--s-1);
  scrollbar-width: none;
}

.venue-menu-page__search {
  max-width: 420px;
}

.venue-menu-page__sections {
  display: grid;
  gap: var(--s-8);
}

.venue-menu-page__section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}

.venue-menu-page__list {
  display: flex;
  flex-direction: column;
}

@media (min-width: 900px) {
  .venue-menu-page__filters {
    top: 64px;
  }
}
</style>
