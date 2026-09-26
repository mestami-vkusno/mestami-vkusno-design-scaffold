<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiButton, UiIcon, UiLink, UiSelect, UiSheet, UiStack, UiText } from '@/design-system'
import { districtsByCity } from '@/mocks/selectors/places'
import { offerFromCoordinates } from '@/overlays/cityOffer'
import type { CityId } from '@/mocks/types'

/*
  O3 · Пояснение перед геолокацией (§6.4, §6.4А, §8.7). Отказ не ломает Поиск: закрытие без выбора оставляет
  фильтры как есть, а «Указать вручную» даёт опорный район без запроса разрешения браузера.
  В моке расстояние у заведений — фиксированное поле данных, а не настоящие координаты: любой исход (разрешение,
  отказ, ручная точка) включает сортировку «Рядом со мной» одинаково, реальные координаты никуда не передаются.
*/
type View = 'ask' | 'denied' | 'manual'

const props = defineProps<{ cityId: CityId }>()
const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Пользователь согласился (после разрешения браузера или ручной точки): включить сортировку «Рядом со мной». */
  resolved: [anchorLabel: string]
}>()

const view = ref<View>('ask')
const districtId = ref('')

watch(isOpen, (open) => {
  if (open) {
    view.value = 'ask'
    districtId.value = ''
  }
})

const districts = computed(() => districtsByCity(props.cityId).map((district) => ({ value: district.id, label: district.name })))

async function requestGeolocation(): Promise<void> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    view.value = 'denied'
    return
  }
  await new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        isOpen.value = false
        // O2: если устройство в другом городе, под шапкой предлагается его сменить; сам город не меняется (§6.2).
        offerFromCoordinates(position.coords.latitude, position.coords.longitude, props.cityId)
        emit('resolved', 'вашего местоположения')
        resolve()
      },
      () => {
        view.value = 'denied'
        resolve()
      },
      { timeout: 4000 },
    )
  })
}

function confirmManual(): void {
  const district = districts.value.find((item) => item.value === districtId.value)
  isOpen.value = false
  emit('resolved', district?.label ?? 'выбранного района')
}

function dismiss(): void {
  isOpen.value = false
}
</script>

<template>
  <UiSheet v-model:open="isOpen" title="Показать места рядом?">
    <UiStack v-if="view === 'ask'" :gap="5" align="center" class="geo-consent">
      <UiIcon name="pin" :size="40" />
      <UiText variant="body" class="geo-consent__text">
        Определим ваше местоположение, чтобы найти заведения рядом. Историю перемещений мы не сохраняем, точные координаты заведениям не передаём.
      </UiText>
      <UiStack :gap="2" class="geo-consent__actions">
        <UiButton variant="primary" block @click="requestGeolocation">Разрешить</UiButton>
        <UiButton variant="ghost" block @click="dismiss">Не сейчас</UiButton>
      </UiStack>
      <UiLink href="#" variant="muted" @click.prevent="view = 'manual'">Указать точку вручную</UiLink>
    </UiStack>

    <UiStack v-else-if="view === 'denied'" :gap="5" align="center" class="geo-consent">
      <UiIcon name="pin" :size="40" />
      <UiText variant="body" class="geo-consent__text">Доступ к геолокации выключен. Поиск продолжит работать — укажите район, и мы будем считать его вашей опорной точкой.</UiText>
      <UiStack :gap="3" class="geo-consent__actions">
        <UiSelect v-model="districtId" :options="districts" placeholder="Выбрать район" />
        <UiButton variant="primary" block :disabled="districtId === ''" @click="confirmManual">Указать точку</UiButton>
        <UiButton variant="ghost" block @click="dismiss">Не сейчас</UiButton>
      </UiStack>
    </UiStack>

    <UiStack v-else :gap="5" align="center" class="geo-consent">
      <UiText variant="body" class="geo-consent__text">Выберите район — мы будем считать его вашей опорной точкой для «Рядом со мной».</UiText>
      <UiStack :gap="3" class="geo-consent__actions">
        <UiSelect v-model="districtId" :options="districts" placeholder="Выбрать район" />
        <UiButton variant="primary" block :disabled="districtId === ''" @click="confirmManual">Указать точку</UiButton>
        <UiButton variant="ghost" block @click="dismiss">Не сейчас</UiButton>
      </UiStack>
    </UiStack>
  </UiSheet>
</template>

<style scoped>
.geo-consent {
  padding-bottom: var(--s-2);
  text-align: center;
}

.geo-consent__text {
  color: var(--text-2);
}

.geo-consent__actions {
  width: 100%;
}
</style>
