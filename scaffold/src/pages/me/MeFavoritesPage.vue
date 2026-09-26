<script setup lang="ts">
import { computed } from 'vue'
import { UiEmptyState, UiStack, UiText } from '@/design-system'
import { venueLocationLabel } from '@/mocks/selectors/places'
import { VenueRow } from '@/features'
import { FavoriteButton } from '@/features/actions'
import { useViewer } from '@/shell/composables/useViewer'
import { useLibrary } from '@/state/useLibrary'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import MeGuestState from './components/MeGuestState.vue'

/*
  M2 «Избранное» (§18, §20.2, `/me/favorites`): избранные заведения, приватно по умолчанию — список не виден
  ресторану и подписчикам. Ключевой узел пути J3 (гость → Избранное → вход → возврат → уже в Избранном,
  `screens-without-reference.md`): гостя сюда пускает роутер (страница целиком приватна), а «убрать из
  Избранного» — то же действие, что и добавление на карточке заведения (`FavoriteButton`), общее состояние
  библиотеки просто покажет список короче.
*/

const { isSignedIn } = useViewer()
const library = useLibrary()
const favorites = computed(() => library.favorites.value)
</script>

<template>
  <main class="me-favorites">
    <ShellContainer>
      <MeGuestState
        v-if="!isSignedIn"
        title="Избранное"
        description="Войдите, чтобы сохранять любимые заведения и быстро возвращаться к ним."
      />
      <UiStack v-else :gap="4" align="start">
        <UiText variant="h1">Избранное</UiText>

        <UiEmptyState
          v-if="favorites.length === 0"
          title="Пока нет избранного"
          description="Отмечайте заведения значком сердца на карточке или странице заведения — они появятся здесь."
        />
        <div v-else class="me-favorites__list">
          <VenueRow v-for="venue in favorites" :key="venue.id" :venue="venue" :location="venueLocationLabel(venue)" deferred>
            <template #action><FavoriteButton :venue-id="venue.id" :subject="venue.name" variant="plain" /></template>
          </VenueRow>
        </div>
      </UiStack>
    </ShellContainer>
  </main>
</template>

<style scoped>
.me-favorites {
  padding-block: var(--s-6) var(--s-16);
}

.me-favorites__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  width: 100%;
}
</style>
