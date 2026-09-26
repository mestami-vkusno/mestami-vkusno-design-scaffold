/**
 * Сессия для шапки и страниц: гость или тестовый пользователь «Мария». Фасад над `@/state/session`:
 * оболочка и страницы берут вход отсюда. Возвращает `viewer`, `userId`, `isSignedIn`, `signIn()`, `signOut()`.
 * Экран входа — задача 0009; в моке `signIn()` сразу ставит тестового пользователя.
 */
export { useViewer } from '@/state/session'
export { resetMock } from '@/state/reset'
export type { SessionViewer } from '@/state/session'
