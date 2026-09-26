<script setup lang="ts">
/*
  K1 · Подборка (`/collection/:id`). Обычная страница второго уровня, открывается и по прямой ссылке (§22А).
  Список заведений с заметками автора в авторском порядке (§17.1); редакционная подписана «Редакция «Местами
  вкусно»» (§17.2). Чужая приватная или неопубликованная подборка недоступна — тот же принцип, что у публикации
  (PostPage): видна владельцу всегда, остальным — только опубликованная и публичная.
*/
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiBadge, UiButton, UiEmptyState, UiText } from '@/design-system'
import { AuthorRow, SectionHeader, ShareButton, VenueRow } from '@/features'
import { SaveButton } from '@/features/actions'
import { UiPhotoPlaceholder } from '@/mocks/media'
import { collectionByline, collectionEntries, getCollection, isCollectionPublic } from '@/mocks/selectors/collections'
import { getAuthor } from '@/mocks/selectors/social'
import { venueLocationLabel } from '@/mocks/selectors/places'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useViewer } from '@/shell/composables/useViewer'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useLibrary } from '@/state/useLibrary'

const route = useRoute()
const router = useRouter()
const { userId } = useViewer()
// Только для видимой подписи рядом с `SaveButton` (J9 «Сохранить»): переключение и тост делает сама кнопка.
const library = useLibrary()

const collectionId = computed(() => String(route.params.id))
const collection = computed(() => getCollection(collectionId.value))
const isMine = computed(() => collection.value !== undefined && collection.value.ownerId !== null && collection.value.ownerId === userId.value)
const available = computed(() => collection.value !== undefined && (isMine.value || isCollectionPublic(collection.value)))

useDocumentTitle(computed(() => (available.value && collection.value ? collection.value.title : 'Подборка')))

const owner = computed(() => (collection.value?.ownerId ? getAuthor(collection.value.ownerId) : undefined))
const byline = computed(() => (collection.value ? collectionByline(collection.value) : ''))
const entries = computed(() => (collection.value ? collectionEntries(collection.value) : []))

function back(): void {
  if (window.history.length > 1) router.back()
  else void router.push('/collections')
}
</script>

<template>
  <main class="collection-page">
    <ShellContainer v-if="!available">
      <UiEmptyState mode="empty" title="Подборка недоступна" description="Подборка приватная, ещё не опубликована или ссылка устарела." page>
        <template #actions>
          <UiButton variant="primary" href="/collections">К подборкам</UiButton>
          <UiButton variant="outline" href="/">На главную</UiButton>
        </template>
      </UiEmptyState>
    </ShellContainer>

    <template v-else-if="collection">
      <div class="collection-page__cover">
        <UiPhotoPlaceholder :photo="collection.cover" ratio="16:9" decorative />
      </div>

      <ShellContainer class="collection-page__body">
        <div class="collection-page__head">
          <div class="collection-page__badges">
            <UiBadge v-if="collection.visibility === 'private'" variant="neutral" icon="lock">Приватная</UiBadge>
            <UiBadge v-if="collection.status === 'draft'" variant="warning">Черновик</UiBadge>
          </div>
          <h1 class="collection-page__title">{{ collection.title }}</h1>
          <p v-if="collection.description" class="collection-page__description">{{ collection.description }}</p>

          <div class="collection-page__meta">
            <AuthorRow v-if="owner" :author="owner" :subtitle="byline" />
            <p v-else class="collection-page__editorial">{{ byline }}</p>
            <UiText variant="caption" class="collection-page__count">{{ entries.length }} {{ entries.length === 1 ? 'место' : entries.length < 5 ? 'места' : 'мест' }}</UiText>
          </div>

          <div class="collection-page__actions">
            <span class="collection-page__save">
              <SaveButton kind="collection" :id="collection.id" :subject="collection.title" variant="action" :origin="{ sourceSurface: 'collection' }" />
              <UiText variant="caption" aria-hidden="true">{{ library.isCollectionSaved(collection.id) ? 'Сохранено' : 'Сохранить' }}</UiText>
            </span>
            <ShareButton variant="plain" :target="{ kind: 'collection', id: collection.id, title: collection.title, href: `/collection/${collection.id}` }" />
          </div>
        </div>

        <SectionHeader title="Заведения" :count="`${entries.length}`" :heading-level="2" />

        <ol v-if="entries.length > 0" class="collection-page__list">
          <li v-for="(entry, index) in entries" :key="entry.venue.id" class="collection-page__item">
            <span class="collection-page__index" aria-hidden="true">{{ index + 1 }}</span>
            <VenueRow :venue="entry.venue" :location="venueLocationLabel(entry.venue)" :heading-level="3" />
            <p v-if="entry.item.note" class="collection-page__note">{{ entry.item.note }}</p>
          </li>
        </ol>
        <UiEmptyState v-else mode="empty" title="В подборке пока нет заведений" />

        <UiButton class="collection-page__back" variant="ghost" icon-left="arrow-l" @click="back">Назад</UiButton>
      </ShellContainer>
    </template>
  </main>
</template>

<style scoped>
.collection-page {
  padding-bottom: var(--s-12);
}

.collection-page__cover {
  max-height: 320px;
  overflow: hidden;
}

.collection-page__body {
  padding-top: var(--s-5);
}

.collection-page__head {
  display: grid;
  gap: var(--s-2);
  margin-bottom: var(--s-6);
}

.collection-page__badges {
  display: flex;
  gap: var(--s-2);
}

.collection-page__title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}

.collection-page__description {
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.5;
}

.collection-page__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-2);
}

.collection-page__editorial {
  margin: 0;
  color: var(--accent-fg);
  font-weight: 600;
  font-size: 14px;
}

.collection-page__count {
  flex: none;
  color: var(--text-3);
}

.collection-page__actions {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  margin-top: var(--s-2);
}

.collection-page__save {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--text-2);
}

.collection-page__list {
  display: grid;
  gap: var(--s-5);
  margin: 0;
  padding: 0;
  list-style: none;
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}

.collection-page__item {
  position: relative;
  display: grid;
  gap: var(--s-2);
  padding-left: var(--s-8);
}

.collection-page__index {
  position: absolute;
  left: 0;
  top: var(--s-2);
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--r-pill);
  background: var(--surface-2);
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
}

.collection-page__note {
  margin: 0;
  padding-left: var(--s-2);
  border-left: 2px solid var(--border-strong);
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.5;
}

.collection-page__back {
  margin-top: var(--s-6);
}
</style>
