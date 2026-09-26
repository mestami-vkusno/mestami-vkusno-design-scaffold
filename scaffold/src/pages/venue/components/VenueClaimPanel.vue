<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiLink, UiSheet, UiText } from '@/design-system'
import type { VenueId } from '@/mocks/types'

const props = defineProps<{ venueId: VenueId }>()

const open = ref(false)
// Личный кабинет ресторана — другой контур продукта (restaurant-lk); ссылка внешняя, venue_id — предположение о параметре.
const claimUrl = `https://lk.mestami-vkusno.ru/claim?venue_id=${props.venueId}`
</script>

<template>
  <div class="venue-claim">
    <UiLink variant="muted" href="#" @click.prevent="open = true">Вы представляете это заведение?</UiLink>

    <UiSheet v-model:open="open" title="Управление заведением">
      <UiText variant="body">
        Управление подтверждается в кабинете для заведений. Публичная карточка остаётся на месте и дублей не создаётся.
      </UiText>
      <div class="venue-claim__actions">
        <UiButton block icon-right="external" :href="claimUrl" target="_blank" rel="noopener noreferrer">Перейти в кабинет для заведений</UiButton>
        <UiButton variant="ghost" block @click="open = false">Закрыть</UiButton>
      </div>
    </UiSheet>
  </div>
</template>

<style scoped>
.venue-claim__actions {
  display: grid;
  gap: var(--s-2);
  margin-top: var(--s-4);
}
</style>
