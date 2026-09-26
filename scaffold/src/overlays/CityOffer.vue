<script setup lang="ts">
import { computed } from 'vue'
import { UiBanner, UiButton } from '@/design-system'
import { useCity } from '@/shell/composables/useCity'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { CITY_POINTS, cityOffer, closeCityOffer, dismissCityOffer } from './cityOffer'

/* O2 · Предложение сменить город (§6.2): не окно, а баннер под шапкой. «Переключить» меняет город, «Остаться» запоминает отказ на сеанс. */
const { city, setCity } = useCity()
const target = computed(() => CITY_POINTS.find((item) => item.id === cityOffer.value))
const stay = computed(() => CITY_POINTS.find((item) => item.id === city.value.id)?.prepositional ?? city.value.name)

function switchCity(): void {
  if (target.value === undefined) return
  setCity(target.value.id)
  closeCityOffer()
}
</script>

<template>
  <div v-if="target" class="city-offer">
    <ShellContainer>
      <UiBanner variant="info" icon="pin" animated>
        Похоже, вы в {{ target.prepositional }}. Показать места {{ target.genitive }}?
        <template #action>
          <UiButton size="sm" @click="switchCity">Переключить на {{ target.name }}</UiButton>
          <UiButton size="sm" variant="ghost" @click="dismissCityOffer">Остаться в {{ stay }}</UiButton>
        </template>
      </UiBanner>
    </ShellContainer>
  </div>
</template>

<style scoped>
.city-offer {
  padding-block: var(--s-2);
}
</style>
