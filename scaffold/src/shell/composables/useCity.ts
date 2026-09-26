import { computed, readonly, ref } from 'vue'
import { CITIES, DEFAULT_CITY_ID } from '../data/cities'
import type { City, CityId } from '../types'

const STORAGE_KEY = 'mv-city'

function readSaved(): CityId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return CITIES.find((city) => city.id === saved)?.id ?? DEFAULT_CITY_ID
  } catch {
    return DEFAULT_CITY_ID
  }
}

const cityId = ref<CityId>(readSaved())

/**
 * Активный город (ТЗ §6.1). Заглушка без бэкенда: два города и выбор, который помнится в браузере.
 * Город меняет только явное действие пользователя (ТЗ §6.2).
 */
export function useCity() {
  const city = computed<City>(() => CITIES.find((item) => item.id === cityId.value) ?? CITIES[0]!)

  function setCity(next: CityId): void {
    cityId.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* хранилище недоступно: выбор живёт до перезагрузки */
    }
  }

  return { cities: CITIES, city, cityId: readonly(cityId), setCity }
}
