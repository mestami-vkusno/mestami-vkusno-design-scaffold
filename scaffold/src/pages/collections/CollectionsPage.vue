<script setup lang="ts">
/*
  K0 · Хаб подборок (`/collections`, assumption: в ТЗ есть только `/collection/:id`, front-structure.md К0).
  Поиск по подборкам, чипсы поводов, главная редакционная подборка, разделы по темам, «Выбор редакции»,
  «Популярно сейчас», баннер ИИ Премиум. Без раздела «Гастрономические маршруты» — он не в ТЗ первой версии
  (front-structure.md §5.1, «продвинутые маршруты» после первой версии, ТЗ §23.2).

  Группировка девяти поводов (`CollectionTopic`) по трём разделам «по поводу / по вкусу / по атмосфере» не описана
  в ТЗ буквально — это моё прочтение состава К0 (assumption), при этом каждый повод виден и как отдельный чип.
*/
import { computed, ref } from 'vue'
import { UiButton, UiChip, UiEmptyState, UiSearchInput } from '@/design-system'
import { CollectionCard, SectionHeader } from '@/features'
import { AiTeaserAsync, SaveButtonAsync } from '@/features/lazy'
import { COLLECTION_TOPIC_LABEL } from '@/mocks/dictionaries'
import { UiPhotoPlaceholder } from '@/mocks/media'
import type { Collection, CollectionTopic } from '@/mocks/types'
import {
  collectionByline,
  collectionsByTopic,
  editorialCollections,
  featuredCollection,
  popularCollections,
  publicCollections,
  searchCollections,
} from '@/mocks/selectors/collections'
import { useCity } from '@/shell/composables/useCity'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import ShellContainer from '@/shell/components/ShellContainer.vue'

useDocumentTitle('Подборки')

const { cityId } = useCity()
const query = ref('')
const activeTopic = ref<CollectionTopic | null>(null)

const ALL_TOPICS = Object.keys(COLLECTION_TOPIC_LABEL) as readonly CollectionTopic[]

function toggleTopic(topic: CollectionTopic): void {
  activeTopic.value = activeTopic.value === topic ? null : topic
}

const isFiltering = computed(() => query.value.trim() !== '' || activeTopic.value !== null)

const filteredResults = computed<readonly Collection[]>(() => {
  const byQuery = searchCollections(query.value, cityId.value)
  return activeTopic.value === null ? byQuery : byQuery.filter((collection) => collection.topics.includes(activeTopic.value!))
})

const featured = computed(() => featuredCollection(cityId.value))

function byTopics(topics: readonly CollectionTopic[], limit = 8): readonly Collection[] {
  const seen = new Set<string>()
  const result: Collection[] = []
  for (const topic of topics) {
    for (const collection of collectionsByTopic(cityId.value, topic)) {
      if (seen.has(collection.id) || collection.id === featured.value?.id) continue
      seen.add(collection.id)
      result.push(collection)
      if (result.length >= limit) return result
    }
  }
  return result
}

// Разделы по поводу, с утра, для вечера, новое, по вкусу, по атмосфере (К0). Каждый — часть тем `CollectionTopic`.
const occasionCollections = computed(() => byTopics(['date', 'friends', 'family']))
const morningCollections = computed(() => byTopics(['breakfast']))
const eveningCollections = computed(() => byTopics(['evening']))
const newCollections = computed(() => byTopics(['new']))
const tasteCollections = computed(() => byTopics(['breakfast', 'coffee']))
const atmosphereCollections = computed(() => byTopics(['view', 'bars']))

const editorial = computed(() => editorialCollections(cityId.value).filter((collection) => collection.id !== featured.value?.id))
const popular = computed(() => popularCollections(cityId.value, 8).filter((collection) => collection.id !== featured.value?.id))

// Пустой хаб (нет ни одной публичной подборки в городе): показываем состояние, а не пустые разделы подряд.
const hasAnything = computed(() => publicCollections(cityId.value).length > 0)
</script>

<template>
  <main class="collections-page">
    <ShellContainer class="collections-page__body">
      <h1 class="fx-sr-only">Подборки</h1>

      <div class="collections-page__controls">
        <UiSearchInput v-model="query" label="Поиск по подборкам" placeholder="Поиск по подборкам…" />
        <div class="collections-page__chips" role="group" aria-label="Поводы">
          <UiChip
            v-for="topic in ALL_TOPICS"
            :key="topic"
            size="sm"
            :selected="activeTopic === topic"
            @click="toggleTopic(topic)"
          >
            {{ COLLECTION_TOPIC_LABEL[topic] }}
          </UiChip>
        </div>
      </div>

      <template v-if="isFiltering">
        <SectionHeader title="Результаты" :count="`${filteredResults.length}`" :heading-level="2" />
        <div v-if="filteredResults.length > 0" class="collections-page__grid">
          <CollectionCard v-for="collection in filteredResults" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3">
            <template #action><SaveButtonAsync kind="collection" :id="collection.id" :subject="collection.title" variant="overlay" :origin="{ sourceSurface: 'collection' }" /></template>
          </CollectionCard>
        </div>
        <UiEmptyState v-else mode="empty" title="Ничего не нашли" description="Попробуйте другой запрос или повод">
          <template #actions>
            <UiButton variant="outline" @click="query = ''; activeTopic = null">Сбросить</UiButton>
          </template>
        </UiEmptyState>
      </template>

      <template v-else-if="!hasAnything">
        <UiEmptyState mode="empty" title="В вашем городе пока нет подборок" description="Загляните позже — редакция и авторы уже готовят новые" />
      </template>

      <template v-else>
        <a v-if="featured" class="collections-page__featured" :href="`/collection/${featured.id}`">
          <UiPhotoPlaceholder class="collections-page__featured-media" :photo="featured.cover" ratio="fill" decorative />
          <span class="collections-page__featured-text">
            <span class="collections-page__featured-eyebrow">Главная подборка</span>
            <span class="collections-page__featured-title">{{ featured.title }}</span>
            <span class="collections-page__featured-byline">{{ collectionByline(featured) }}</span>
          </span>
        </a>

        <section v-if="occasionCollections.length > 0" aria-labelledby="collections-occasion">
          <SectionHeader id="collections-occasion" title="По поводу" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in occasionCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="morningCollections.length > 0" aria-labelledby="collections-morning">
          <SectionHeader id="collections-morning" title="С утра" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in morningCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="eveningCollections.length > 0" aria-labelledby="collections-evening">
          <SectionHeader id="collections-evening" title="Для красивого вечера" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in eveningCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="newCollections.length > 0" aria-labelledby="collections-new">
          <SectionHeader id="collections-new" title="Новое" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in newCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="tasteCollections.length > 0" aria-labelledby="collections-taste">
          <SectionHeader id="collections-taste" title="По вкусу" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in tasteCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="atmosphereCollections.length > 0" aria-labelledby="collections-atmosphere">
          <SectionHeader id="collections-atmosphere" title="По атмосфере" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in atmosphereCollections" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="editorial.length > 0" aria-labelledby="collections-editorial">
          <SectionHeader id="collections-editorial" title="Выбор редакции" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in editorial" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <section v-if="popular.length > 0" aria-labelledby="collections-popular">
          <SectionHeader id="collections-popular" title="Популярно сейчас" :heading-level="2" />
          <div class="collections-page__grid">
            <CollectionCard v-for="collection in popular" :key="collection.id" :collection="collection" :byline="collectionByline(collection)" layout="tile" :heading-level="3" />
          </div>
        </section>

        <AiTeaserAsync context="general" source-surface="collection" class="collections-page__ai" />
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.collections-page {
  padding-block: var(--s-4) var(--s-12);
}

.collections-page__body {
  display: grid;
  gap: var(--s-8);
}

.collections-page__controls {
  display: grid;
  gap: var(--s-3);
}

.collections-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.collections-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}

.collections-page__featured {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  min-height: 240px;
  overflow: hidden;
  border-radius: var(--r-lg);
  color: var(--on-scrim);
  text-decoration: none;
  background: var(--surface-2);
}

.collections-page__featured-media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.collections-page__featured::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(to top, var(--scrim-strong), transparent 62%);
}

.collections-page__featured-text {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--s-1);
  padding: var(--s-6);
}

.collections-page__featured-eyebrow {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.86;
}

.collections-page__featured-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.collections-page__featured-byline {
  font-size: 14px;
  opacity: 0.86;
}

.collections-page__ai {
  margin-top: var(--s-2);
}
</style>
