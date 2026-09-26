import { readonly, ref } from 'vue'
import type { CityId } from '@/shell/types'

/*
  O2 · Предложение сменить город (§6.2). Если устройство оказалось в другом городе, под шапкой появляется баннер
  «Похоже, вы в Казани. Показать места Казани?». Город меняет только явное действие пользователя, отказ помнится до конца сеанса.
  Источники «города устройства» в моке: определение по координатам после согласия на геолокацию (O3, `offerFromCoordinates`)
  и адрес `?device-city=msk` для проверки без разрешения браузера (assumption: настоящего определения по IP в моке нет).
  Лёгкий модуль основного чанка: данных заведений не импортирует.
*/

interface CityPoint {
  readonly id: CityId
  readonly lat: number
  readonly lng: number
  /** Предложный падеж для «Похоже, вы в …». */
  readonly prepositional: string
  /** Родительный падеж: «Показать места …». */
  readonly genitive: string
  readonly name: string
}

/** Центры городов: те же, что в `@/mocks/cities`; продублированы, чтобы не тянуть данные в основной чанк. */
export const CITY_POINTS: readonly CityPoint[] = [
  { id: 'spb', lat: 59.9343, lng: 30.3351, name: 'Санкт-Петербург', prepositional: 'Санкт-Петербурге', genitive: 'Санкт-Петербурга' },
  { id: 'msk', lat: 55.7558, lng: 37.6173, name: 'Москва', prepositional: 'Москве', genitive: 'Москвы' },
]

const REFUSED_KEY = 'mv-city-offer-refused'
const offered = ref<CityId | null>(null)

function refused(): readonly string[] {
  try {
    return JSON.parse(sessionStorage.getItem(REFUSED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

/** Предложение показывается, если город устройства отличается от активного и пользователь его в этом сеансе не отклонял. */
export function offerCity(deviceCity: CityId, activeCity: CityId): void {
  if (deviceCity === activeCity || refused().includes(deviceCity)) return
  offered.value = deviceCity
}

/** Ближайший к координатам город по прямой (для двух городов достаточно). */
export function nearestCity(lat: number, lng: number): CityId {
  let best = CITY_POINTS[0]!
  let bestDistance = Number.POSITIVE_INFINITY
  for (const city of CITY_POINTS) {
    const distance = (city.lat - lat) ** 2 + (city.lng - lng) ** 2
    if (distance < bestDistance) {
      best = city
      bestDistance = distance
    }
  }
  return best.id
}

/** Вызывается после согласия на геолокацию (O3): координаты никуда не отправляются, из них берётся только ближайший город. */
export function offerFromCoordinates(lat: number, lng: number, activeCity: CityId): void {
  offerCity(nearestCity(lat, lng), activeCity)
}

export function dismissCityOffer(): void {
  const city = offered.value
  offered.value = null
  if (city === null) return
  try {
    sessionStorage.setItem(REFUSED_KEY, JSON.stringify([...refused(), city]))
  } catch {
    /* хранилище недоступно: отказ живёт до перезагрузки */
  }
}

export function closeCityOffer(): void {
  offered.value = null
}

export const cityOffer = readonly(offered)

/** Проверка без разрешения браузера: `?device-city=msk` — устройство «в Москве». Читается один раз при старте. */
export function readDeviceCityFromUrl(activeCity: CityId): void {
  if (typeof window === 'undefined') return
  const value = new URLSearchParams(window.location.search).get('device-city')
  const city = CITY_POINTS.find((item) => item.id === value)
  if (city !== undefined) offerCity(city.id, activeCity)
}
