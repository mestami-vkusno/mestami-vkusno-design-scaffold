import type { City, CityId } from '../types'

/** Заглушки вместо справочника городов с бэкенда (ТЗ §6.1: сервис мультигородской). */
export const CITIES: readonly City[] = [
  { id: 'spb', name: 'Санкт-Петербург' },
  { id: 'msk', name: 'Москва' },
]

export const DEFAULT_CITY_ID: CityId = 'spb'
