/*
  Центр активности (§19): вкладки «Все» (объединение), «Активность», «Обновления», «Системные».
  Уведомления тестового пользователя: социальные, обновления заведений и событий, системные
  (модерация, безопасность, платежи, перенос и отмена сохранённых событий).
*/
import { MOCK_USER_ID } from './library'
import { dateTimeAt } from './time'
import type { AppNotification, NotificationKind, NotificationTab, NotificationTarget } from './types'

interface Seed {
  readonly id: string
  readonly tab: NotificationTab
  readonly kind: NotificationKind
  readonly title: string
  readonly body: string
  readonly ago: readonly [days: number, time: string]
  readonly read?: boolean
  readonly target?: NotificationTarget
  readonly actors?: readonly string[]
}

const seeds: readonly Seed[] = [
  { id: 'n-01', tab: 'activity', kind: 'new_follower', title: 'Новый подписчик', body: 'Анна Ветрова подписалась на вас.', ago: [0, '09:15'], target: { kind: 'author', id: 'u-anna' }, actors: ['u-anna'] },
  { id: 'n-02', tab: 'activity', kind: 'likes', title: 'Публикации ставят отметки «нравится»', body: 'Анна Ветрова и ещё 2 человека отметили вашу публикацию о Birch.', ago: [0, '08:00'], target: { kind: 'post', id: 'post-04' }, actors: ['u-anna', 'u-dmitry', 'u-elena'] },
  { id: 'n-03', tab: 'activity', kind: 'comment', title: 'Новый комментарий', body: 'Дмитрий Лебедев: «Соглашусь, зал уютный. Сколько ждали заказ?»', ago: [6, '23:10'], read: true, target: { kind: 'post', id: 'post-04' }, actors: ['u-dmitry'] },
  { id: 'n-04', tab: 'activity', kind: 'reply', title: 'Ответ на ваш комментарий', body: 'София Данилова ответила: «Минут десять, всё свежее».', ago: [5, '20:45'], read: true, target: { kind: 'post', id: 'post-08' }, actors: ['u-sofia'] },
  { id: 'n-05', tab: 'activity', kind: 'new_follower', title: 'Новый подписчик', body: 'Павел Гринёв подписался на вас.', ago: [3, '18:00'], read: true, target: { kind: 'author', id: 'u-pavel' }, actors: ['u-pavel'] },
  { id: 'n-06', tab: 'updates', kind: 'venue_update', title: 'Birch обновил меню', body: 'Сезонное меню: осень. Добавили тыкву на углях и десерт из груши.', ago: [2, '11:00'], target: { kind: 'venue', id: 'birch' } },
  { id: 'n-07', tab: 'updates', kind: 'venue_update', title: 'Nola скоро открывается', body: 'Через две недели открываем двери. Меню и часы появятся ближе к открытию.', ago: [2, '14:20'], target: { kind: 'venue', id: 'nola' } },
  { id: 'n-08', tab: 'updates', kind: 'event_relevant', title: 'Событие в вашем любимом месте', body: 'Гостевой ужин двух шефов в Harvest — в субботу в 19:00.', ago: [1, '15:30'], target: { kind: 'event', id: 'event-guest-dinner-harvest' } },
  { id: 'n-09', tab: 'updates', kind: 'event_relevant', title: 'Сегодня в 20:00', body: 'Джазовый вечер в El Copitas Bar. Вход свободный.', ago: [0, '10:00'], target: { kind: 'event', id: 'event-jazz-copitas' } },
  { id: 'n-10', tab: 'system', kind: 'event_rescheduled', title: 'Событие перенесено', body: 'Ужин по-сицилийски в Osteria da Bruno перенесён на новую дату.', ago: [2, '12:00'], target: { kind: 'event', id: 'event-sicilian-osteria' } },
  { id: 'n-11', tab: 'system', kind: 'event_cancelled', title: 'Событие отменено', body: 'DJ-сет в пятницу в Futura отменён. Заведение приостановило работу.', ago: [1, '18:00'], target: { kind: 'event', id: 'event-dj-futura' } },
  { id: 'n-12', tab: 'system', kind: 'moderation', title: 'Нужны изменения в публикации', body: 'Публикация об Osteria da Bruno: уберите упоминание промокода и отправьте снова.', ago: [2, '10:00'], target: { kind: 'post', id: 'post-22' } },
  { id: 'n-13', tab: 'system', kind: 'moderation', title: 'Публикация отклонена', body: 'Публикация о Forno Napoli не прошла модерацию. Причина указана в карточке публикации.', ago: [11, '10:00'], read: true, target: { kind: 'post', id: 'post-27' } },
  { id: 'n-14', tab: 'system', kind: 'complaint_result', title: 'Жалоба рассмотрена', body: 'Мы рассмотрели вашу жалобу на публикацию и оставили её без изменений. Вы можете подать апелляцию.', ago: [4, '12:00'], read: true, target: { kind: 'post', id: 'post-19' } },
  { id: 'n-15', tab: 'system', kind: 'security', title: 'Вход с нового устройства', body: 'Мы заметили вход в аккаунт с нового устройства. Если это были не вы, смените способ входа.', ago: [9, '08:30'], read: true },
  { id: 'n-16', tab: 'system', kind: 'payment', title: 'Премиум закончился', body: 'Срок Премиум истёк. Диалоги с ИИ остаются доступны для чтения, новые запросы — по подписке.', ago: [14, '00:05'], read: true },
]

export const notifications: readonly AppNotification[] = seeds.map((seed) => ({
  id: seed.id,
  userId: MOCK_USER_ID,
  tab: seed.tab,
  kind: seed.kind,
  title: seed.title,
  body: seed.body,
  at: dateTimeAt(-seed.ago[0], seed.ago[1]),
  read: seed.read ?? false,
  ...(seed.target === undefined ? {} : { target: seed.target }),
  ...(seed.actors === undefined ? {} : { actorIds: seed.actors }),
}))
