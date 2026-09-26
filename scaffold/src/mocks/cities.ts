/* Города, районы, местности и станции метро. Два города: Санкт-Петербург и Москва. */
import type { Area, City, CityId, District, MetroStation } from './types'

export const DEFAULT_CITY_ID: CityId = 'spb'

export const cities: readonly City[] = [
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    genitive: 'Санкт-Петербурга',
    timezone: 'Europe/Moscow',
    center: { lat: 59.9343, lng: 30.3351 },
  },
  {
    id: 'msk',
    name: 'Москва',
    genitive: 'Москвы',
    timezone: 'Europe/Moscow',
    center: { lat: 55.7558, lng: 37.6173 },
  },
]

export const districts: readonly District[] = [
  { id: 'spb-petrogradsky', cityId: 'spb', name: 'Петроградский район' },
  { id: 'spb-central', cityId: 'spb', name: 'Центральный район' },
  { id: 'spb-admiralteysky', cityId: 'spb', name: 'Адмиралтейский район' },
  { id: 'spb-vasileostrovsky', cityId: 'spb', name: 'Василеостровский район' },
  { id: 'spb-primorsky', cityId: 'spb', name: 'Приморский район' },
  { id: 'msk-tverskoy', cityId: 'msk', name: 'Тверской район' },
  { id: 'msk-khamovniki', cityId: 'msk', name: 'Хамовники' },
  { id: 'msk-arbat', cityId: 'msk', name: 'Арбат' },
  { id: 'msk-presnensky', cityId: 'msk', name: 'Пресненский район' },
  { id: 'msk-zamoskvorechye', cityId: 'msk', name: 'Замоскворечье' },
  { id: 'msk-basmanny', cityId: 'msk', name: 'Басманный район' },
]

export const areas: readonly Area[] = [
  { id: 'spb-petrogradka', cityId: 'spb', districtId: 'spb-petrogradsky', name: 'Петроградка' },
  { id: 'spb-vasilyevsky', cityId: 'spb', districtId: 'spb-vasileostrovsky', name: 'Васильевский остров' },
  { id: 'spb-historic', cityId: 'spb', districtId: 'spb-central', name: 'Исторический центр' },
  { id: 'spb-kolomna', cityId: 'spb', districtId: 'spb-admiralteysky', name: 'Коломна' },
  { id: 'msk-patriarshie', cityId: 'msk', districtId: 'msk-presnensky', name: 'Патриаршие' },
  { id: 'msk-chistye', cityId: 'msk', districtId: 'msk-basmanny', name: 'Чистые пруды' },
]

export const metroStations: readonly MetroStation[] = [
  { id: 'spb-petrogradskaya', cityId: 'spb', name: 'Петроградская' },
  { id: 'spb-gorkovskaya', cityId: 'spb', name: 'Горьковская' },
  { id: 'spb-nevsky', cityId: 'spb', name: 'Невский проспект' },
  { id: 'spb-chernyshevskaya', cityId: 'spb', name: 'Чернышевская' },
  { id: 'spb-vasileostrovskaya', cityId: 'spb', name: 'Василеостровская' },
  { id: 'spb-admiralteyskaya', cityId: 'spb', name: 'Адмиралтейская' },
  { id: 'spb-primorskaya', cityId: 'spb', name: 'Приморская' },
  { id: 'spb-sadovaya', cityId: 'spb', name: 'Садовая' },
  { id: 'msk-mayakovskaya', cityId: 'msk', name: 'Маяковская' },
  { id: 'msk-kropotkinskaya', cityId: 'msk', name: 'Кропоткинская' },
  { id: 'msk-arbatskaya', cityId: 'msk', name: 'Арбатская' },
  { id: 'msk-tretyakovskaya', cityId: 'msk', name: 'Третьяковская' },
  { id: 'msk-kitay-gorod', cityId: 'msk', name: 'Китай-город' },
  { id: 'msk-chistye-prudy', cityId: 'msk', name: 'Чистые пруды' },
]
