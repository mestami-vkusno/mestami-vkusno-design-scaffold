import type { MediaPickerUploader } from './types'

export interface SimulateMediaUploadOptions {
  /** Сколько длится «загрузка». */
  durationMs?: number
  /** Вернуть `true`, чтобы загрузка этого файла на этой попытке (с 1) закончилась ошибкой. */
  failWhen?: (file: File, attempt: number) => boolean
}

/** Имитация загрузки для мока и витрины: растит прогресс до конца или падает на 60 % — на сервер ничего не уходит. */
export function simulateMediaUpload({ durationMs = 1800, failWhen }: SimulateMediaUploadOptions = {}): MediaPickerUploader {
  const attempts = new WeakMap<File, number>()

  return (file, report, signal) =>
    new Promise<void>((resolve, reject) => {
      const attempt = (attempts.get(file) ?? 0) + 1
      attempts.set(file, attempt)
      const fails = failWhen?.(file, attempt) === true
      const stop = fails ? 60 : 100
      const started = performance.now()

      const timer = setInterval(() => {
        const progress = Math.min(stop, Math.round(((performance.now() - started) / durationMs) * 100))
        report(progress)
        if (progress < stop) return
        clearInterval(timer)
        if (fails) reject(new Error('simulated upload failure'))
        else resolve()
      }, 90)

      signal.addEventListener('abort', () => {
        clearInterval(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
}
