# scaffold — Vue-разметка дизайн-системы «Местами вкусно»

Каркас фронтенда: дизайн-система из `../design-system.html`, разобранная на минимальные типизированные компоненты Vue 3 + TypeScript, и страница-витрина, которая их показывает. Документы в `materials/` рабочей области — источник истины по функциям; здесь только форма, цвет и состояния.

## Запуск

```sh
bun install
bun dev             # витрина на http://localhost:5173
bun run build       # проверка типов (vue-tsc) и сборка
bun run type-check
```

## Структура

```
src/
  main.ts                    точка входа: тема + стили + монтирование
  App.vue                    монтирует витрину
  design-system/             сама дизайн-система (не знает о витрине и о продукте)
    styles/                  tokens.css (тёмная и светлая тема), base.css
    icons/shapes.ts          типизированный реестр иконок (IconName)
    types/                   общие типы: ThemeName, SpaceToken, NavItem, ...
    composables/             useTheme, useCssToken, useArrowNavigation
    components/
      layout/                UiStack, UiCluster, UiGrid — раскладка
      atoms/                 неделимые элементы: UiButton, UiInput, UiBadge, UiIcon, ...
      molecules/             сборки из атомов: UiField, UiTabs, UiMediaCard, ...
      organisms/             крупные блоки: UiAppHeader, UiTabBar, UiFooter, ...
    index.ts                 публичный API (`@/design-system`)
  showcase/                  страница-витрина (только для просмотра системы)
    components/              обвязка страницы: секция, сцена, образец цвета
    sections/                разделы: цвета, кнопки, поля, карточки, ...
    data/                    типизированные данные для витрины
```

## Правила

- **Слои идут вниз.** `layout` и `atoms` не импортируют ничего выше; `molecules` собираются из `atoms`; `organisms` — из `atoms` и `molecules`. Витрина импортирует только из `@/design-system`.
- **Один компонент — одна папка.** `UiName/UiName.vue` и рядом `types.ts` с интерфейсом пропсов (`UiNameProps`) и связанными типами. Публичные имена и типы экспортируются из `index.ts` слоя.
- **Стили только через токены.** Цвета, отступы, радиусы — `var(--…)` из `tokens.css`. Тема переключается атрибутом `data-theme` на `<html>` или на любом блоке (`UiThemeScope`).
- **Состояния для витрины.** У `UiButton` и `UiInput` есть `previewState` — принудительно показывает hover/pressed/focus; в продукте не используется.
- **Доступность.** Иконочные кнопки требуют `label`; поля получают `id` и `aria-describedby` от `UiField` через слот; вкладки и сегменты управляются стрелками.
- **Данные не в компонентах.** Тексты и списки живут в `showcase/data`, компоненты принимают их пропсами.

## Что дальше

- Заменить текстовый макет логотипа (`UiLogo`) оригинальным знаком.
- Подключить шрифт локально вместо Google Fonts, если нужен запуск без сети.
- Добавить тесты компонентов и линтер, когда определится стек продукта.
