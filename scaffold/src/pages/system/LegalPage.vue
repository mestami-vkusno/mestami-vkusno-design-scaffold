<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UiBreadcrumbs, UiButton, UiEmptyState, UiSideMenu, UiSkeleton, UiText } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import SrHeading from './SrHeading.vue'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { findLegalDocument, LEGAL_DOCUMENTS } from './legalDocuments'
import { parseLegalMarkdown, type LegalBlock } from './legalMarkdown'

// Юридический документ по единому шаблону (X3, §2.8 `docs/front-structure.md`): один компонент рендерит любой
// из восьми документов `materials/legal/b2c/*`, текст которых лежит в `./legal-content/` (по документу — свой
// ленивый чанк, реестр — `legalDocuments.ts`). Маршрут `/legal/:slug` завёден задачей 0004 `(assumption)`.

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const doc = computed(() => findLegalDocument(slug.value))

type LoadState = 'initial_loading' | 'loaded' | 'recoverable_error'
const state = ref<LoadState>('initial_loading')
const blocks = ref<LegalBlock[]>([])
// Чанк документа обычно приходит за миллисекунды: скелетон показываем, только если загрузка затянулась, чтобы он не мигал.
const SKELETON_DELAY_MS = 150
const skeletonVisible = ref(false)
let skeletonTimer: ReturnType<typeof setTimeout> | undefined

function clearSkeletonTimer(): void {
  clearTimeout(skeletonTimer)
  skeletonTimer = undefined
}

onBeforeUnmount(clearSkeletonTimer)

const menuItems = computed(() => LEGAL_DOCUMENTS.map((item) => ({ id: item.slug, label: item.title, href: `/legal/${item.slug}` })))

useDocumentTitle(() => doc.value?.title)

async function load(): Promise<void> {
  const current = doc.value
  if (!current) return
  state.value = 'initial_loading'
  skeletonVisible.value = false
  clearSkeletonTimer()
  skeletonTimer = setTimeout(() => (skeletonVisible.value = true), SKELETON_DELAY_MS)
  try {
    const text = await current.load()
    if (doc.value?.slug !== current.slug) return // пока грузили, ушли на другой документ
    // Первый `#` документа повторяет заголовок страницы (<h1> выше): в тексте его не показываем.
    const parsed = parseLegalMarkdown(text)
    blocks.value = parsed[0]?.type === 'heading' && parsed[0].level === 1 ? parsed.slice(1) : parsed
    state.value = 'loaded'
  } catch {
    if (doc.value?.slug === current.slug) state.value = 'recoverable_error'
  } finally {
    if (doc.value?.slug === current.slug) clearSkeletonTimer()
  }
}

watch(
  () => doc.value?.slug,
  () => {
    if (doc.value) void load()
  },
  { immediate: true },
)

// Браузер запоминает неудачный динамический import() по тому же адресу, поэтому «Повторить» на месте не помогло бы:
// при сбое загрузки чанка (обрыв сети, устаревшая сборка) надёжный способ — перезагрузить страницу.
function reload(): void {
  window.location.reload()
}

// Заголовок документа внутри текста (Markdown `#`) сдвигается на уровень ниже page `<h1>`, чтобы на странице
// был только один h1 (заголовок уже вывели отдельно) и не терялась иерархия разделов документа.
function headingTag(level: 1 | 2 | 3): string {
  return `h${Math.min(level + 1, 4)}`
}
</script>

<template>
  <main class="legal-page">
    <ShellContainer>
      <UiBreadcrumbs :items="[{ label: 'Главная', href: '/' }, { label: 'Документы' }, { label: doc?.title ?? 'Документ' }]" class="legal-page__crumbs" />

      <template v-if="doc">
        <UiText as="h1" variant="h1">{{ doc.title }}</UiText>

        <div class="legal-page__layout">
          <UiSideMenu class="legal-page__menu" label="Юридические документы" :items="menuItems" :model-value="doc.slug" />

          <div v-if="state === 'initial_loading'" class="legal-page__skeleton" aria-busy="true">
            <template v-if="skeletonVisible">
              <UiSkeleton variant="text" :lines="2" width="60%" />
              <UiSkeleton variant="text" :lines="8" />
              <UiSkeleton variant="text" :lines="6" width="90%" />
            </template>
          </div>

          <UiEmptyState v-else-if="state === 'recoverable_error'" mode="error" title="Не удалось загрузить документ" description="Проверьте соединение и попробуйте ещё раз.">
            <template #actions><UiButton icon-left="refresh" @click="reload">Повторить</UiButton></template>
          </UiEmptyState>

          <article v-else class="legal-page__content">
            <template v-for="(block, index) in blocks" :key="index">
              <component :is="headingTag(block.level)" v-if="block.type === 'heading'" class="legal-page__heading">
                <template v-for="(seg, si) in block.inline" :key="si"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
              </component>

              <p v-else-if="block.type === 'paragraph' && block.lines.length > 0" class="legal-page__paragraph">
                <template v-for="(lineSegs, li) in block.lines" :key="li">
                  <template v-for="(seg, si) in lineSegs" :key="si"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
                  <br v-if="li < block.lines.length - 1" />
                </template>
              </p>

              <ul v-else-if="block.type === 'list'" class="legal-page__list">
                <li v-for="(item, ii) in block.items" :key="ii">
                  <template v-for="(seg, si) in item" :key="si"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
                </li>
              </ul>

              <div v-else-if="block.type === 'table'" class="legal-page__table-wrap">
                <table class="legal-page__table">
                  <thead>
                    <tr>
                      <th v-for="(cell, ci) in block.header" :key="ci">
                        <template v-for="(seg, si) in cell" :key="si"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, ri) in block.rows" :key="ri">
                      <td v-for="(cell, ci) in row" :key="ci">
                        <template v-for="(seg, si) in cell" :key="si"><strong v-if="seg.bold">{{ seg.text }}</strong><template v-else>{{ seg.text }}</template></template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <hr v-else-if="block.type === 'hr'" class="legal-page__hr" />
            </template>
          </article>
        </div>
      </template>

      <template v-else>
        <SrHeading>Документ не найден</SrHeading>
        <UiEmptyState mode="empty" page :heading-level="2" title="Документ не найден" description="Такого юридического документа нет. Выберите документ из списка.">
          <template #actions>
            <UiButton v-for="item in LEGAL_DOCUMENTS" :key="item.slug" :href="`/legal/${item.slug}`" variant="outline" size="sm">{{ item.title }}</UiButton>
          </template>
        </UiEmptyState>
      </template>
    </ShellContainer>
  </main>
</template>

<style scoped>
.legal-page {
  padding-block: var(--s-6) var(--s-12);
}

.legal-page__crumbs {
  margin-bottom: var(--s-4);
}

.legal-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-6);
  margin-top: var(--s-6);
}

/* На телефоне список документов уходит под текст, на десктопе — колонка слева. */
.legal-page__menu.ui-side-menu {
  order: 1;
  width: 100%;
}

/* Длинный текст документа не обязан рендериться целиком сразу: браузер пропускает раскладку и покраску
   отсечённых секций, пока они не рядом со вьюпортом (чек-лист плавности на телефонах). */
.legal-page__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  max-width: 72ch;
  content-visibility: auto;
  contain-intrinsic-size: auto 8000px;
}

.legal-page__skeleton {
  display: grid;
  min-height: 60dvh;
  gap: var(--s-4);
  max-width: 72ch;
}

.legal-page__heading {
  margin: var(--s-6) 0 var(--s-2);
  overflow-wrap: anywhere;
}

.legal-page__heading:first-child {
  margin-top: 0;
}

.legal-page__paragraph {
  margin: 0 0 var(--s-3);
  color: var(--text-2);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.legal-page__list {
  margin: 0 0 var(--s-3);
  padding-inline-start: var(--s-5);
  color: var(--text-2);
  line-height: 1.6;
  display: grid;
  gap: var(--s-1);
}

.legal-page__hr {
  margin: var(--s-6) 0;
  border: none;
  border-top: 1px solid var(--border);
}

.legal-page__table-wrap {
  margin: 0 0 var(--s-4);
  overflow-x: auto;
}

.legal-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.legal-page__table th,
.legal-page__table td {
  padding: var(--s-2) var(--s-3);
  border: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

.legal-page__table th {
  background: var(--surface);
  font-weight: 600;
}

@media (min-width: 900px) {
  .legal-page__layout {
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
  }

  .legal-page__menu.ui-side-menu {
    order: 0;
    position: sticky;
    top: var(--s-6);
  }
}
</style>
