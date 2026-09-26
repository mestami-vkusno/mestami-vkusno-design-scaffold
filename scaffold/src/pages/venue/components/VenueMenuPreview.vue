<script setup lang="ts">
import { UiText } from '@/design-system'
import { DishRow, SectionHeader } from '@/features'
import type { MenuItem, VenueId } from '@/mocks/types'

defineProps<{ venueId: VenueId; items: readonly MenuItem[] }>()
</script>

<template>
  <section class="venue-menu-preview" aria-labelledby="venue-menu-title">
    <SectionHeader id="venue-menu-title" title="Меню" :href="`/venue/${venueId}/menu`" link-label="Смотреть всё меню" />
    <div v-if="items.length > 0" class="venue-menu-preview__list">
      <DishRow v-for="item in items" :key="item.id" :item="item" :href="`/venue/${venueId}/menu/${item.id}`" deferred />
    </div>
    <UiText v-else variant="body">Меню пока не опубликовано.</UiText>
  </section>
</template>

<style scoped>
.venue-menu-preview {
  content-visibility: auto;
  contain-intrinsic-size: auto 420px;
}

.venue-menu-preview__list {
  display: flex;
  flex-direction: column;
}
</style>
