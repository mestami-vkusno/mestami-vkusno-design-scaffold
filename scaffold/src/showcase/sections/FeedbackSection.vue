<script setup lang="ts">
import { ref } from 'vue'
import { UiBanner, UiButton, UiCluster, UiEmptyState, UiGrid, UiLink, UiSkeleton, UiStack, UiSurface, UiText, useToast } from '@/design-system'
import { BANNER_TEXT, TOAST_EXAMPLES } from '../data/feedback'
import ShowcaseNote from '../components/ShowcaseNote.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const { show, clear } = useToast()

const hintShown = ref(true)
const offlineShown = ref(true)
const loading = ref(true)
</script>

<template>
  <ShowcaseSection
    id="feedback"
    title="Состояния и обратная связь"
    lead="Пусто и ошибка — разные состояния: у пустого нейтральный тон и путь к наполнению, у ошибки понятная причина и «Повторить». Загрузка — статичные формы будущего экрана, без пульсации."
  >
    <ShowcaseSubheading first>Баннеры</ShowcaseSubheading>
    <UiStack :gap="3">
      <UiBanner>{{ BANNER_TEXT.info }}</UiBanner>
      <UiBanner variant="success">{{ BANNER_TEXT.success }}</UiBanner>
      <UiBanner variant="warning" title="Не удалось загрузить">
        {{ BANNER_TEXT.warning }}
        <template #action><UiButton size="sm" variant="neutral">Повторить</UiButton></template>
      </UiBanner>
      <UiBanner variant="danger" icon="alert">
        {{ BANNER_TEXT.danger }}
        <template #action><UiButton size="sm">Повторить</UiButton></template>
      </UiBanner>
      <UiBanner v-if="hintShown" dismissible @dismiss="hintShown = false">{{ BANNER_TEXT.dismissible }}</UiBanner>
      <UiCluster v-else>
        <UiButton size="sm" variant="ghost" @click="hintShown = true">Показать подсказку снова</UiButton>
      </UiCluster>
    </UiStack>

    <ShowcaseSubheading>Баннер «Нет сети» с плавным появлением</ShowcaseSubheading>
    <ShowcaseStage>
      <UiStack :gap="3" class="feedback-offline">
        <UiButton size="sm" variant="neutral" @click="offlineShown = !offlineShown">{{ offlineShown ? 'Скрыть баннер' : 'Показать баннер' }}</UiButton>
        <div class="feedback-offline__slot">
          <UiBanner v-if="offlineShown" animated icon="wifi-off" title="Нет сети">{{ BANNER_TEXT.offline }}</UiBanner>
        </div>
      </UiStack>
    </ShowcaseStage>

    <ShowcaseSubheading>Уведомления</ShowcaseSubheading>
    <ShowcaseStage>
      <UiStack :gap="3">
        <UiText variant="caption">Появляются снизу, уходят через 4 с (с кнопкой — через 8 с). Пока на тосте курсор или фокус, время стоит. Escape закрывает.</UiText>
        <UiCluster>
          <UiButton v-for="example in TOAST_EXAMPLES" :key="example.id" size="sm" variant="neutral" @click="show(example.options)">{{ example.label }}</UiButton>
          <UiButton size="sm" variant="ghost" @click="clear">Убрать все</UiButton>
        </UiCluster>
      </UiStack>
    </ShowcaseStage>

    <ShowcaseSubheading>Пустые состояния</ShowcaseSubheading>
    <UiGrid :min="260" align="start">
      <UiSurface variant="panel">
        <UiEmptyState title="Пока ничего нового" description="Ответы и подписчики появятся здесь">
          <template #actions><UiButton>Найти авторов</UiButton></template>
        </UiEmptyState>
      </UiSurface>
      <UiSurface variant="panel">
        <UiEmptyState mode="error" title="Не удалось загрузить страницу" description="Что-то пошло не так. Попробуйте ещё раз">
          <template #actions>
            <UiButton>Повторить</UiButton>
            <UiLink href="#feedback" variant="muted">На главную</UiLink>
          </template>
        </UiEmptyState>
      </UiSurface>
      <UiSurface variant="panel">
        <UiEmptyState mode="offline" title="Нет соединения" description="Проверьте интернет. Черновики сохранены на устройстве">
          <template #actions><UiButton variant="outline">Повторить</UiButton></template>
        </UiEmptyState>
      </UiSurface>
      <UiSurface variant="panel">
        <UiEmptyState mode="guest" title="Войдите, чтобы сохранять места" description="Избранное и дневник хранятся в вашем аккаунте">
          <template #actions><UiButton>Войти или создать аккаунт</UiButton></template>
        </UiEmptyState>
      </UiSurface>
    </UiGrid>

    <ShowcaseSubheading>Скелетоны</ShowcaseSubheading>
    <UiGrid :min="260" align="start">
      <ShowcaseStage>
        <UiStack :gap="4">
          <UiText variant="caption">Строки, блок с пропорцией, круг</UiText>
          <UiSkeleton variant="text" :lines="3" />
          <UiSkeleton ratio="4/3" />
          <UiCluster>
            <UiSkeleton variant="circle" :size="24" />
            <UiSkeleton variant="circle" :size="40" />
            <UiSkeleton variant="circle" :size="64" />
          </UiCluster>
        </UiStack>
      </ShowcaseStage>
      <ShowcaseStage>
        <UiSurface class="feedback-card">
          <UiStack :gap="3" class="feedback-card__body">
            <Transition name="feedback-fade" mode="out-in">
              <UiSkeleton v-if="loading" label="Загружаем публикацию">
                <div class="feedback-card__head">
                  <UiSkeleton variant="circle" :size="40" />
                  <UiSkeleton variant="text" :lines="2" width="60%" />
                </div>
                <UiSkeleton ratio="4/3" />
                <UiSkeleton variant="text" :lines="2" />
              </UiSkeleton>
              <UiStack v-else :gap="3">
                <UiText variant="h3">Ужин на Рубинштейна</UiText>
                <UiText>Контент появляется на месте скелетона: сменяется прозрачностью, форма страницы не прыгает.</UiText>
              </UiStack>
            </Transition>
            <UiButton size="sm" variant="neutral" @click="loading = !loading">{{ loading ? 'Показать контент' : 'Показать скелетон' }}</UiButton>
          </UiStack>
        </UiSurface>
      </ShowcaseStage>
    </UiGrid>

    <ShowcaseNote>
      <b>Тосты живут в одном регионе.</b> <code>&lt;UiToast /&gt;</code> монтируется один раз в оболочке (регион <code>aria-live</code> должен быть на странице до первого сообщения), а показывает их <code>useToast().show()</code> из любого места. Нижний отступ задаёт токен <code>--toast-bottom</code>: над нижней навигацией оболочка поднимает его.
    </ShowcaseNote>
  </ShowcaseSection>
</template>

<style scoped>
/* Скелетон сменяется контентом одной прозрачностью, без сдвига. */
.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity var(--dur-dropdown) var(--ease-out);
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}

.feedback-offline {
  max-width: 560px;
}

/* Место под баннер не схлопывается, пока он скрыт: нижний блок не прыгает. */
.feedback-offline__slot {
  min-height: 72px;
}

.feedback-card {
  max-width: 360px;
}

.feedback-card__body {
  padding: var(--s-4);
}

.feedback-card__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}
</style>
