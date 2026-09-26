/*
  Тексты интерфейса общих блоков: подписи, названия для скринридера, заглушки.
  Единое место, чтобы блоки не хранили русские строки в разметке; страница может подменить любую подпись пропсом.
*/
import type { VenuePostTopic } from '@/mocks/types'

export const FEATURE_LABELS = {
  viewAll: 'Смотреть все',
  favorite: 'В избранное',
  favoriteOn: 'В избранном',
  follow: 'Подписаться',
  following: 'Вы подписаны',
  like: 'Нравится',
  save: 'Сохранить',
  share: 'Поделиться',
  comments: 'Комментарии',
  reply: 'Ответить',
  more: 'Действия',
  edit: 'Редактировать',
  remove: 'Удалить',
  expand: 'ещё',
  collapse: 'свернуть',
  railPrev: 'Назад',
  railNext: 'Вперёд',
  venueBadge: 'Заведение',
  newBadge: 'NEW',
  eventToday: 'Сегодня событие',
  editorial: 'Редакция',
  privateCollection: 'Приватная',
  draft: 'Черновик',
  closedProfile: 'Закрытый профиль',
  openVenue: 'Открыть заведение',
  photosOf: 'фото',
  sending: 'Отправляем…',
  sendFailed: 'Не отправлено',
  retry: 'Повторить',
  report: 'Пожаловаться',
  reviewPending: 'На проверке',
  rescheduledWas: 'Было',
  dishGone: 'позиции больше нет в меню',
  free: 'Бесплатно',
  placesCount: ['место', 'места', 'мест'],
  followersCount: ['подписчик', 'подписчика', 'подписчиков'],
  linkCopied: 'Ссылка скопирована',
  linkCopyFailed: 'Не удалось скопировать ссылку',
  aiAsk: 'Спросить AI',
  aiField: 'Запрос к ИИ',
  aiSend: 'Отправить запрос',
  aiPremiumBadge: 'Премиум',
  aiPremiumNote: 'ИИ доступен только в Премиум',
} as const

export const VENUE_POST_TOPIC_LABEL: Readonly<Record<VenuePostTopic, string>> = {
  news: 'Новости',
  menu: 'Меню',
  event: 'Событие',
  behind_the_scenes: 'За кулисами',
}
