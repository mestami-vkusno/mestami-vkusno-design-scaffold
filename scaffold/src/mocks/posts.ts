/*
  Публикации пользователей (`UserPost`), официальный контент заведений (`ContentPost`) и комментарии.
  Пользовательская публичная публикация всегда привязана к заведению; запись приватного дневника может быть без него (§13.1).
  Публикации пользователя «Мария» (`u-maria`) покрывают статусы модерации: черновик, на модерации, опубликовано,
  запрошены изменения, отклонено, удалено автором.
*/
import { photo } from './builders'
import { dateTimeAt } from './time'
import type { Photo, PostComment, StarValue, UserPost, VenuePost, VenuePostTopic } from './types'

interface PostSeed {
  readonly id: string
  readonly authorId: string
  readonly venueId: string | null
  readonly menuItemId?: string
  readonly eventId?: string
  readonly visitId?: string
  readonly rating?: StarValue
  readonly text: string
  readonly photos?: readonly Photo[]
  readonly visibility?: UserPost['visibility']
  readonly status?: UserPost['status']
  readonly note?: string
  readonly comments?: boolean
  /** Сколько дней назад создана и во сколько. */
  readonly ago: readonly [days: number, time: string]
  readonly likes: number
}

function build(seed: PostSeed): UserPost {
  const at = dateTimeAt(-seed.ago[0], seed.ago[1])
  return {
    kind: 'user_post',
    id: seed.id,
    authorId: seed.authorId,
    venueId: seed.venueId,
    ...(seed.menuItemId === undefined ? {} : { menuItemId: seed.menuItemId }),
    ...(seed.eventId === undefined ? {} : { eventId: seed.eventId }),
    ...(seed.visitId === undefined ? {} : { visitId: seed.visitId }),
    ...(seed.rating === undefined ? {} : { ratingSnapshot: seed.rating }),
    text: seed.text,
    photos: seed.photos ?? [],
    visibility: seed.visibility ?? 'public',
    status: seed.status ?? 'published',
    ...(seed.note === undefined ? {} : { moderationNote: seed.note }),
    commentsEnabled: seed.comments ?? true,
    createdAt: at,
    updatedAt: at,
    likesCount: seed.likes,
  }
}

const seeds: readonly PostSeed[] = [
  // ── Публичные, опубликованные ──
  {
    id: 'post-01', authorId: 'u-anna', venueId: 'kofe-and-more', menuItemId: 'kofe-and-more-cappuccino', rating: 5,
    text: 'Капучино здесь плотный и сладкий без сахара, пена держится до последнего глотка. Пришла в девять утра, очереди не было, столик у окна занят не был. Возьму круассан с миндалём в следующий раз.',
    photos: [photo('4:3', 'rust', 'Капучино у окна')], ago: [1, '09:40'], likes: 214,
  },
  {
    id: 'post-02', authorId: 'u-dmitry', venueId: 'tokio', eventId: 'event-business-lunch-tokio',
    text: 'Бизнес-ланч в Tokio: три подачи, суп с моллюсками и рис с угрём. Всё аккуратно, порции лёгкие. Из минусов: ждали вторую подачу минут двадцать.',
    photos: [photo('4:3', 'sea', 'Бизнес-ланч'), photo('1:1', 'wine', 'Суп')], ago: [3, '15:10'], likes: 96,
  },
  {
    id: 'post-03', authorId: 'u-elena', venueId: 'osteria-da-bruno', menuItemId: 'osteria-da-bruno-penne-arrabbiata', rating: 5,
    text: 'Пенне аррабиата, как на юге Италии: соус с характером, чеснока в меру, паста al dente. Официант спросил, насколько острой делать, — это редкость. Порция большая.',
    photos: [photo('4:3', 'rust', 'Пенне аррабиата')], ago: [2, '20:15'], likes: 178,
  },
  {
    id: 'post-04', authorId: 'u-maria', venueId: 'birch', menuItemId: 'birch-tartare', visitId: 'visit-1', rating: 5,
    text: 'Тартар в Birch — лучший, что я пробовала в городе: мясо нарезано ножом, а не мясорубкой, хрустящий хлеб остаётся хрустящим до конца. Заказывала на двоих, хватило.',
    photos: [photo('4:3', 'rust', 'Тартар из говядины'), photo('3:4', 'wine', 'Зал Birch')], ago: [6, '21:05'], likes: 37,
  },
  {
    id: 'post-05', authorId: 'u-maria', venueId: 'sintoho', visitId: 'visit-2', rating: 5,
    text: 'Сет от шефа в Sintoho: семь подач, к каждой подробный рассказ. Больше всего запомнился десерт из юдзу. Цена честная для такого уровня.',
    photos: [photo('4:3', 'wine', 'Сет от шефа')], ago: [20, '22:30'], likes: 52,
  },
  {
    id: 'post-06', authorId: 'u-pavel', venueId: 'el-copitas-bar',
    text: 'Джаз по четвергам в El Copitas: трио играет негромко, разговаривать можно, стойка лучше столов. Занимайте места до восьми вечера.',
    photos: [photo('3:4', 'dusk', 'Музыканты за роялем')], ago: [4, '23:20'], likes: 143,
  },
  {
    id: 'post-07', authorId: 'u-olga', venueId: 'khachapuri-lab', menuItemId: 'khachapuri-lab-adjarian', rating: 5,
    text: 'Хачапури по-аджарски подают горячим, желток ещё жидкий. Берите на компанию и делите, одному не осилить. Хинкали тоже сочные.',
    photos: [photo('4:3', 'gold', 'Хачапури по-аджарски')], ago: [2, '13:45'], likes: 302,
  },
  {
    id: 'post-08', authorId: 'u-sofia', venueId: 'harvest', menuItemId: 'harvest-penne-mushroom',
    text: 'Пенне с белыми грибами в Harvest — вегетарианское блюдо, которое не выглядит компромиссом. Трюфельное масло в меру. Спросите шефа про сезонные овощи.',
    photos: [photo('1:1', 'moss', 'Пенне с белыми грибами')], ago: [5, '19:50'], likes: 88,
  },
  {
    id: 'post-09', authorId: 'u-ivan', venueId: 'sintoho', menuItemId: 'sintoho-01', rating: 4,
    text: 'Рамэн с курицей: бульон насыщенный, лапша упругая, яйцо не переварено. Минус: мало зелени. Для Васильевского острова достойно.',
    photos: [photo('4:3', 'wine', 'Рамэн с курицей')], ago: [8, '14:00'], likes: 41,
  },
  {
    id: 'post-10', authorId: 'u-anna', venueId: 'remeslo', rating: 5,
    text: 'Новая пекарня на Садовой. Хлеб на закваске, круассаны слоёные, ещё тёплые к восьми утра. Кофе сделан по-домашнему, без изысков.',
    photos: [photo('4:3', 'gold', 'Круассаны на подносе')], ago: [9, '08:20'], likes: 119,
  },
  {
    id: 'post-11', authorId: 'u-dmitry', venueId: 'panorama-360', rating: 5,
    text: 'Столик у окна на закате — единственный вариант. Вид на залив, ровный свет и неспешная подача. Панорамный зал стоит своих денег, если заказать заранее.',
    photos: [photo('16:9', 'dusk', 'Закат над заливом'), photo('4:3', 'wine', 'Стол у окна')], ago: [11, '19:40'], likes: 267,
  },
  {
    id: 'post-12', authorId: 'u-elena', venueId: 'kuznya-house', rating: 4,
    text: 'Пироги в Kuznya House пекут каждое утро: с капустой, с рыбой, с яблоком. Суточные щи — как у бабушки. Обслуживание неторопливое, зато не давят.',
    photos: [photo('4:3', 'rust', 'Пироги на столе')], ago: [13, '12:30'], likes: 64,
  },
  {
    // Публикация автора с закрытым профилем остаётся публичной (§15.2).
    id: 'post-13', authorId: 'u-nikita', venueId: 'terrassa', rating: 4,
    text: 'Веранда на Кадетской: вид на реку, лёгкое средиземноморское меню. Приходите днём, вечером ветрено.',
    photos: [photo('16:9', 'sea', 'Веранда у реки')], ago: [7, '17:05'], likes: 29,
  },
  {
    id: 'post-14', authorId: 'u-olga', venueId: 'terrace-17', rating: 5,
    text: 'Терраса на Тверской: вид на центр, рыба готовится точно, порции небольшие, но точные. Для свидания — идеально.',
    photos: [photo('16:9', 'dusk', 'Терраса с видом на город')], ago: [5, '20:10'], likes: 188,
  },
  {
    id: 'post-15', authorId: 'u-anna', venueId: 'soul-kitchen', rating: 4,
    text: 'Завтрак в Soul Kitchen после десяти: бенедикт, свежевыжатый сок и кофе. Много света, можно с собакой, официанты приветливые.',
    photos: [photo('4:3', 'moss', 'Завтрак у окна')], ago: [10, '10:25'], likes: 73,
  },
  {
    id: 'post-16', authorId: 'u-pavel', venueId: 'charlie',
    text: 'Charlie по вечерам: живая музыка, зал небольшой, к девяти всё занято. Закуски хорошие, порции честные.',
    photos: [photo('3:4', 'wine', 'Музыканты в Charlie')], ago: [12, '22:40'], likes: 57,
  },
  {
    id: 'post-17', authorId: 'u-dmitry', venueId: 'forno-napoli', menuItemId: 'forno-napoli-margherita', rating: 5,
    text: 'Маргарита в Forno Napoli: тесто с пузырями, борт лёгкий, томаты кислые в меру. Готовят быстро, стоять в очереди пришлось минут десять.',
    photos: [photo('1:1', 'rust', 'Пицца Маргарита')], ago: [14, '18:30'], likes: 205,
  },
  {
    id: 'post-18', authorId: 'u-sofia', venueId: 'terrassa',
    text: 'Для вегетарианцев в Terrassa есть лёгкие салаты и овощи на гриле. Основных блюд без рыбы мало, но шеф готов подобрать.',
    photos: [photo('4:3', 'moss', 'Овощи на гриле')], ago: [16, '13:15'], likes: 31,
  },
  {
    // Публикация заблокированного пользователем «Мария» автора: ей не показывается.
    id: 'post-19', authorId: 'u-igor', venueId: 'kuznya-house',
    text: 'Долго ждали. Пироги обычные. Больше не пойду.',
    ago: [6, '21:50'], likes: 2,
  },
  {
    id: 'post-20', authorId: 'u-elena', venueId: 'forno-napoli', menuItemId: 'forno-napoli-margherita', rating: 4,
    text: 'Домашний вечер после Forno Napoli: заказала маргариту с собой, разогрела дома — всё равно вкусно. Тесто не размокло.',
    ago: [18, '20:00'], likes: 24, comments: false,
  },
  // ── Публикации пользователя «Мария» в разных статусах ──
  {
    id: 'post-21', authorId: 'u-maria', venueId: 'harvest', visitId: 'visit-3', rating: 4,
    text: 'Дегустационный сет в Harvest: пять блюд, к каждому — короткий рассказ про поставщика. Мне не хватило десерта, но остальное на высоте.',
    photos: [photo('4:3', 'moss', 'Сет из пяти блюд')], status: 'pending', ago: [1, '12:00'], likes: 0,
  },
  {
    id: 'post-22', authorId: 'u-maria', venueId: 'osteria-da-bruno', menuItemId: 'osteria-da-bruno-penne-salmon', visitId: 'visit-4', rating: 5,
    text: 'Пенне с лососем в Osteria da Bruno: сливочный соус, шпинат, свежая сёмга. Спрашивайте у официанта про скидку по промокоду MARIA10.',
    photos: [photo('4:3', 'gold', 'Пенне с лососем')], status: 'changes_requested',
    note: 'Уберите, пожалуйста, упоминание промокода: платные и спонсорские интеграции без официального рекламного процесса не допускаются.',
    ago: [3, '19:20'], likes: 0,
  },
  {
    id: 'post-23', authorId: 'u-maria', venueId: 'kofe-and-more', visitId: 'visit-7',
    text: 'Заходила утром за кофе, взяла шакшуку. Яйца в меру густые, соус пряный. Допишу про десерты и',
    photos: [photo('4:3', 'rust', 'Шакшука')], status: 'draft', ago: [4, '10:45'], likes: 0,
  },
  {
    id: 'post-24', authorId: 'u-maria', venueId: null,
    text: 'Записать про ужин на Каменноостровском: столик у окна, тихий зал, хорошая паста. Название вспомнить.',
    status: 'draft', ago: [0, '11:10'], likes: 0,
  },
  {
    // Приватная запись дневника без заведения (§13.1): не попадает в Ленту и рекомендации.
    id: 'post-25', authorId: 'u-maria', venueId: null,
    text: 'Вечером пробовала дома повторить пасту из Osteria da Bruno. Получилось хуже, но соус почти тот же: помидоры, чеснок, чили. Записать пропорции.',
    photos: [photo('4:3', 'rust', 'Паста дома')], visibility: 'private', ago: [5, '21:30'], likes: 0,
  },
  {
    // Приватная запись дневника с заведением и Посещением.
    id: 'post-26', authorId: 'u-maria', venueId: 'kitchen-22', visitId: 'visit-6',
    text: 'Kitchen 22: заскочила на завтрак на вынос. Сэндвич с индейкой и суп дня. Вкусно, но сидеть негде.',
    visibility: 'private', ago: [2, '09:00'], likes: 0,
  },
  {
    id: 'post-27', authorId: 'u-maria', venueId: 'forno-napoli', visitId: 'visit-5', rating: 4,
    text: 'Forno Napoli: пицца сытная, но соус пересолен. Возьму как быстрый вариант на вечер.',
    status: 'rejected', note: 'Текст содержит спорное утверждение о составе блюда. Отредактируйте и отправьте снова.', ago: [12, '18:00'], likes: 0,
  },
  {
    id: 'post-28', authorId: 'u-maria', venueId: 'birch', visitId: 'visit-8',
    text: 'Старая заметка о Birch, удалена автором.',
    status: 'removed_by_author', ago: [60, '20:00'], likes: 0,
  },
]

export const userPosts: readonly UserPost[] = seeds.map(build)

interface VenuePostSeed {
  readonly id: string
  readonly venueId: string
  readonly topic: VenuePostTopic
  readonly title: string
  readonly text: string
  readonly photos: readonly Photo[]
  readonly eventId?: string
  readonly ago: readonly [days: number, time: string]
  readonly likes: number
}

const venuePostSeeds: readonly VenuePostSeed[] = [
  {
    id: 'vpost-01', venueId: 'birch', topic: 'menu', title: 'Сезонное меню: осень',
    text: 'Добавили тыкву на углях, грибной бульон и десерт из груши. Часть блюд уходит в архив: успейте попробовать летние подачи.',
    photos: [photo('4:3', 'rust', 'Осеннее меню')], ago: [2, '11:00'], likes: 156,
  },
  {
    id: 'vpost-02', venueId: 'harvest', topic: 'event', title: 'Гостевой ужин двух шефов',
    text: 'В субботу на нашей кухне двое шефов и семь подач. Осталось несколько мест — регистрация по ссылке.',
    photos: [photo('16:9', 'ember', 'Два шефа за плитой')], eventId: 'event-guest-dinner-harvest', ago: [1, '15:30'], likes: 218,
  },
  {
    id: 'vpost-03', venueId: 'kofe-and-more', topic: 'news', title: 'Новый лот кофе',
    text: 'В карте фильтр-кофе из Эфиопии: ягодный вкус, цветочный аромат. Приходите пробовать до конца недели.',
    photos: [photo('4:3', 'gold', 'Пачка кофе')], ago: [3, '09:00'], likes: 77,
  },
  {
    id: 'vpost-04', venueId: 'forno-napoli', topic: 'behind_the_scenes', title: 'Как мы растягиваем тесто',
    text: 'Показываем закулисье: тесто отдыхает 48 часов, растягивается руками и сразу идёт в печь. Ждём вас на мастер-класс.',
    photos: [photo('4:3', 'rust', 'Тесто для пиццы')], eventId: 'event-pizza-masterclass-forno', ago: [4, '13:00'], likes: 132,
  },
  {
    id: 'vpost-05', venueId: 'el-copitas-bar', topic: 'event', title: 'Джаз по четвергам',
    text: 'Сегодня в 20:00 играет трио. Вход свободный, места у стойки лучше занять заранее.',
    photos: [photo('3:4', 'dusk', 'Джазовое трио')], eventId: 'event-jazz-copitas', ago: [0, '10:00'], likes: 91,
  },
  {
    id: 'vpost-06', venueId: 'panorama-360', topic: 'news', title: 'Закат в 18:45',
    text: 'Осенью закат ранний: подскажем время и лучшие столы. Бронируйте заранее.',
    photos: [photo('16:9', 'dusk', 'Закат над заливом')], ago: [5, '16:30'], likes: 187,
  },
  {
    id: 'vpost-07', venueId: 'nola', topic: 'news', title: 'Открываемся',
    text: 'Через две недели открываем двери. Меню и часы работы опубликуем ближе к открытию.',
    photos: [photo('4:3', 'moss', 'Зал перед открытием')], ago: [2, '14:20'], likes: 64,
  },
  {
    id: 'vpost-08', venueId: 'sintoho', topic: 'event', title: 'Сет от шефа: завтра',
    text: 'Завтра подаём сет из семи блюд. Остались единичные места.',
    photos: [photo('4:3', 'wine', 'Блюдо из сета')], eventId: 'event-gastro-set-sintoho', ago: [0, '12:30'], likes: 83,
  },
  {
    id: 'vpost-09', venueId: 'brasserie-petrovka', topic: 'menu', title: 'Устрицы по сезону',
    text: 'Вернулись свежие устрицы. Подаём с лимоном и уксусом с шалотом.',
    photos: [photo('4:3', 'sea', 'Устрицы на льду')], ago: [3, '12:00'], likes: 102,
  },
  {
    id: 'vpost-10', venueId: 'khachapuri-lab', topic: 'event', title: 'Мастер-класс по хачапури',
    text: 'В субботу учим печь хачапури. Бесплатно, нужна регистрация.',
    photos: [photo('4:3', 'gold', 'Хачапури в печи')], eventId: 'event-khachapuri-masterclass', ago: [1, '11:00'], likes: 245,
  },
]

export const venuePosts: readonly VenuePost[] = venuePostSeeds.map((seed) => ({
  kind: 'venue_post',
  id: seed.id,
  venueId: seed.venueId,
  topic: seed.topic,
  title: seed.title,
  text: seed.text,
  photos: seed.photos,
  ...(seed.eventId === undefined ? {} : { eventId: seed.eventId }),
  publishedAt: dateTimeAt(-seed.ago[0], seed.ago[1]),
  likesCount: seed.likes,
}))

function comment(id: string, postId: string, authorId: string, text: string, ago: readonly [number, string], parentId?: string): PostComment {
  return { id, postId, authorId, text, createdAt: dateTimeAt(-ago[0], ago[1]), ...(parentId === undefined ? {} : { parentId }) }
}

/** Комментарии: один уровень ответов (`parentId`). У официального контента заведений комментариев нет (§14.1). */
export const postComments: readonly PostComment[] = [
  comment('c-01', 'post-01', 'u-maria', 'Спасибо, зайду завтра утром. А круассан там свежий?', [1, '11:00']),
  comment('c-02', 'post-01', 'u-anna', 'Да, к девяти привозят тёплый. Возьмите с миндалём.', [1, '11:12'], 'c-01'),
  comment('c-03', 'post-01', 'u-sofia', 'Плотная пена — это редкость, согласна.', [1, '13:05']),
  comment('c-04', 'post-03', 'u-ivan', 'А насколько острая? Я не переношу чили.', [2, '21:00']),
  comment('c-05', 'post-03', 'u-elena', 'Можно попросить убавить, официант спросит сам.', [2, '21:20'], 'c-04'),
  comment('c-06', 'post-04', 'u-anna', 'Мне тоже понравился их тартар. Спасибо за подробности!', [6, '22:00']),
  comment('c-07', 'post-04', 'u-dmitry', 'Соглашусь, зал уютный. Сколько ждали заказ?', [6, '23:10']),
  comment('c-08', 'post-04', 'u-maria', 'Минут пятнадцать, на пятницу вечером нормально.', [5, '09:00'], 'c-07'),
  comment('c-09', 'post-05', 'u-elena', 'А мы ходили в июле, тогда сет был другим. Схожу ещё раз.', [19, '12:00']),
  comment('c-10', 'post-06', 'u-maria', 'Спасибо, что напомнили. В четверг займу место у стойки.', [4, '23:59']),
  comment('c-11', 'post-07', 'u-olga', 'Порции вправду большие. Лучше делить на двоих.', [2, '14:30']),
  comment('c-12', 'post-07', 'u-sofia', 'Есть хинкали с грибами, это радует.', [2, '15:00']),
  comment('c-13', 'post-08', 'u-maria', 'Хочу такое же! Долго ждали?', [5, '20:30']),
  comment('c-14', 'post-08', 'u-sofia', 'Минут десять, всё свежее.', [5, '20:45'], 'c-13'),
  comment('c-15', 'post-11', 'u-olga', 'Надо забронировать на закат. Спасибо за подсказку.', [10, '20:00']),
  comment('c-16', 'post-11', 'u-pavel', 'Подтверждаю: вид стоит своих денег.', [10, '21:00']),
  comment('c-17', 'post-13', 'u-maria', 'Спасибо, что написали: как раз искала веранду у воды.', [7, '18:00']),
  comment('c-18', 'post-14', 'u-anna', 'А как со временем ожидания? В выходные много народа?', [5, '21:15']),
  comment('c-19', 'post-14', 'u-olga', 'Бронировала заранее, ждать не пришлось.', [5, '21:40'], 'c-18'),
  comment('c-20', 'post-17', 'u-elena', 'А я люблю с грибами, но Маргарита хороша как база.', [14, '19:30']),
  comment('c-21', 'post-17', 'u-maria', 'Согласна, тесто — главное.', [14, '20:00']),
  comment('c-22', 'post-21', 'u-anna', 'Интересно, как выглядит их десерт из груши?', [1, '13:00']),
]
