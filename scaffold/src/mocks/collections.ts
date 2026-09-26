/*
  Подборки (`Collection`): редакционные с подписью «Редакция «Местами вкусно»» (§17.2),
  пользовательские публичные и приватные, черновик. Заведение в одной подборке не повторяется (§17.1).
  Список элементов — авторский порядок. В нескольких подборках намеренно есть заведения с особым статусом,
  чтобы у карточки в списке отображалось «приостановлено», «закрыто навсегда» и «скоро открытие».
*/
import { photo } from './builders'
import { dateTimeAt } from './time'
import type { Collection, CollectionItem, CollectionTopic, CollectionVisibility, Photo } from './types'

interface Seed {
  readonly id: string
  readonly kind: Collection['kind']
  readonly title: string
  readonly description: string
  readonly ownerId: string | null
  readonly visibility?: CollectionVisibility
  readonly status?: Collection['status']
  readonly topics: readonly CollectionTopic[]
  readonly cityId?: Collection['cityId']
  readonly items: readonly (readonly [venueId: string, note?: string])[]
  readonly cover: Photo
  readonly ago: number
  readonly saves: number
}

function build(seed: Seed): Collection {
  const items: CollectionItem[] = seed.items.map(([venueId, note]) => (note === undefined ? { venueId } : { venueId, note }))
  const at = dateTimeAt(-seed.ago, '12:00')
  return {
    id: seed.id,
    kind: seed.kind,
    title: seed.title,
    description: seed.description,
    ownerId: seed.ownerId,
    visibility: seed.visibility ?? 'public',
    status: seed.status ?? 'published',
    topics: seed.topics,
    cityId: seed.cityId ?? 'spb',
    items,
    cover: seed.cover,
    createdAt: at,
    updatedAt: at,
    savesCount: seed.saves,
  }
}

const seeds: readonly Seed[] = [
  // ── Редакционные ──
  {
    id: 'col-ed-date',
    kind: 'editorial',
    title: 'Рестораны для красивого свидания',
    description: 'Камерные рестораны, атмосферные залы и места, где хочется задержаться подольше.',
    ownerId: null,
    topics: ['date', 'evening'],
    items: [
      ['birch', 'Открытая кухня и тихий зал. Столик лучше бронировать заранее.'],
      ['harvest', 'Сезонная кухня и веранда. Дегустационный сет по выходным.'],
      ['terrassa', 'Веранда с видом на реку, лёгкое средиземноморское меню.'],
      ['panorama-360', 'Панорама залива на закате, столы у окна занимают быстро.'],
      ['charlie', 'Живая музыка по вечерам, небольшой зал.'],
      ['osteria-da-bruno', 'Домашняя паста и тёплый свет: для спокойного вечера.'],
    ],
    cover: photo('16:9', 'dusk', 'Ужин при свечах'),
    ago: 14,
    saves: 1830,
  },
  {
    id: 'col-ed-breakfast',
    kind: 'editorial',
    title: 'Лучшие завтраки Петербурга',
    description: 'Где позавтракать в будни и выходные: кофейни, кафе и пекарни.',
    ownerId: null,
    topics: ['breakfast', 'coffee'],
    items: [
      ['kofe-and-more', 'Завтраки до 13:00, плотный капучино.'],
      ['soul-kitchen', 'Светлый зал, завтраки весь день.'],
      ['kuznya-house', 'Русские завтраки и пироги, по выходным — семейный бранч.'],
      ['kitchen-22', 'Завтраки на вынос у метро.'],
      ['remeslo', 'Хлеб на закваске и круассаны с утра.'],
    ],
    cover: photo('16:9', 'gold', 'Завтрак на столе'),
    ago: 9,
    saves: 1240,
  },
  {
    id: 'col-ed-view',
    kind: 'editorial',
    title: 'Рестораны с красивым видом',
    description: 'Веранды, панорамные залы и столы у окна.',
    ownerId: null,
    topics: ['view', 'evening'],
    items: [
      ['terrassa', 'Река рядом, солнце до вечера.'],
      ['panorama-360', 'Самый высокий зал города.'],
      ['harvest', 'Тихая веранда во дворе.'],
    ],
    cover: photo('16:9', 'sea', 'Вид с террасы'),
    ago: 21,
    saves: 970,
  },
  {
    id: 'col-ed-bars',
    kind: 'editorial',
    title: 'Атмосферные бары',
    description: 'Бары с музыкой, закусками и уютной стойкой.',
    ownerId: null,
    topics: ['bars', 'evening', 'friends'],
    items: [
      ['el-copitas-bar', 'Джаз по четвергам, места у стойки.'],
      ['inside', 'Небольшой бар с тематическими вечерами.'],
      ['charlie', 'Гастробар с открытой кухней.'],
      ['futura', 'Гастробар с диджей-сетами. Сейчас приостановлен.'],
    ],
    cover: photo('16:9', 'wine', 'Бар с подсветкой'),
    ago: 30,
    saves: 1420,
  },
  {
    id: 'col-ed-new',
    kind: 'editorial',
    title: 'Новые места этой осени',
    description: 'Открылись недавно или скоро откроются.',
    ownerId: null,
    topics: ['new', 'breakfast'],
    items: [
      ['forno-napoli', 'Пиццерия с дровяной печью.'],
      ['remeslo', 'Пекарня на закваске.'],
      ['nola', 'Открывается через две недели, дата может измениться.'],
    ],
    cover: photo('16:9', 'moss', 'Новое место'),
    ago: 3,
    saves: 410,
  },
  {
    id: 'col-ed-friends',
    kind: 'editorial',
    title: 'Куда пойти компанией',
    description: 'Просторные залы, общие столы и блюда на компанию.',
    ownerId: null,
    topics: ['friends'],
    items: [
      ['osteria-da-bruno', 'Пицца и паста на компанию.'],
      ['kuznya-house', 'Большие порции и общий стол.'],
      ['sintoho', 'Сеты для компании из четырёх.'],
      ['charlie', 'Столы у сцены.'],
      ['forno-napoli', 'Быстро и сытно.'],
    ],
    cover: photo('16:9', 'ember', 'Компания за столом'),
    ago: 18,
    saves: 860,
  },
  {
    id: 'col-ed-family',
    kind: 'editorial',
    title: 'Выходной с детьми',
    description: 'Места с детским меню, просторными залами и лёгкой атмосферой.',
    ownerId: null,
    topics: ['family', 'breakfast'],
    items: [
      ['osteria-da-bruno', 'Просторный зал, паста, которую любят дети.'],
      ['kuznya-house', 'Семейный бранч и аниматор по воскресеньям.'],
      ['forno-napoli', 'Мастер-класс по пицце для детей от 6 лет.'],
      ['soul-kitchen', 'Светлый зал и завтраки весь день.'],
    ],
    cover: photo('16:9', 'gold', 'Семейный стол'),
    ago: 25,
    saves: 690,
  },
  {
    id: 'col-ed-msk-breakfast',
    kind: 'editorial',
    title: 'Завтраки в Москве',
    description: 'Кофейни, пекарни и кафе для завтрака в центре.',
    ownerId: null,
    cityId: 'msk',
    topics: ['breakfast', 'coffee'],
    items: [
      ['zerno', 'Собственная обжарка и выпечка.'],
      ['kasha', 'Каши, сырники, детское меню.'],
      ['khachapuri-lab', 'Хачапури с самого утра.'],
      ['hlebny-dvor', 'Хлеб из дровяной печи.'],
    ],
    cover: photo('16:9', 'gold', 'Завтрак в Москве'),
    ago: 11,
    saves: 540,
  },
  // ── Пользовательские публичные ──
  {
    id: 'col-u-anna-coffee',
    kind: 'user',
    title: 'Мои кофейни на Адмиралтейской',
    description: 'Где я пью кофе по утрам, если иду через центр.',
    ownerId: 'u-anna',
    topics: ['coffee', 'breakfast'],
    items: [
      ['kofe-and-more', 'Капучино, завтраки, места у окна.'],
      ['remeslo', 'Круассаны с утра.'],
    ],
    cover: photo('16:9', 'rust', 'Чашка кофе'),
    ago: 40,
    saves: 320,
  },
  {
    id: 'col-u-dmitry-chef',
    kind: 'user',
    title: 'Ужины с шефами',
    description: 'Рестораны, где стоит сесть за стойку у кухни.',
    ownerId: 'u-dmitry',
    topics: ['evening', 'date'],
    items: [
      ['birch', 'Открытая кухня, шеф выходит в зал.'],
      ['harvest', 'Дегустационный сет.'],
      ['sintoho', 'Сет от шефа по пятницам.'],
    ],
    cover: photo('16:9', 'ember', 'Кухня шефа'),
    ago: 33,
    saves: 410,
  },
  {
    id: 'col-u-elena-family',
    kind: 'user',
    title: 'Куда пойти всей семьёй',
    description: 'Проверено с двумя детьми и бабушкой.',
    ownerId: 'u-elena',
    topics: ['family'],
    items: [
      ['osteria-da-bruno'],
      ['kuznya-house', 'Пироги и суп для детей.'],
      ['soul-kitchen', 'Можно с собакой.'],
    ],
    cover: photo('16:9', 'moss', 'Семейный обед'),
    ago: 55,
    saves: 145,
  },
  {
    // Подборка автора с устаревшими карточками: «закрыто навсегда» и «приостановлено» видны прямо в списке.
    id: 'col-u-pavel-jazz',
    kind: 'user',
    title: 'Джаз и живая музыка',
    description: 'Места, где вечером играют вживую.',
    ownerId: 'u-pavel',
    topics: ['bars', 'friends'],
    items: [
      ['el-copitas-bar', 'Джаз по четвергам.'],
      ['charlie', 'Музыка по вечерам.'],
      ['futura', 'Диджей-сеты, сейчас приостановлено.'],
      ['lilo', 'Закрылось этой осенью, оставил в подборке на память.'],
    ],
    cover: photo('16:9', 'dusk', 'Сцена бара'),
    ago: 70,
    saves: 88,
  },
  // ── Подборки Марии ──
  {
    id: 'col-u-maria-public',
    kind: 'user',
    title: 'Петроградка на двоих',
    description: 'Места, куда я вожу друзей на Петроградскую сторону.',
    ownerId: 'u-maria',
    topics: ['date'],
    items: [
      ['birch', 'Тартар и утка — обязательно.'],
      ['harvest', 'Дегустационный сет и тихий зал.'],
      ['forno-napoli', 'Быстрый вариант, если нет времени на ужин.'],
    ],
    cover: photo('16:9', 'wine', 'Ужин на двоих'),
    ago: 19,
    saves: 12,
  },
  {
    id: 'col-u-maria-private',
    kind: 'user',
    title: 'Хочу попробовать',
    description: 'Личный список на осень.',
    ownerId: 'u-maria',
    visibility: 'private',
    topics: ['evening'],
    items: [['sintoho', 'Сет по пятницам.'], ['panorama-360', 'Закат в 18:45.'], ['terrassa']],
    cover: photo('16:9', 'sea', 'Список желаний'),
    ago: 8,
    saves: 0,
  },
  {
    id: 'col-u-maria-draft',
    kind: 'user',
    title: 'Завтраки выходного дня',
    description: 'Пока не закончила: добавлю ещё пару мест.',
    ownerId: 'u-maria',
    status: 'draft',
    topics: ['breakfast'],
    items: [['kofe-and-more', 'Шакшука и капучино.']],
    cover: photo('16:9', 'gold', 'Завтрак'),
    ago: 1,
    saves: 0,
  },
]

export const collections: readonly Collection[] = seeds.map(build)
