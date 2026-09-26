<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiEmptyState, UiSurface, UiTabs, UiText } from '@/design-system'
import { PhotoAvatar } from '@/features'
import { getVenue, venueLocationLabel } from '@/mocks/selectors/places'
import { getAuthor } from '@/mocks/selectors/social'
import MeList from '@/pages/me/components/MeList.vue'
import { useLibrary } from '@/state/useLibrary'
import SettingsSubScreen from './components/SettingsSubScreen.vue'

/* ST1 · Скрытые авторы и заведения (§12.4, `/settings/hidden`): скрытое не показывается в Ленте и рекомендациях; «Показывать снова» возвращает. */
type Tab = 'authors' | 'venues'
const TABS = [
  { id: 'authors', label: 'Авторы' },
  { id: 'venues', label: 'Заведения' },
] as const

const library = useLibrary()
const tab = ref<Tab>('authors')
const authors = computed(() => library.hiddenAuthorIds.value.flatMap((id) => getAuthor(id) ?? []))
const venues = computed(() => library.hiddenVenueIds.value.flatMap((id) => getVenue(id) ?? []))
</script>

<template>
  <SettingsSubScreen title="Скрытые" hash="privacy">
    <UiTabs v-model="tab" :items="TABS" label="Что скрыто" />

    <template v-if="tab === 'authors'">
      <UiEmptyState v-if="authors.length === 0" title="Скрытых авторов нет" description="Скрыть автора можно в меню публикации (⋯)." />
      <MeList v-else>
        <li v-for="author in authors" :key="author.id">
          <UiSurface variant="panel" class="hidden__row">
            <PhotoAvatar :photo="author.avatar" :name="author.displayName" size="md" decorative />
            <span class="hidden__name">{{ author.displayName }}<UiText variant="caption" class="hidden__sub">@{{ author.username }}</UiText></span>
            <UiButton size="sm" variant="outline" @click="library.hideAuthor(author.id, false)">Показывать снова</UiButton>
          </UiSurface>
        </li>
      </MeList>
    </template>

    <template v-else>
      <UiEmptyState v-if="venues.length === 0" title="Скрытых заведений нет" description="Скрыть заведение можно в меню публикации (⋯)." />
      <MeList v-else>
        <li v-for="venue in venues" :key="venue.id">
          <UiSurface variant="panel" class="hidden__row hidden__row--venue">
            <span class="hidden__name">{{ venue.name }}<UiText variant="caption" class="hidden__sub">{{ venueLocationLabel(venue) }}</UiText></span>
            <UiButton size="sm" variant="outline" @click="library.hideVenue(venue.id, false)">Показывать снова</UiButton>
          </UiSurface>
        </li>
      </MeList>
    </template>
  </SettingsSubScreen>
</template>

<style scoped>
.hidden__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
}

.hidden__row--venue {
  grid-template-columns: minmax(0, 1fr) auto;
}

.hidden__name {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow-wrap: anywhere;
  font-weight: 600;
}

.hidden__sub {
  color: var(--text-3);
  font-weight: 400;
}
</style>
