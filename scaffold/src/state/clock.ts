import { MOCK_NOW } from '@/mocks/time'
import type { IsoDateTime } from '@/mocks/types'

/*
  «Сейчас» для того, что пользователь создаёт в моке (черновик, подборка, отзыв): стартует с `MOCK_NOW` мока
  и идёт вперёд в реальном времени. Так новые записи всегда новее данных мока и остаются упорядоченными между собой,
  а подписи «только что» и «N минут назад» (`formatAgo`) считаются от той же точки, что и остальной мок.
*/

const started = Date.now()
/** Часовой пояс мока — `+03:00`. */
const OFFSET_MS = 3 * 60 * 60 * 1000

export function mockClock(): IsoDateTime {
  const shifted = new Date(Date.parse(MOCK_NOW) + (Date.now() - started) + OFFSET_MS)
  return `${shifted.toISOString().slice(0, 19)}+03:00`
}
