/*
  Текущие опубликованные версии меню у части заведений (у остальных меню в сервисе пока нет).
  ВНИМАНИЕ: здесь, в «сыром» виде, лежат и позиции с `isAlcohol: true`. Наружу они не выходят:
  страницы читают меню только через `selectors.ts`, а `index.ts` этот файл не реэкспортирует (§8.4).
  Так сценарий J2 («алкоголя в результатах нет, а бар находится») проверяется на настоящих данных.
*/
import { photo } from './builders'
import { MOCK_TODAY } from './time'
import type { DietaryTag, DishConcept, Menu, MenuItem, MenuItemAvailability, MenuSection, Photo, PhotoTone } from './types'

export const dishConcepts: readonly DishConcept[] = [
  { id: 'penne', name: 'Пенне', synonyms: ['паста пенне', 'penne'] },
  { id: 'tartare', name: 'Тартар', synonyms: ['тартар из говядины', 'tartare'] },
  { id: 'tiramisu', name: 'Тирамису', synonyms: ['tiramisu'] },
  { id: 'cheesecake', name: 'Чизкейк', synonyms: ['cheesecake'] },
  { id: 'margherita', name: 'Пицца «Маргарита»', synonyms: ['маргарита', 'margherita'] },
  { id: 'cappuccino', name: 'Капучино', synonyms: ['cappuccino'] },
  { id: 'croissant', name: 'Круассан', synonyms: ['croissant'] },
  { id: 'ramen', name: 'Рамэн', synonyms: ['рамен', 'ramen'] },
  { id: 'khachapuri', name: 'Хачапури', synonyms: ['хачапури по-аджарски', 'khachapuri'] },
  { id: 'shakshuka', name: 'Шакшука', synonyms: ['shakshuka'] },
]

interface ItemOptions {
  /** Явный короткий ключ: id позиции станет `<заведение>-<ключ>`; нужен там, где на позицию ссылаются другие данные. */
  readonly id?: string
  readonly portion?: string
  readonly photo?: Photo
  readonly availability?: MenuItemAvailability
  readonly diet?: readonly DietaryTag[]
  readonly alcohol?: boolean
  readonly concept?: string
}

/** Название, описание, цена в ₽ (`null` — «Цена не указана») и необязательные свойства. */
type ItemSeed = readonly [name: string, description: string, priceRub: number | null, options?: ItemOptions]

interface SectionSeed {
  readonly key: string
  readonly title: string
  readonly items: readonly ItemSeed[]
}

function dishPhoto(tone: PhotoTone, name: string): Photo {
  return photo('1:1', tone, name)
}

function buildMenu(venueId: string, version: number, sections: readonly SectionSeed[]): Menu {
  let counter = 0
  const built: MenuSection[] = sections.map((section, sectionIndex) => {
    const sectionId = `${venueId}-${section.key}`
    const items: MenuItem[] = section.items.map(([name, description, priceRub, options], itemIndex) => {
      counter += 1
      const opts = options ?? {}
      return {
        id: `${venueId}-${opts.id ?? String(counter).padStart(2, '0')}`,
        venueId,
        sectionId,
        name,
        description,
        priceRub,
        ...(opts.portion === undefined ? {} : { portion: opts.portion }),
        ...(opts.photo === undefined ? {} : { photo: opts.photo }),
        availability: opts.availability ?? 'available',
        dietary: opts.diet ?? [],
        isAlcohol: opts.alcohol ?? false,
        ...(opts.concept === undefined ? {} : { dishConceptId: opts.concept }),
        order: itemIndex + 1,
      }
    })
    return { id: sectionId, title: section.title, order: sectionIndex + 1, items }
  })
  return { id: `menu-${venueId}`, venueId, version, publishedAt: `${MOCK_TODAY.slice(0, 8)}01T10:00:00+03:00`, sections: built }
}

const birch = buildMenu('birch', 7, [
  {
    key: 'popular',
    title: 'Популярное',
    items: [
      ['Тартар из говядины', 'Говяжья вырезка, каперсы, горчица, желток, хрустящий хлеб.', 890, { id: 'tartare', photo: dishPhoto('rust', 'Тартар из говядины'), concept: 'tartare', portion: '110 г' }],
      ['Утиная грудка', 'Утиная грудка, пюре из батата, соус из вишни и портвейна.', 1490, { id: 'duck', photo: dishPhoto('wine', 'Утиная грудка'), portion: '240 г' }],
      ['Паста с крабом', 'Домашняя паста, краб, томаты, цитрусовый горчик, пармезан.', 1190, { id: 'crab-pasta', photo: dishPhoto('gold', 'Паста с крабом'), portion: '260 г' }],
    ],
  },
  {
    key: 'starters',
    title: 'Закуски',
    items: [
      ['Свекольный салат с козьим сыром', 'Запечённая свёкла, козий сыр, грецкий орех, заправка из бальзамика.', 590, { diet: ['vegetarian'] }],
      ['Бургундские улитки', 'Масло с чесноком и петрушкой, багет.', 990, { availability: 'removed', portion: '6 шт.' }],
      ['Хумус с печёной тыквой', 'Нут, тахини, печёная тыква, семена.', 520, { diet: ['vegan', 'lenten'] }],
    ],
  },
  {
    key: 'soups',
    title: 'Супы',
    items: [
      ['Крем-суп из белых грибов', 'Белые грибы, сливки, гренки из ржаного хлеба.', 640, { diet: ['vegetarian'], portion: '300 мл' }],
      ['Уха из трёх рыб', 'Сёмга, форель, судак, картофель, укроп.', 690, { portion: '350 мл' }],
    ],
  },
  {
    key: 'mains',
    title: 'Основные блюда',
    items: [
      ['Стейк из говяжьей щеки', 'Томлёная щека, пюре из сельдерея, соус демигляс.', 1590, { portion: '260 г' }],
      ['Судак с лисичками', 'Филе судака, лисички, картофельное пюре, сливочный соус.', 1390, { portion: '250 г' }],
      ['Ризотто с белыми грибами', 'Арборио, белые грибы, пармезан, трюфельное масло.', 990, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'desserts',
    title: 'Десерты',
    items: [
      ['Басковский чизкейк', 'Нежный чизкейк с карамелизованной корочкой, сезонные ягоды.', 690, { id: 'cheesecake', photo: dishPhoto('gold', 'Басковский чизкейк'), concept: 'cheesecake', availability: 'temporarily_unavailable', diet: ['vegetarian'] }],
      ['Тирамису', 'Савоярди, маскарпоне, эспрессо, какао.', 590, { concept: 'tiramisu', diet: ['vegetarian'] }],
      ['Мороженое дня', 'Три шарика на выбор, спросите официанта.', null, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'drinks',
    title: 'Напитки',
    items: [
      ['Лимонад с облепихой', 'Облепиха, мята, лимон.', 390, { diet: ['vegan'], portion: '400 мл' }],
      ['Морс из брусники', 'Ягоды, вода, мёд.', 320, { portion: '300 мл' }],
      // Алкоголь: в публичных данных не показывается (§8.4).
      ['Белое вино, бокал', 'Белое вино дома.', 690, { alcohol: true }],
    ],
  },
])

const osteria = buildMenu('osteria-da-bruno', 4, [
  {
    key: 'antipasti',
    title: 'Закуски',
    items: [
      ['Буррата с томатами', 'Буррата, томаты разных сортов, базилик, оливковое масло.', 890, { diet: ['vegetarian'] }],
      ['Карпаччо из говядины', 'Тонкие слайсы вырезки, руккола, пармезан, лимонная заправка.', 950, { portion: '120 г' }],
      ['Фокачча с розмарином', 'Тёплая фокачча из печи, оливковое масло.', 320, { diet: ['vegan', 'lenten'] }],
    ],
  },
  {
    key: 'pasta',
    title: 'Паста',
    items: [
      ['Пенне аррабиата', 'Пенне, острый томатный соус, чеснок, чили, пармезан.', 690, { id: 'penne-arrabbiata', photo: dishPhoto('rust', 'Пенне аррабиата'), concept: 'penne', diet: ['vegetarian', 'spicy'], portion: '280 г' }],
      ['Пенне с лососем', 'Пенне, сёмга, сливочный соус, шпинат.', 890, { id: 'penne-salmon', photo: dishPhoto('gold', 'Пенне с лососем'), concept: 'penne', portion: '300 г' }],
      ['Карбонара', 'Спагетти, гуанчале, желток, пекорино.', 790, { photo: dishPhoto('gold', 'Карбонара'), portion: '290 г' }],
      ['Тальолини с грибами', 'Домашняя паста, лесные грибы, сливки, тимьян.', 830, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'pizza',
    title: 'Пицца',
    items: [
      ['Маргарита', 'Томаты, моцарелла, базилик.', 650, { concept: 'margherita', diet: ['vegetarian'], portion: '30 см' }],
      ['Диавола', 'Томаты, моцарелла, острая салями, чили.', 790, { diet: ['spicy'], portion: '30 см' }],
    ],
  },
  {
    key: 'desserts',
    title: 'Десерты',
    items: [
      ['Тирамису классический', 'Маскарпоне, савоярди, эспрессо.', 490, { concept: 'tiramisu', diet: ['vegetarian'] }],
      ['Панна-котта с ягодами', 'Сливочный десерт, ягодный соус.', 450, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'drinks',
    title: 'Напитки',
    items: [
      ['Лимонад из цитрусов', 'Апельсин, лимон, розмарин.', 350, { diet: ['vegan'] }],
      ['Просекко, бокал', 'Игристое вино.', 590, { alcohol: true }],
    ],
  },
])

const forno = buildMenu('forno-napoli', 3, [
  {
    key: 'pizza',
    title: 'Пицца',
    items: [
      ['Маргарита', 'Томаты сан-марцано, моцарелла, базилик.', 590, { id: 'margherita', photo: dishPhoto('rust', 'Маргарита'), concept: 'margherita', diet: ['vegetarian'] }],
      ['Кватро формаджи', 'Моцарелла, горгонзола, пармезан, рикотта.', 790, { diet: ['vegetarian'] }],
      ['Пепперони', 'Томаты, моцарелла, пепперони.', 720, {}],
      ['Пицца с грибами и трюфелем', 'Белые грибы, моцарелла, трюфельное масло.', 890, { availability: 'temporarily_unavailable' }],
    ],
  },
  {
    key: 'pasta',
    title: 'Паста',
    items: [['Пенне ди Форно', 'Пенне, томатный соус, моцарелла, запечённые в печи.', 560, { concept: 'penne', diet: ['vegetarian'], portion: '270 г' }]],
  },
  {
    key: 'desserts',
    title: 'Десерты',
    items: [['Тирамису', 'Классический рецепт.', 420, { concept: 'tiramisu', diet: ['vegetarian'] }]],
  },
])

const kofe = buildMenu('kofe-and-more', 5, [
  {
    key: 'breakfast',
    title: 'Завтраки',
    items: [
      ['Шакшука', 'Яйца в пряном томатном соусе, лепёшка пита.', 490, { concept: 'shakshuka', diet: ['vegetarian'] }],
      ['Сырники со сметаной', 'Творожные сырники, сметана, ягодный соус.', 390, { diet: ['vegetarian'] }],
      ['Овсянка с яблоком', 'Овсяная каша на молоке, яблоко, корица.', 290, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'coffee',
    title: 'Кофе',
    items: [
      ['Капучино', 'Эспрессо и молочная пена.', 260, { id: 'cappuccino', concept: 'cappuccino', portion: '250 мл', diet: ['vegetarian'] }],
      ['Флэт уайт', 'Двойной эспрессо и молоко.', 290, { portion: '180 мл' }],
      ['Раф лавандовый', 'Эспрессо, сливки, лавандовый сироп.', 330, {}],
      ['Фильтр-кофе', 'Способ и обжарка меняются каждую неделю.', 300, { diet: ['vegan'] }],
    ],
  },
  {
    key: 'bakery',
    title: 'Выпечка',
    items: [
      ['Круассан с миндалём', 'Слоёное тесто, миндальный крем.', 240, { concept: 'croissant', diet: ['vegetarian'] }],
      ['Чизкейк «Нью-Йорк»', 'Сливочный сыр, песочная основа.', 320, { concept: 'cheesecake', diet: ['vegetarian'] }],
    ],
  },
])

const harvest = buildMenu('harvest', 6, [
  {
    key: 'seasonal',
    title: 'Сезонное',
    items: [
      ['Тыква, козий сыр, фундук', 'Печёная тыква, козий сыр, обжаренный фундук, облепиховая заправка.', 690, { diet: ['vegetarian'] }],
      ['Кролик с сельдереем', 'Томлёный кролик, крем из сельдерея, соус из белых грибов.', 1450, { portion: '230 г' }],
      ['Дегустационный сет из пяти блюд', 'Меняется по сезону, подаётся к 20:00.', 4200, { id: 'tasting-set', availability: 'available' }],
    ],
  },
  {
    key: 'pasta',
    title: 'Паста',
    items: [['Пенне с белыми грибами', 'Пенне, белые грибы, трюфельное масло, пармезан.', 890, { id: 'penne-mushroom', concept: 'penne', diet: ['vegetarian'], photo: dishPhoto('moss', 'Пенне с белыми грибами') }]],
  },
  {
    key: 'desserts',
    title: 'Десерты',
    items: [
      ['Груша в ягодном сиропе', 'Запечённая груша, ягодный сироп, ванильный крем.', 590, { diet: ['vegetarian'] }],
      ['Тирамису с облепихой', 'Облепиховый соус вместо какао.', 550, { concept: 'tiramisu', diet: ['vegetarian'] }],
    ],
  },
])

// Меню бара в публичных данных: только закуски и безалкогольное. Алкогольные позиции есть в исходных данных и отфильтровываются.
const copitas = buildMenu('el-copitas-bar', 2, [
  {
    key: 'snacks',
    title: 'Закуски',
    items: [
      ['Ростбиф с горчицей', 'Тонкие слайсы, горчица, корнишоны.', 690, {}],
      ['Оливки и вяленые томаты', 'Каламата, вяленые томаты, розмарин.', 420, { diet: ['vegan', 'lenten'] }],
      ['Тапас-сет', 'Хамон, сыр, оливки, гриссини на компанию.', 1490, { portion: 'на двоих' }],
    ],
  },
  {
    key: 'na',
    title: 'Безалкогольное',
    items: [
      ['Лимонад имбирный', 'Имбирь, лайм, содовая.', 350, { diet: ['vegan'] }],
      ['Тоник с розмарином', 'Тоник, розмарин, цитрус.', 320, {}],
    ],
  },
  {
    key: 'bar',
    title: 'Коктейли',
    items: [
      ['Негрони', 'Классический коктейль.', 690, { alcohol: true }],
      ['Олд фэшн', 'Классический коктейль.', 720, { alcohol: true }],
      ['Крафтовое пиво, 0,4', 'Разливное, меняется.', 450, { alcohol: true }],
    ],
  },
])

const sintoho = buildMenu('sintoho', 3, [
  {
    key: 'ramen',
    title: 'Рамэн',
    items: [
      ['Рамэн с курицей', 'Бульон, курица, яйцо, зелёный лук, лапша.', 790, { concept: 'ramen', photo: dishPhoto('wine', 'Рамэн с курицей'), portion: '450 мл' }],
      ['Острый рамэн', 'Пряный бульон, свинина, чили, кунжут.', 850, { concept: 'ramen', diet: ['spicy'] }],
      ['Веганский рамэн', 'Овощной бульон, тофу, грибы шиитаке.', 750, { concept: 'ramen', diet: ['vegan'] }],
    ],
  },
  {
    key: 'wok',
    title: 'Вок',
    items: [
      ['Вок с говядиной', 'Говядина, овощи, соус терияки, рис.', 890, {}],
      ['Вок с овощами и кешью', 'Овощи, кешью, соус хойсин.', 690, { diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'rolls',
    title: 'Роллы',
    items: [
      ['Ролл с лососем', 'Лосось, авокадо, сливочный сыр.', 620, { portion: '8 шт.' }],
      ['Ролл с тунцом', 'Тунец, огурец, спайси-соус.', 680, { portion: '8 шт.', availability: 'temporarily_unavailable' }],
    ],
  },
])

const khachapuri = buildMenu('khachapuri-lab', 5, [
  {
    key: 'khachapuri',
    title: 'Хачапури',
    items: [
      ['Хачапури по-аджарски', 'Лодочка из теста, сулугуни, желток, масло.', 690, { id: 'adjarian', concept: 'khachapuri', photo: dishPhoto('gold', 'Хачапури по-аджарски'), diet: ['vegetarian'] }],
      ['Хачапури по-имеретински', 'Круглая лепёшка с сыром.', 590, { concept: 'khachapuri', diet: ['vegetarian'] }],
      ['Хачапури с ветчиной', 'Слоёное тесто, сыр, ветчина.', 640, { concept: 'khachapuri' }],
    ],
  },
  {
    key: 'khinkali',
    title: 'Хинкали',
    items: [
      ['Хинкали с говядиной', 'Пять штук.', 620, { portion: '5 шт.' }],
      ['Хинкали с грибами', 'Пять штук.', 570, { portion: '5 шт.', diet: ['vegetarian'] }],
    ],
  },
  {
    key: 'grill',
    title: 'Мангал',
    items: [
      ['Шашлык из баранины', 'Баранья корейка, лук, соус ткемали.', 1190, { portion: '220 г' }],
      ['Овощи на мангале', 'Баклажаны, перец, томаты.', 520, { diet: ['vegan', 'lenten'] }],
    ],
  },
])

/** Исходные меню, включая алкогольные позиции. Читать только через `selectors.ts`. */
export const menusRaw: readonly Menu[] = [birch, osteria, forno, kofe, harvest, copitas, sintoho, khachapuri]
