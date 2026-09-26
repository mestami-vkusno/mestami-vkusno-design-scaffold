<script setup lang="ts">
import '@/features/shared/base.css'
import { computed } from 'vue'
import type { AiComparison } from '@/mocks/types'
import { getVenue } from '@/mocks/selectors/places'
import { NOT_IN_DATA } from '../copy'

/*
  Сравнение 2–4 заведений (§23.6): строки — критерии, столбцы — заведения. Неизвестное показывается явно, победитель не объявляется.
  На узком экране таблица прокручивается внутри своей области, а не раздувает страницу; первый столбец остаётся на месте.
*/
const props = defineProps<{ comparison: AiComparison }>()

const columns = computed(() =>
  props.comparison.venueIds.slice(0, 4).map((id) => ({ id, name: getVenue(id)?.name ?? id, href: `/venue/${id}` })),
)
</script>

<template>
  <section class="ai-compare" aria-label="Сравнение заведений">
    <div class="ai-compare__scroll" role="region" aria-label="Таблица сравнения, прокручивается по горизонтали" tabindex="0">
      <table class="ai-compare__table">
        <thead>
          <tr>
            <th scope="col" class="ai-compare__corner"><span class="fx-sr-only">Критерий</span></th>
            <th v-for="column in columns" :key="column.id" scope="col" class="ai-compare__head">
              <a :href="column.href">{{ column.name }}</a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in comparison.rows" :key="row.criterion">
            <th scope="row" class="ai-compare__criterion">{{ row.criterion }}</th>
            <td v-for="column in columns" :key="column.id" :class="{ 'ai-compare__unknown': row.values[column.id] == null }">
              {{ row.values[column.id] ?? NOT_IN_DATA }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="ai-compare__note">{{ comparison.note }}</p>
  </section>
</template>

<style scoped>
.ai-compare {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-3);
  min-width: 0;
}

.ai-compare__scroll {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  overscroll-behavior-x: contain;
}

.ai-compare__table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 14px;
}

.ai-compare__table th,
.ai-compare__table td {
  padding: var(--s-3);
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
  line-height: 1.4;
}

.ai-compare__table tr:last-child > * {
  border-bottom: 0;
}

.ai-compare__head a {
  color: var(--text);
  font-weight: 700;
}

.ai-compare__criterion {
  position: sticky;
  left: 0;
  width: 132px;
  background: var(--surface);
  font-weight: 600;
  color: var(--text-2);
}

.ai-compare__corner {
  position: sticky;
  left: 0;
  background: var(--surface);
}

.ai-compare__unknown {
  color: var(--text-3);
  font-style: italic;
}

.ai-compare__note {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-2);
}
</style>
