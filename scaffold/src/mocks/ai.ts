/*
  Диалоги с ИИ Премиум (§23). Два диалога тестового пользователя: подбор места и сравнение 2–4 заведений.
  Ответ: короткий вывод + карточки объектов + причины + компромиссы + действия + подсказки (§23.5).
  Все факты в причинах и сравнении взяты из данных мока (чек, район, часы, оценки, события); неизвестное — `null`.
  Гость и бесплатная версия эти данные не видят: приложение показывает им только предложение подписки (§23.1),
  а после окончания Премиум старые диалоги остаются доступными для чтения (§23.8).
*/
import { MOCK_USER_ID } from './library'
import { dateTimeAt } from './time'
import type { AiConversation } from './types'

export const aiConversations: readonly AiConversation[] = [
  {
    id: 'ai-conv-1',
    userId: MOCK_USER_ID,
    title: 'Место для свидания на Петроградке',
    context: { kind: 'general' },
    aiPersonalLibraryAccess: true,
    aiPrivateTextAccess: false,
    createdAt: dateTimeAt(-2, '20:10'),
    updatedAt: dateTimeAt(-2, '20:12'),
    messages: [
      {
        role: 'user',
        id: 'ai-1-u1',
        text: 'Уютное место для свидания на Петроградке до 7000 ₽ на двоих',
        at: dateTimeAt(-2, '20:10'),
      },
      {
        role: 'assistant',
        id: 'ai-1-a1',
        summary:
          'На Петроградской стороне для свидания подходят два ресторана со средним чеком до 3 500 ₽ на человека и один более простой вариант.',
        cards: [
          {
            object: { kind: 'venue', id: 'birch' },
            reasons: ['Петроградский район, около 12 минут пешком от метро «Петроградская»', 'Средний чек около 3 000 ₽ на человека', 'В описании: спокойная атмосфера и открытая кухня'],
            tradeoffs: ['Некоторые посетители отмечают шум вечером', 'Столик лучше бронировать заранее'],
          },
          {
            object: { kind: 'venue', id: 'harvest' },
            reasons: ['Петроградский район, около 8 минут пешком от метро «Петроградская»', 'Средний чек около 3 200 ₽ на человека', 'Есть веранда и бронирование'],
            tradeoffs: ['Работает по расписанию с перерывом: 12:00–16:00 и 18:00–23:00', 'По воскресеньям закрыто'],
          },
          {
            object: { kind: 'venue', id: 'forno-napoli' },
            reasons: ['Петроградка, около 5 минут пешком от метро «Горьковская»', 'Средний чек около 1 500 ₽ на человека'],
            tradeoffs: ['Формат кафе: нет метки «для свидания»', 'В опубликованных данных сервиса не указано, можно ли забронировать столик'],
          },
        ],
        actions: [
          { kind: 'compare', label: 'Сравнить Birch и Harvest' },
          { kind: 'add_to_favorites', label: 'Сохранить Harvest', object: { kind: 'venue', id: 'harvest' } },
          { kind: 'save_collection_draft', label: 'Собрать черновик подборки' },
        ],
        followUps: ['А если хочется веранду?', 'Что есть по выходным?', 'Покажи с живой музыкой'],
        at: dateTimeAt(-2, '20:10'),
      },
      {
        role: 'user',
        id: 'ai-1-u2',
        text: 'Какие события будут на выходных в этих местах?',
        at: dateTimeAt(-2, '20:12'),
      },
      {
        role: 'assistant',
        id: 'ai-1-a2',
        summary: 'В Harvest в субботу гостевой ужин двух шефов, других событий в этих трёх местах на выходных нет.',
        cards: [
          {
            object: { kind: 'event', id: 'event-guest-dinner-harvest' },
            reasons: ['Суббота, 19:00', 'Стоимость 4 500 ₽', 'Организатор: Birch × Harvest'],
            tradeoffs: ['Одна подача на вечер, места ограничены'],
          },
        ],
        actions: [{ kind: 'open', label: 'Открыть событие', object: { kind: 'event', id: 'event-guest-dinner-harvest' } }],
        followUps: ['Покажи события в других районах', 'Что бесплатное по музыке?'],
        at: dateTimeAt(-2, '20:12'),
      },
    ],
  },
  {
    id: 'ai-conv-2',
    userId: MOCK_USER_ID,
    title: 'Сравнение Birch, Harvest и Sintoho',
    context: { kind: 'general' },
    aiPersonalLibraryAccess: true,
    aiPrivateTextAccess: false,
    createdAt: dateTimeAt(-9, '18:00'),
    updatedAt: dateTimeAt(-9, '18:01'),
    messages: [
      {
        role: 'user',
        id: 'ai-2-u1',
        text: 'Сравни Birch, Harvest и Sintoho по цене и расположению',
        at: dateTimeAt(-9, '18:00'),
      },
      {
        role: 'assistant',
        id: 'ai-2-a1',
        summary:
          'Все три места в одном ценовом диапазоне, но Sintoho чуть дешевле и находится на Васильевском острове; общего победителя нет — зависит от того, что важнее.',
        cards: [
          {
            object: { kind: 'venue', id: 'birch' },
            reasons: ['Ближе всего к вам по расстоянию: 1,8 км', 'Уже в Избранном'],
            tradeoffs: ['Вечером бывает шумно'],
          },
          {
            object: { kind: 'venue', id: 'harvest' },
            reasons: ['Тихий зал и веранда', 'Уже в Избранном'],
            tradeoffs: ['Перерыв в работе с 16:00 до 18:00'],
          },
          {
            object: { kind: 'venue', id: 'sintoho' },
            reasons: ['Самый низкий средний чек из трёх: около 2 800 ₽', 'Вы бывали здесь и поставили 5'],
            tradeoffs: ['Дальше всего: 3,4 км', 'Меньше оценок, чем у Birch'],
          },
        ],
        comparison: {
          venueIds: ['birch', 'harvest', 'sintoho'],
          rows: [
            { criterion: 'Средний чек на человека', values: { birch: '≈ 3 000 ₽', harvest: '≈ 3 200 ₽', sintoho: '≈ 2 800 ₽' } },
            { criterion: 'Район', values: { birch: 'Петроградский район', harvest: 'Петроградский район', sintoho: 'Василеостровский район' } },
            { criterion: 'Расстояние', values: { birch: '1,8 км', harvest: '1,9 км', sintoho: '3,4 км' } },
            { criterion: 'Оценка', values: { birch: '4,7 (1287 отзывов)', harvest: '4,7 (845 отзывов)', sintoho: '4,5 (611 отзывов)' } },
            { criterion: 'Часы работы в четверг', values: { birch: '12:00–00:00', harvest: '12:00–16:00, 18:00–23:00', sintoho: '12:00–23:00' } },
            { criterion: 'События', values: { birch: 'Ужин с шефом сегодня в 19:00', harvest: 'Гостевой ужин двух шефов в субботу', sintoho: 'Гастрономический сет завтра в 19:30' } },
            { criterion: 'Что пишут посетители', values: { birch: 'Хвалят тартар и утку; иногда отмечают шум', harvest: 'Хвалят дегустационный сет и тишину', sintoho: 'Хвалят сет от шефа; иногда шумно' } },
            { criterion: 'Ваши предпочтения', values: { birch: 'Избранное, оценка 5', harvest: 'Избранное, оценка 4', sintoho: 'Были 4 сентября, оценка 5' } },
            { criterion: 'Детское меню', values: { birch: null, harvest: null, sintoho: null } },
          ],
          note: 'Победителя объявлять не будем: выбор зависит от цены, расстояния и настроения вечера.',
        },
        actions: [
          { kind: 'open', label: 'Открыть Sintoho', object: { kind: 'venue', id: 'sintoho' } },
          { kind: 'save_collection_draft', label: 'Собрать подборку из трёх мест' },
        ],
        followUps: ['Что посоветуешь, если нужен вид?', 'Есть ли рядом кофейня для завтрака?'],
        at: dateTimeAt(-9, '18:01'),
      },
    ],
  },
]
