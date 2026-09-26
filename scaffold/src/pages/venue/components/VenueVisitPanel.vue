<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiButton, UiIcon, UiSurface, UiText } from '@/design-system'
import { formatDate } from '@/mocks/format'
import type { VisitEntry } from '@/mocks/selectors/library'
import type { Review } from '@/mocks/types'
import { openEditor, postEditorUrl, reviewEditorUrl, visitEditorUrl } from '@/pages/create/links'

const props = defineProps<{ venueId: string; visit?: VisitEntry; review?: Review }>()

const router = useRouter()

/* «Я здесь был», «Оценить», «Оставить отзыв» и «Написать публикацию» ведут в редакторы CR4, CR3 и CR1 с заведением; гость сначала входит (§5.1). */
function openVisitEditor(): void {
  openEditor(router, visitEditorUrl(props.venueId), 'venue')
}

function openReviewEditor(): void {
  openEditor(router, reviewEditorUrl(props.venueId, props.visit?.visit.id), 'venue')
}

function openPostEditor(): void {
  openEditor(router, postEditorUrl({ venueId: props.venueId, ...(props.visit === undefined ? {} : { visitId: props.visit.visit.id }) }), 'venue')
}
</script>

<template>
  <UiSurface variant="panel" class="venue-visit" aria-labelledby="venue-visit-title">
    <UiText id="venue-visit-title" as="h2" variant="h3">Посещение</UiText>

    <div v-if="visit" class="venue-visit__done">
      <p class="venue-visit__note"><UiIcon name="check" :size="16" />Вы были здесь: {{ formatDate(visit.visit.visitedOn) }}</p>
      <UiButton variant="outline" block @click="openReviewEditor">{{ review ? 'Изменить отзыв' : 'Оставить отзыв' }}</UiButton>
      <UiButton variant="ghost" block icon-left="edit" @click="openPostEditor">Написать публикацию</UiButton>
    </div>
    <div v-else class="venue-visit__empty">
      <UiText variant="body">Отметьте, что вы здесь были, — потом можно оставить оценку и отзыв.</UiText>
      <UiButton variant="outline" block @click="openVisitEditor">Я здесь был</UiButton>
      <UiButton variant="ghost" block icon-left="star" @click="openReviewEditor">Оценить и оставить отзыв</UiButton>
      <UiButton variant="ghost" block icon-left="edit" @click="openPostEditor">Написать публикацию</UiButton>
    </div>
  </UiSurface>
</template>

<style scoped>
.venue-visit {
  display: grid;
  gap: var(--s-3);
}

.venue-visit__done,
.venue-visit__empty {
  display: grid;
  gap: var(--s-3);
}

.venue-visit__note {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--success);
  font-size: 14px;
}
</style>
