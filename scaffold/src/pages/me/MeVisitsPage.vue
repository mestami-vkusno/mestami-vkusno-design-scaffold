<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton, UiEmptyState, UiIcon, UiRating, UiStack, UiSurface, UiText } from '@/design-system'
import { formatDate } from '@/mocks/format'
import type { VisitEntry } from '@/mocks/selectors/library'
import { openEditor, postEditorUrl, reviewEditorUrl, visitEditorUrl } from '@/pages/create/links'
import { useViewer } from '@/shell/composables/useViewer'
import { useLibrary } from '@/state/useLibrary'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import MeGuestState from './components/MeGuestState.vue'

/*
  M3 «Посещения» (§16.3, §16.4, `/me/visits`): приватный ручной факт, ресторану и подписчикам не показывается.
  После Посещения можно предложить Оценку, Отзыв, Публикацию — всё необязательно; кнопки ведут в редакторы CR3, CR1
  с заведением и Посещением, «Добавить Посещение» — в CR4 (задача 0011).
*/

const { isSignedIn } = useViewer()
const library = useLibrary()
const visits = computed(() => library.visits.value)
const router = useRouter()

function onRate(entry: VisitEntry): void {
  openEditor(router, reviewEditorUrl(entry.venue.id, entry.visit.id), 'me')
}

function onReview(entry: VisitEntry): void {
  openEditor(router, reviewEditorUrl(entry.venue.id, entry.visit.id), 'me')
}

function onPublish(entry: VisitEntry): void {
  openEditor(router, postEditorUrl({ venueId: entry.venue.id, visitId: entry.visit.id, ...(entry.event === undefined ? {} : { eventId: entry.event.id }) }), 'me')
}

function onAddVisit(): void {
  openEditor(router, visitEditorUrl(), 'me')
}
</script>

<template>
  <main class="me-visits">
    <ShellContainer>
      <MeGuestState
        v-if="!isSignedIn"
        title="Посещения"
        description="Войдите, чтобы отмечать, где вы были, и не забывать про оценки и отзывы."
      />
      <UiStack v-else :gap="4" align="start">
        <div class="me-visits__title">
          <UiText variant="h1">Посещения</UiText>
          <UiButton variant="outline" size="sm" icon-left="plus" @click="onAddVisit">Добавить Посещение</UiButton>
        </div>

        <UiEmptyState
          v-if="visits.length === 0"
          title="Пока нет Посещений"
          description="Отмечайте «Я здесь был» на странице заведения — они появятся здесь."
        />
        <div v-else class="me-visits__list">
          <UiSurface v-for="entry in visits" as="article" :key="entry.visit.id" class="me-visits__item">
            <div class="me-visits__head">
              <a class="me-visits__venue" :href="`/venue/${entry.venue.id}`">{{ entry.venue.name }}</a>
              <UiText variant="caption" class="me-visits__date">
                <UiIcon name="check" :size="14" />{{ formatDate(entry.visit.visitedOn) }}
              </UiText>
            </div>
            <p v-if="entry.event" class="me-visits__event">
              <UiIcon name="calendar" :size="14" />
              <a :href="`/event/${entry.event.id}`">{{ entry.event.title }}</a>
            </p>
            <p v-if="entry.visit.note" class="me-visits__note">{{ entry.visit.note }}</p>

            <div class="me-visits__actions">
              <div v-if="entry.rating" class="me-visits__done">
                <UiRating :value="entry.rating.value" variant="stars" />
                <UiButton variant="ghost" size="sm" @click="onRate(entry)">Изменить оценку</UiButton>
              </div>
              <UiButton v-else variant="outline" size="sm" @click="onRate(entry)">Оценить</UiButton>

              <div v-if="entry.review" class="me-visits__done">
                <UiText variant="caption" class="me-visits__review-text">{{ entry.review.text }}</UiText>
                <UiButton variant="ghost" size="sm" @click="onReview(entry)">Изменить отзыв</UiButton>
              </div>
              <UiButton v-else variant="outline" size="sm" @click="onReview(entry)">Оставить отзыв</UiButton>

              <UiButton v-if="entry.post" variant="ghost" size="sm" icon-left="feed" :href="`/post/${entry.post.id}`">Открыть публикацию</UiButton>
              <UiButton v-else variant="outline" size="sm" @click="onPublish(entry)">Опубликовать</UiButton>
            </div>
          </UiSurface>
        </div>
      </UiStack>
    </ShellContainer>
  </main>
</template>

<style scoped>
.me-visits {
  padding-block: var(--s-6) var(--s-16);
}

.me-visits__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  width: 100%;
}

.me-visits__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  width: 100%;
  content-visibility: auto;
  contain-intrinsic-size: auto 160px;
}

.me-visits__item {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4);
}

.me-visits__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-2);
}

.me-visits__venue {
  color: inherit;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
}

.me-visits__venue:hover {
  text-decoration: underline;
}

.me-visits__date {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  color: var(--success);
  white-space: nowrap;
}

.me-visits__event {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  margin: 0;
  font-size: 13px;
  color: var(--text-2);
}

.me-visits__event a {
  color: inherit;
}

.me-visits__note {
  margin: 0;
  color: var(--text-2);
  font-size: 14px;
}

.me-visits__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
  margin-top: var(--s-1);
}

.me-visits__done {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.me-visits__review-text {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
