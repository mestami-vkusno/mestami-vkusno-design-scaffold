/*
  Оценки (`Rating`, 1–5) и отзывы (`Review`). На пару «пользователь × заведение» ровно одна активная оценка
  и не больше одного отзыва (§3.4). Оценка без отзыва допустима; отзыв всегда опирается на активную оценку.
  У Марии есть прежняя, замененная новой оценка Birch (`active: false`) — в агрегат она не входит.
*/
import { photo } from './builders'
import { dateTimeAt } from './time'
import type { Photo, Rating, Review, StarValue } from './types'

type Entry = readonly [userId: string, venueId: string, value: StarValue, agoDays: number, text?: string, photos?: readonly Photo[]]

const entries: readonly Entry[] = [
  ['u-maria', 'birch', 5, 6, 'Один из лучших ужинов за последние месяцы. Сезонное меню, внимательный сервис, шефа видно у открытой кухни. Тартар и утка — обязательно. Столик лучше бронировать за несколько дней.', [photo('4:3', 'rust', 'Тартар в Birch')]],
  ['u-anna', 'birch', 5, 15, 'Спокойный зал и хорошая подача. Приходили на свидание, официант ненавязчиво подсказывал по меню.'],
  ['u-dmitry', 'birch', 4, 22, 'Кухня сильная, но вечером бывает шумно. Утку рекомендую, вино не пробовал.'],
  ['u-olga', 'birch', 5, 40],
  ['u-maria', 'harvest', 4, 31],
  ['u-sofia', 'harvest', 5, 5, 'Меню внимательно к вегетарианцам: несколько сезонных блюд без мяса. Очень тихо, можно разговаривать.'],
  ['u-dmitry', 'harvest', 5, 27, 'Дегустационный сет — как небольшой спектакль. Рассказы о поставщиках, аккуратные порции.', [photo('4:3', 'moss', 'Сет в Harvest')]],
  ['u-maria', 'osteria-da-bruno', 5, 45, 'Домашняя паста, соус с характером, тёплый зал. Если идёте с детьми, попросите столик подальше от печи. Пенне аррабиата — мой фаворит.'],
  ['u-elena', 'osteria-da-bruno', 5, 2, 'Пенне аррабиата как в Италии. Официант уточнил степень остроты.'],
  ['u-ivan', 'osteria-da-bruno', 4, 30],
  ['u-maria', 'sintoho', 5, 20, 'Сет от шефа стоит своих денег. Подача, рассказ и порции — всё продумано. Единственный минус: шумно, когда зал заполнен.'],
  ['u-ivan', 'sintoho', 4, 8, 'Рамэн насыщенный, но зелени мало. Вок с говядиной хороший.'],
  ['u-anna', 'kofe-and-more', 5, 1, 'Плотный капучино и тёплый круассан к девяти утра. Сотрудники приветливые, можно с собакой.'],
  ['u-sofia', 'kofe-and-more', 4, 14],
  ['u-dmitry', 'forno-napoli', 5, 14, 'Тесто с пузырями, лёгкий борт, кислые томаты — правильная неаполитанская пицца.'],
  ['u-elena', 'forno-napoli', 4, 18],
  ['u-maria', 'forno-napoli', 4, 12],
  ['u-dmitry', 'panorama-360', 5, 11, 'Столик у окна на закате — почти обязательный пункт для гостей города. Кухня ровная, подача неторопливая.'],
  ['u-nikita', 'terrassa', 4, 7, 'Веранда у реки, лёгкая кухня. Днём приятнее, чем вечером.'],
  ['u-elena', 'kuznya-house', 4, 13, 'Пироги свежие, супы наваристые. Обслуживание неспешное, но приветливое.'],
  ['u-igor', 'kuznya-house', 2, 6, 'Долго ждали, обычные пироги.'],
  ['u-anna', 'remeslo', 5, 9, 'Хлеб на закваске и круассаны — тёплые к восьми утра.'],
  ['u-sofia', 'remeslo', 5, 6],
  ['u-elena', 'remeslo', 4, 4],
  ['u-olga', 'khachapuri-lab', 5, 2, 'Хачапури по-аджарски подают горячим, порции большие. Приходите с компанией.'],
  ['u-olga', 'terrace-17', 5, 5, 'Терраса на крыше, вид на центр города. Рыба на гриле — отлично.'],
  ['u-dmitry', 'tokio', 3, 3, 'Бизнес-ланч нормальный, но вторую подачу ждали долго.'],
]

const oldMariaBirch: Rating = {
  id: 'rating-u-maria-birch-prev',
  userId: 'u-maria',
  venueId: 'birch',
  value: 4,
  active: false,
  createdAt: dateTimeAt(-62, '21:00'),
}

export const ratings: readonly Rating[] = [
  oldMariaBirch,
  ...entries.map(
    ([userId, venueId, value, agoDays]): Rating => ({
      id: `rating-${userId}-${venueId}`,
      userId,
      venueId,
      value,
      active: true,
      createdAt: dateTimeAt(-agoDays, '20:00'),
    }),
  ),
]

export const reviews: readonly Review[] = entries.flatMap(([userId, venueId, , agoDays, text, photos]): Review[] =>
  text === undefined
    ? []
    : [
        {
          id: `review-${userId}-${venueId}`,
          userId,
          venueId,
          ratingId: `rating-${userId}-${venueId}`,
          text,
          photos: photos ?? [],
          status: 'published',
          createdAt: dateTimeAt(-agoDays, '20:05'),
        },
      ],
)
