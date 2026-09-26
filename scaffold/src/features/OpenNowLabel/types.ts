export interface OpenNowLabelProps {
  /** `open` — открыто сейчас, `closed` — закрыто, `unknown` — часы неизвестны (это не «закрыто», §9.4). */
  state: 'open' | 'closed' | 'unknown'
  /** Готовая подпись из селектора `openStatusLabel(venue)`: «Открыто до 00:00», «Откроется в 18:00». */
  label: string
}
