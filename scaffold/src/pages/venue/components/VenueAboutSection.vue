<script setup lang="ts">
import { computed } from 'vue'
import { UiChip, UiSurface, UiText } from '@/design-system'
import { CUISINE_LABEL, VENUE_TAG_LABEL, VENUE_TYPE_LABEL } from '@/mocks/dictionaries'
import { formatAverageCheck } from '@/mocks/format'
import type { Venue } from '@/mocks/types'

const props = defineProps<{ venue: Venue; location: string }>()

const facts = computed(() => [
  { title: 'Кухня', value: props.venue.cuisines.map((id) => CUISINE_LABEL[id]).join(', ') },
  { title: 'Формат', value: VENUE_TYPE_LABEL[props.venue.type] },
  { title: 'Средний чек', value: formatAverageCheck(props.venue.averageCheckRub) },
  ...(props.location ? [{ title: 'Район', value: props.location }] : []),
])
</script>

<template>
  <section class="venue-about" aria-labelledby="venue-about-title">
    <UiText id="venue-about-title" as="h2" variant="h2">О месте</UiText>
    <p class="venue-about__text">{{ venue.description }}</p>

    <UiSurface variant="panel" class="venue-about__facts">
      <dl class="venue-about__list">
        <div v-for="fact in facts" :key="fact.title" class="venue-about__row">
          <dt>{{ fact.title }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </UiSurface>

    <div v-if="venue.tags.length > 0" class="venue-about__tags">
      <UiChip v-for="tag in venue.tags" :key="tag" size="sm">{{ VENUE_TAG_LABEL[tag] }}</UiChip>
    </div>
  </section>
</template>

<style scoped>
.venue-about {
  display: grid;
  gap: var(--s-4);
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}

.venue-about__text {
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.venue-about__list {
  display: grid;
  gap: var(--s-3);
  margin: 0;
}

.venue-about__row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: var(--s-3);
  font-size: 14px;
}

.venue-about__row dt {
  color: var(--text-3);
}

.venue-about__row dd {
  margin: 0;
  color: var(--text);
}

.venue-about__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
