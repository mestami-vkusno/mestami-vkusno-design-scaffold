<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiToast } from '@/design-system'
import { cityOffer, readDeviceCityFromUrl } from '@/overlays/cityOffer'
import { installShareListener, useOverlays } from '@/overlays/useOverlays'
import CitySheet from '@/shell/components/CitySheet.vue'
import CreateSheet from '@/shell/components/CreateSheet.vue'
import ProductFooter from '@/shell/components/ProductFooter.vue'
import ProductHeader from '@/shell/components/ProductHeader.vue'
import ProductTabBar from '@/shell/components/ProductTabBar.vue'
import RouteAnnouncer from '@/shell/components/RouteAnnouncer.vue'
import { useCity } from '@/shell/composables/useCity'
import { useInternalLinks } from '@/shell/composables/useInternalLinks'
import { useShellOverlays } from '@/shell/composables/useShellOverlays'
import { useViewer } from '@/shell/composables/useViewer'
import { FOOTER_COLUMNS, FOOTER_COPYRIGHT, FOOTER_DESCRIPTION, FOOTER_SERVICE_LINKS } from '@/shell/data/footer'
import { CREATE_ACTIONS, DESKTOP_NAV_ITEMS, TAB_BAR_ITEMS } from '@/shell/data/navigation'
import { KEEP_ALIVE_LIMIT, KEEP_ALIVE_NAMES } from '@/shell/data/routes'
import { applyPendingScroll } from '@/shell/scroll'
import SiteTopbar from '@/shell/SiteTopbar.vue'

const route = useRoute()
const router = useRouter()
const { cities, city, cityId, setCity } = useCity()
const { viewer } = useViewer()
const { createOpen, cityOpen } = useShellOverlays()

useInternalLinks()

// Оверлеи без маршрута (O7, O9, O10, правка профиля) и предложение сменить город (O2): чанки подгружаются при первом показе.
const OverlayHost = defineAsyncComponent(() => import('@/overlays/OverlayHost.vue'))
const CityOffer = defineAsyncComponent(() => import('@/overlays/CityOffer.vue'))
const { view: overlayView } = useOverlays()
installShareListener()
readDeviceCityFromUrl(cityId.value)

// Витрина дизайн-системы и анимаций живёт со своей шапкой, страницы продукта — с оболочкой продукта (в том числе 404).
const isProduct = computed(() => route.meta.layout !== 'showcase')
const hasTabBar = computed(() => isProduct.value && route.meta.chrome !== 'focused')

// Подвал гаснет вместе с уходящей страницей и появляется вместе с новой.
const leaving = ref(false)

function onEnter(): void {
  leaving.value = false
  applyPendingScroll()
}

// Фокус переносим сами: обычный переход по якорю оставил бы `#view` в адресе.
function focusView(): void {
  document.getElementById('view')?.focus()
}

function onReselect(): void {
  window.scrollTo({ top: 0, behavior: 'instant' })
}

// Первая страница появляется без перехода: положение прокрутки после перезагрузки применяем сами.
onMounted(() => void router.isReady().then(() => nextTick(applyPendingScroll)))
</script>

<template>
  <a v-if="isProduct" class="skip-link" href="#view" @click.prevent="focusView">К содержимому</a>
  <div class="app-shell" :class="{ 'app-shell--tab-bar': hasTabBar }">
    <ProductHeader
      v-if="isProduct"
      :nav-items="DESKTOP_NAV_ITEMS"
      :active-nav="route.meta.nav"
      :city-name="city.name"
      :viewer="viewer"
      @open-city="cityOpen = true"
      @open-create="createOpen = true"
    />
    <SiteTopbar v-else :sections="route.meta.sections ?? []" />
    <CityOffer v-if="isProduct && cityOffer !== null" />

    <div id="view" class="app-view" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in" @before-leave="leaving = true" @enter="onEnter">
          <KeepAlive :include="[...KEEP_ALIVE_NAMES]" :max="KEEP_ALIVE_LIMIT">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </div>

    <ProductFooter
      v-if="hasTabBar"
      :columns="FOOTER_COLUMNS"
      :description="FOOTER_DESCRIPTION"
      :copyright="FOOTER_COPYRIGHT"
      :service-links="FOOTER_SERVICE_LINKS"
      :fading="leaving"
    />
  </div>

  <template v-if="isProduct">
    <ProductTabBar v-if="hasTabBar" :items="TAB_BAR_ITEMS" :active="route.meta.tab" @popup="createOpen = true" @reselect="onReselect" />
    <CreateSheet v-model:open="createOpen" :actions="CREATE_ACTIONS" />
    <CitySheet v-model:open="cityOpen" :cities="cities" :active-id="cityId" @select="setCity" />
  </template>
  <OverlayHost v-if="overlayView.requested" />
  <UiToast :class="{ 'app-toast--above-tab-bar': hasTabBar }" />
  <RouteAnnouncer />
</template>

<style>
/* Колонка на всю высоту экрана: подвал остаётся внизу и у короткой страницы. */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-view {
  flex: 1 0 auto;
}

.app-view:focus {
  outline: none;
}

/* Место под плавающую нижнюю навигацию, чтобы она не закрывала конец страницы. */
.app-shell--tab-bar {
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
}

/* Тосты поднимаются над плавающей нижней навигацией (на десктопе её нет). */
.app-toast--above-tab-bar {
  --toast-bottom: calc(76px + var(--s-3) + env(safe-area-inset-bottom));
}

@media (min-width: 900px) {
  .app-shell--tab-bar {
    padding-bottom: 0;
  }

  .app-toast--above-tab-bar {
    --toast-bottom: calc(var(--s-4) + env(safe-area-inset-bottom));
  }
}

.skip-link {
  position: fixed;
  top: var(--s-2);
  left: var(--s-2);
  z-index: 30;
  padding: var(--s-2) var(--s-4);
  border-radius: var(--r-md);
  background: var(--lime);
  color: var(--on-accent);
  font-weight: 600;
  text-decoration: none;
  transform: translateY(-200%);
}

.skip-link:focus-visible {
  transform: none;
}

/* Переход между страницами: уход быстрее прихода, приход с лёгким подъёмом. Шапка и нижняя навигация не участвуют
   и остаются на месте: transform на предке сломал бы position: fixed внутри страницы, а слой на всю длинную
   страницу дорог на телефонах. */
.page-leave-active {
  transition: opacity var(--dur-page-out) var(--ease-out);
}

.page-enter-active {
  transition:
    opacity var(--dur-page-in) var(--ease-out),
    transform var(--dur-page-in) var(--ease-out);
}

.page-leave-to {
  opacity: 0;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(calc(8px * var(--motion-distance)));
}
</style>
