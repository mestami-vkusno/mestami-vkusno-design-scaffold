<script setup lang="ts">
import { UiSkeleton, UiSurface } from '@/design-system'
import type { CardSkeletonProps } from './types'

withDefaults(defineProps<CardSkeletonProps>(), { count: 1, label: 'Загрузка' })
</script>

<!-- Одна область `role="status"` на все заготовки: скринридер слышит «Загрузка» один раз, а не по числу карточек. -->
<template>
  <UiSkeleton :label="label">
    <div class="card-skeleton" :class="`card-skeleton--${kind}`">
      <template v-for="index in count" :key="index">
        <UiSurface v-if="kind === 'venue' || kind === 'event'" class="card-skeleton__card" as="div">
          <UiSkeleton ratio="4/3" />
          <div class="card-skeleton__body">
            <UiSkeleton variant="text" width="80%" :height="18" />
            <UiSkeleton variant="text" :lines="2" :height="12" />
          </div>
        </UiSurface>
        <UiSurface v-else-if="kind === 'venue-row' || kind === 'event-row'" class="card-skeleton__row" as="div">
          <UiSkeleton :height="104" />
          <div class="card-skeleton__body">
            <UiSkeleton variant="text" width="70%" :height="16" />
            <UiSkeleton variant="text" :lines="2" :height="12" />
          </div>
        </UiSurface>
        <UiSurface v-else-if="kind === 'collection'" class="card-skeleton__card" as="div">
          <UiSkeleton ratio="5/4" />
        </UiSurface>
        <UiSurface v-else-if="kind === 'post'" class="card-skeleton__card" as="div">
          <div class="card-skeleton__head">
            <UiSkeleton variant="circle" :size="32" />
            <UiSkeleton variant="text" width="40%" :height="14" />
          </div>
          <UiSkeleton ratio="4/3" />
          <div class="card-skeleton__body">
            <UiSkeleton variant="text" :lines="2" :height="12" />
          </div>
        </UiSurface>
        <div v-else-if="kind === 'comment'" class="card-skeleton__comment">
          <UiSkeleton variant="circle" :size="32" />
          <UiSkeleton variant="text" :lines="2" :height="12" />
        </div>
        <UiSurface v-else-if="kind === 'author'" class="card-skeleton__author" as="div">
          <UiSkeleton variant="circle" :size="64" />
          <div class="card-skeleton__body">
            <UiSkeleton variant="text" width="60%" :height="16" />
            <UiSkeleton variant="text" :lines="2" :height="12" />
          </div>
        </UiSurface>
        <div v-else class="card-skeleton__dish">
          <UiSkeleton :width="72" :height="72" />
          <UiSkeleton variant="text" :lines="2" :height="14" />
        </div>
      </template>
    </div>
  </UiSkeleton>
</template>

<style scoped>
.card-skeleton {
  display: grid;
  gap: var(--s-4);
}

.card-skeleton--venue,
.card-skeleton--event,
.card-skeleton--collection {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.card-skeleton__body {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-3) var(--s-4) var(--s-4);
}

.card-skeleton__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
}

.card-skeleton__row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
}

.card-skeleton__row > :first-child {
  border-radius: 0;
  height: 100%;
}

.card-skeleton__row .card-skeleton__body {
  padding: var(--s-3);
}

.card-skeleton__author {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-4);
}

.card-skeleton__author .card-skeleton__body {
  padding: 0;
}

.card-skeleton__comment {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s-3);
}

.card-skeleton__dish {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: var(--s-3);
  padding: var(--s-3) 0;
}
</style>
