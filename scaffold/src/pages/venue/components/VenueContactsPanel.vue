<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon, UiLink, UiSurface, UiText } from '@/design-system'
import { MANAGEMENT_CONFIRMED_LABEL } from '@/mocks/dictionaries'
import { MOCK_TODAY, weekdayOf } from '@/mocks/time'
import type { Venue } from '@/mocks/types'
import { routeUrl, telHref, WEEKDAY_LABEL, WEEKDAY_ORDER, formatDayHours } from '../helpers'

const props = defineProps<{ venue: Venue; location: string }>()

const today = computed(() => weekdayOf(MOCK_TODAY))
const specialToday = computed(() => props.venue.specialHours?.find((entry) => entry.date === MOCK_TODAY))

const socialLabel: Record<'telegram' | 'vk', string> = { telegram: 'Telegram', vk: 'ВКонтакте' }
</script>

<template>
  <div class="venue-contacts">
    <UiSurface variant="panel" class="venue-contacts__block">
      <UiText as="h2" variant="h3">Информация</UiText>
      <p v-if="venue.managementConfirmed" class="venue-contacts__confirmed">
        <UiIcon name="shield" :size="16" />{{ MANAGEMENT_CONFIRMED_LABEL }}
      </p>
      <dl class="venue-contacts__list">
        <div class="venue-contacts__row">
          <dt>Адрес</dt>
          <dd>{{ venue.address }}<template v-if="location">, {{ location }}</template></dd>
        </div>
        <div v-if="venue.walkMinutesToMetro !== undefined" class="venue-contacts__row">
          <dt>Метро</dt>
          <dd>{{ venue.walkMinutesToMetro }} мин пешком</dd>
        </div>
        <div v-if="venue.phone" class="venue-contacts__row">
          <dt>Телефон</dt>
          <dd><a class="venue-contacts__link" :href="telHref(venue.phone)">{{ venue.phone }}</a></dd>
        </div>
        <div v-if="venue.website" class="venue-contacts__row">
          <dt>Сайт</dt>
          <dd><UiLink :href="venue.website" target="_blank" rel="noopener noreferrer">{{ venue.website }}</UiLink></dd>
        </div>
        <div v-if="venue.socials && venue.socials.length > 0" class="venue-contacts__row">
          <dt>Соцсети</dt>
          <dd class="venue-contacts__socials">
            <UiLink v-for="social in venue.socials" :key="social.kind" :href="social.url" target="_blank" rel="noopener noreferrer" icon-left="external">
              {{ socialLabel[social.kind] }}
            </UiLink>
          </dd>
        </div>
      </dl>
    </UiSurface>

    <UiSurface variant="panel" class="venue-contacts__block">
      <UiText as="h2" variant="h3">Время работы</UiText>
      <p v-if="specialToday" class="venue-contacts__special">
        Сегодня особый режим: {{ specialToday.note }} ({{ formatDayHours(specialToday.hours) }})
      </p>
      <ul v-if="venue.hours" class="venue-contacts__hours">
        <li v-for="day in WEEKDAY_ORDER" :key="day" class="venue-contacts__hours-row" :class="{ 'venue-contacts__hours-row--today': day === today }">
          <span>{{ WEEKDAY_LABEL[day] }}</span>
          <span>{{ formatDayHours(venue.hours[day]) }}</span>
        </li>
      </ul>
      <p v-else class="venue-contacts__unknown">Часы работы не указаны</p>
    </UiSurface>

    <UiSurface variant="panel" class="venue-contacts__map" role="img" :aria-label="`Карта: ${venue.address}`">
      <UiIcon name="pin" :size="28" />
      <UiText variant="caption">Карта пока недоступна в макете</UiText>
      <UiBadge variant="neutral">Заглушка карты</UiBadge>
    </UiSurface>
    <a class="venue-contacts__route" :href="routeUrl(venue)" target="_blank" rel="noopener noreferrer">
      <UiIcon name="pin" :size="18" />Построить маршрут
    </a>
  </div>
</template>

<style scoped>
.venue-contacts {
  display: grid;
  gap: var(--s-4);
}

.venue-contacts__block {
  display: grid;
  gap: var(--s-3);
}

.venue-contacts__confirmed {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--accent-fg);
  font-size: 13px;
}

.venue-contacts__list {
  display: grid;
  gap: var(--s-2);
  margin: 0;
}

.venue-contacts__row {
  display: grid;
  gap: 2px;
  font-size: 14px;
}

.venue-contacts__row dt {
  color: var(--text-3);
  font-size: 12.5px;
}

.venue-contacts__row dd {
  margin: 0;
  color: var(--text);
  overflow-wrap: anywhere;
}

.venue-contacts__link {
  color: inherit;
  text-decoration: none;
}

.venue-contacts__socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

.venue-contacts__special {
  margin: 0;
  padding: var(--s-2) var(--s-3);
  background: var(--surface-2);
  border-radius: var(--r-sm);
  font-size: 13px;
  color: var(--text-2);
}

.venue-contacts__hours {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.venue-contacts__hours-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  padding: 6px 0;
  font-size: 13.5px;
  color: var(--text-2);
}

.venue-contacts__hours-row--today {
  color: var(--accent-fg);
  font-weight: 600;
}

.venue-contacts__unknown {
  margin: 0;
  color: var(--text-3);
  font-size: 14px;
}

.venue-contacts__map {
  display: grid;
  place-items: center;
  gap: var(--s-2);
  min-height: 160px;
  color: var(--text-3);
  text-align: center;
}

.venue-contacts__route {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  min-height: 44px;
  padding: 0 var(--s-4);
  border-radius: var(--r-md);
  background: var(--lime);
  color: var(--on-accent);
  font: 600 15px/1 var(--font);
  text-decoration: none;
  transition: background var(--dur-hover) ease;
}

@media (hover: hover) and (pointer: fine) {
  .venue-contacts__route:hover {
    background: var(--lime-hover);
  }
}
</style>
