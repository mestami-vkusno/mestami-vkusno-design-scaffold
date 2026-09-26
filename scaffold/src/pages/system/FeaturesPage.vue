<script setup lang="ts">
import { computed } from 'vue'
import { UiBanner, UiButton, UiCluster, UiEmptyState, UiGrid, UiStack, UiText, UiToast } from '@/design-system'
import type { EventPrice, MenuItem, PostComment, Review, Venue, VenueEvent } from '@/mocks/types'
import { reviews as allReviews, ratings } from '@/mocks/reviews'
import { collectionByline, getCollection } from '@/mocks/selectors/collections'
import { getEvent } from '@/mocks/selectors/events'
import { featuredDishes, getMenuItem } from '@/mocks/selectors/menu'
import { getVenue, openState, openStatusLabel, venueLocationLabel } from '@/mocks/selectors/places'
import { commentsCount, getAuthor, getCommentThreads, getPost, getVenuePost } from '@/mocks/selectors/social'
import { MOCK_USER } from '@/mocks/library'
import { resetMock, useViewer } from '@/shell/composables/useViewer'
import { useDocumentTitle } from '@/shell/composables/useDocumentTitle'
import { useProgressiveMount } from '@/shell/useProgressiveMount'
import ShowcaseContainer from '@/showcase/components/ShowcaseContainer.vue'
import ShowcaseSection from '@/showcase/components/ShowcaseSection.vue'
import ShowcaseSubheading from '@/showcase/components/ShowcaseSubheading.vue'
import { usePremium, type PremiumPhase } from '@/state/usePremium'
import {
  ActionButton,
  AuthorCard,
  AuthorRow,
  CardSkeleton,
  CollectionCard,
  CommentItem,
  DishRow,
  EventCard,
  EventRow,
  HorizontalRail,
  OpenNowLabel,
  PriceLabel,
  RatingLabel,
  ReviewCard,
  SectionHeader,
  ShareButton,
  StatusBadge,
  VenueCard,
  VenueRow,
  type VenueCardProps,
} from '@/features'
import { AiTeaser, FavoriteButton, FollowButton, LikeButton, PostCard, SaveButton, type PostCardData } from '@/features/actions'

useDocumentTitle('Общие блоки', { suffix: false })

const { isSignedIn, signIn, signOut } = useViewer()
const premium = usePremium()

const PHASES: readonly { id: PremiumPhase; label: string }[] = [
  { id: 'none', label: 'Нет' },
  { id: 'active', label: 'Активен' },
  { id: 'trial', label: 'Пробный' },
  { id: 'grace', label: 'Льготный' },
  { id: 'canceled_active', label: 'Отменён до конца' },
  { id: 'expired', label: 'Истёк' },
]

// ── Данные: только через селекторы, как в продукте ────────────────────────
function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Нет данных мока: ${what}`)
  return value
}

const venue = (id: string): Venue => must(getVenue(id), id)
const event = (id: string): VenueEvent => must(getEvent(id), id)
const author = (id: string) => must(getAuthor(id), id)

function venueProps(id: string, extra: Partial<VenueCardProps> = {}): VenueCardProps {
  const found = venue(id)
  return { venue: found, location: venueLocationLabel(found), ...extra }
}

function openOf(id: string) {
  const found = venue(id)
  return { state: openState(found), label: openStatusLabel(found) }
}

function eventProps(id: string) {
  const found = event(id)
  const place = venue(found.venueId)
  return { event: found, occurrence: found.occurrences[0], venueName: place.name, location: venueLocationLabel(place) }
}

const venueStates = [
  { title: 'Работает, открыто сейчас, сегодня событие', props: venueProps('birch', { open: openOf('birch'), hasEventToday: true }) },
  { title: 'Новое место (NEW)', props: venueProps('forno-napoli', { open: openOf('forno-napoli') }) },
  { title: 'Скоро открытие (нет оценок, чека)', props: venueProps('nola') },
  { title: 'Временно закрыто', props: venueProps('tokio') },
  { title: 'Приостановлено', props: venueProps('futura') },
  { title: 'Закрыто навсегда', props: venueProps('lilo') },
  { title: 'Мало оценок: агрегат скрыт (§16.1)', props: venueProps('remeslo', { open: openOf('remeslo') }) },
] as const

const railVenues = ['birch', 'osteria-da-bruno', 'kuznya-house', 'terrassa', 'kofe-and-more', 'panorama-360'] as const
const rowVenues = ['harvest', 'sintoho', 'nola', 'lilo'] as const

const eventStates = [
  { title: 'Запланировано, фиксированная цена', id: 'event-chef-dinner-birch' },
  { title: 'Места закончились', id: 'event-wine-tasting-harvest' },
  { title: 'Перенесено', id: 'event-sicilian-osteria' },
  { title: 'Отменено, стоимость не указана', id: 'event-dj-futura' },
  { title: 'Завершено', id: 'event-cocktails-lilo' },
  { title: 'Бесплатно', id: 'event-jazz-copitas' },
  { title: 'Депозит, NEW', id: 'event-natural-wine-inside' },
  { title: 'Цена «от»', id: 'event-italian-evening-charlie' },
  { title: 'Нужна регистрация', id: 'event-coffee-cupping-kofe' },
] as const

const EVENT_PRICES: readonly { title: string; price: EventPrice }[] = [
  { title: 'Бесплатно', price: { kind: 'free' } },
  { title: 'Фиксированная', price: { kind: 'fixed', amountRub: 4500 } },
  { title: 'От', price: { kind: 'from', amountRub: 2900 } },
  { title: 'Депозит', price: { kind: 'deposit', amountRub: 1000 } },
  { title: 'Нужна регистрация', price: { kind: 'registration_required' } },
  { title: 'Не указана', price: { kind: 'not_specified' } },
]

function collectionProps(id: string) {
  const found = must(getCollection(id), id)
  return { collection: found, byline: collectionByline(found) }
}

function userPostData(id: string, extra: { own?: boolean; withRemovedDish?: boolean } = {}): PostCardData {
  const post = must(getPost(id), id)
  const place = post.venueId === null ? undefined : venue(post.venueId)
  const dish = post.menuItemId === undefined ? undefined : getMenuItem(post.menuItemId)
  const linkedEvent = post.eventId === undefined ? undefined : event(post.eventId)
  return {
    variant: 'user',
    post,
    author: author(post.authorId),
    ...(place === undefined ? {} : { venue: { id: place.id, name: place.name, location: venueLocationLabel(place), rating: place.rating } }),
    ...(extra.withRemovedDish
      ? { dish: { id: 'birch-05', venueId: 'birch', name: 'Бургундские улитки', removed: true } }
      : dish === undefined
        ? {}
        : { dish: { id: dish.id, venueId: dish.venueId, name: dish.name, removed: dish.availability === 'removed' } }),
    ...(linkedEvent === undefined ? {} : { event: { id: linkedEvent.id, title: linkedEvent.title } }),
    commentsCount: commentsCount(post.id),
    ...(extra.own === undefined ? {} : { own: extra.own }),
  }
}

function venuePostData(id: string): PostCardData {
  const post = must(getVenuePost(id), id)
  const place = venue(post.venueId)
  const linkedEvent = post.eventId === undefined ? undefined : event(post.eventId)
  return {
    variant: 'venue',
    post,
    venue: { id: place.id, name: place.name, location: venueLocationLabel(place), rating: place.rating, logo: place.gallery[0] },
    ...(linkedEvent === undefined ? {} : { event: { id: linkedEvent.id, title: linkedEvent.title } }),
  }
}

function collectionPostData(id: string): PostCardData {
  const found = must(getCollection(id), id)
  return {
    variant: 'collection',
    collection: found,
    byline: collectionByline(found),
    ...(found.ownerId === null ? {} : { author: author(found.ownerId) }),
  }
}

const postStates = [
  { title: 'Пользователь: два фото, заведение, блюдо, оценка', data: userPostData('post-04', { own: true }) },
  { title: 'Пользователь: событие, два фото', data: userPostData('post-02') },
  { title: 'Пользователь: комментарии отключены, без фото', data: userPostData('post-20') },
  { title: 'Пользователь: на модерации (своя)', data: userPostData('post-21', { own: true }) },
  { title: 'Пользователь: приватная, позиции меню больше нет', data: { ...userPostData('post-25', { own: true, withRemovedDish: true }) } },
  { title: 'Официальный контент заведения', data: venuePostData('vpost-01') },
  { title: 'Официальный контент: связано с событием', data: venuePostData('vpost-02') },
  { title: 'Подборка редакции', data: collectionPostData('col-ed-date') },
  { title: 'Подборка автора', data: collectionPostData('col-u-dmitry-chef') },
] as const

const collectionTiles = ['col-ed-date', 'col-u-dmitry-chef', 'col-u-maria-private', 'col-u-maria-draft'] as const

// Комментарии: живая ветка + состояния отправки (O8).
const threads = getCommentThreads('post-04')
const firstThread = must(threads[0], 'post-04 threads')
const sampleComment: PostComment = firstThread.comment

function reviewOf(id: string): { review: Review; rating: 1 | 2 | 3 | 4 | 5 | null } {
  const review = must(
    allReviews.find((item) => item.id === id),
    id,
  )
  const value = ratings.find((item) => item.id === review.ratingId)?.value
  return { review, rating: value ?? null }
}
const ownReview = reviewOf('review-u-maria-birch')
const otherReview = reviewOf('review-u-anna-birch')
const pendingReview: Review = { ...otherReview.review, id: 'review-pending', status: 'pending' }

const dishAvailable: MenuItem = must(featuredDishes('birch', 1)[0], 'birch featured dish')
const dishes = [
  { title: 'Обычная, с фото и ссылкой', item: dishAvailable, href: `/venue/birch/menu/${dishAvailable.id}` },
  { title: 'Без фото, вегетарианское', item: must(getMenuItem('birch-04'), 'birch-04') },
  { title: 'Веганское, постное', item: must(getMenuItem('birch-06'), 'birch-06') },
  { title: 'Временно недоступна', item: must(getMenuItem('birch-cheesecake'), 'birch-cheesecake') },
  { title: 'Удалена из меню (историческая ссылка)', item: must(getMenuItem('birch-05'), 'birch-05') },
  { title: 'Цена не указана', item: must(getMenuItem('birch-14'), 'birch-14') },
] as const
const alcoholItem: MenuItem = { ...dishAvailable, id: 'alcohol-demo', name: 'Алкогольная позиция', isAlcohol: true }

const anna = author('u-anna')
const privateAuthor = author('u-nikita')
const mariaPost = must(getPost('post-04'), 'post-04')

const SECTIONS = 11
const { shown } = useProgressiveMount(SECTIONS, 3)

const viewerLabel = computed(() => (isSignedIn.value ? `Вы вошли как ${MOCK_USER.email.split('@')[0]} (Мария)` : 'Вы гость'))
</script>

<template>
  <div class="page">
    <main id="top">
      <div class="features-hero">
        <ShowcaseContainer>
          <UiText variant="overline">Служебная страница · без ссылок из продукта</UiText>
          <h1 class="features-hero__title">Общие блоки продукта</h1>
          <p class="features-hero__lead">
            Составные блоки из <code>src/features/</code>: собраны из компонентов дизайн-системы и моковых данных, их берут страницы 0006–0014. Все состояния: заведение
            закрыто или приостановлено, событие отменено или перенесено, позиция недоступна. Тема переключается в шапке.
          </p>
        </ShowcaseContainer>
      </div>

      <ShowcaseSection id="session" title="Проверка действий" lead="Гость: действия ведут на /auth и сохраняют отложенное действие. Мария: избранное, лайк, подписка и сохранение переключаются сразу, состояние переживает перезагрузку.">
        <UiStack :gap="4">
          <UiBanner :variant="isSignedIn ? 'success' : 'info'" :title="viewerLabel">
            Кнопка «Войти» здесь — тестовый вход без почты и кода (настоящий экран входа — страница /auth).
          </UiBanner>
          <UiCluster :gap="3" wrap>
            <UiButton v-if="!isSignedIn" @click="signIn()">Войти как Мария</UiButton>
            <UiButton v-else variant="outline" @click="signOut()">Выйти</UiButton>
            <UiButton variant="ghost" @click="resetMock()">Сбросить мок</UiButton>
          </UiCluster>
          <div>
            <UiText variant="caption">Премиум Марии (для «Предложения ИИ»):</UiText>
            <UiCluster :gap="2" wrap class="features-phases">
              <UiButton v-for="phase in PHASES" :key="phase.id" size="sm" :variant="premium.phase.value === phase.id ? 'primary' : 'outline'" :aria-pressed="premium.phase.value === phase.id" @click="premium.setMockPhase(phase.id)">
                {{ phase.label }}
              </UiButton>
            </UiCluster>
          </div>
        </UiStack>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 1" id="rails" title="Заголовки и ряды" lead="Ряд листается пальцем (scroll-snap); у мыши появляются стрелки, с клавиатуры листают стрелки влево и вправо, Home и End.">
        <ShowcaseSubheading first>SectionHeader</ShowcaseSubheading>
        <UiStack :gap="6">
          <SectionHeader title="Куда сходить" href="/search" />
          <SectionHeader title="Афиша" description="События, на которые стоит обратить внимание" count="24 события" href="/events" :heading-level="3" />
          <SectionHeader title="Подборки" size="lg" />
        </UiStack>

        <ShowcaseSubheading>HorizontalRail с VenueCard</ShowcaseSubheading>
        <SectionHeader title="Рядом с вами" href="/search" :heading-level="3" />
        <HorizontalRail label="Рядом с вами" :item-width="248">
          <VenueCard v-for="id in railVenues" :key="id" v-bind="venueProps(id, { headingLevel: 4 })">
            <template #action><FavoriteButton :venue-id="id" :subject="venue(id).name" /></template>
          </VenueCard>
        </HorizontalRail>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 2" id="venues" title="Заведения" lead="VenueCard и VenueRow. Статусы «скоро открытие», «временно закрыто», «приостановлено», «закрыто навсегда» — метка и приглушённое фото. Агрегат оценки скрыт при малой выборке. «Выбор редакции» у заведения не берём (вопрос 3 в 0017).">
        <ShowcaseSubheading first>VenueCard, все состояния</ShowcaseSubheading>
        <UiGrid :min="248" :gap="4">
          <UiStack v-for="state in venueStates" :key="state.title" :gap="2">
            <UiText variant="caption">{{ state.title }}</UiText>
            <VenueCard v-bind="state.props" :heading-level="4">
              <template #action><FavoriteButton :venue-id="state.props.venue.id" :subject="state.props.venue.name" /></template>
            </VenueCard>
          </UiStack>
        </UiGrid>

        <ShowcaseSubheading>VenueRow</ShowcaseSubheading>
        <UiGrid :min="340" :gap="3">
          <VenueRow v-for="id in rowVenues" :key="id" v-bind="venueProps(id, { headingLevel: 4, hasEventToday: id === 'harvest' })">
            <template #action><FavoriteButton :venue-id="id" :subject="venue(id).name" variant="plain" /></template>
          </VenueRow>
        </UiGrid>

        <ShowcaseSubheading>Мелкие блоки</ShowcaseSubheading>
        <UiCluster :gap="4" wrap align="center">
          <RatingLabel :rating="venue('birch').rating" />
          <RatingLabel :rating="venue('remeslo').rating" />
          <RatingLabel :rating="null" />
          <PriceLabel kind="check" :amount-rub="3000" />
          <PriceLabel kind="check" :amount-rub="null" />
          <OpenNowLabel v-bind="openOf('birch')" />
          <OpenNowLabel state="closed" label="Откроется в 18:00" />
          <OpenNowLabel state="unknown" label="Часы работы не указаны" />
          <StatusBadge venue-status="published" />
          <StatusBadge venue-status="opening_soon" />
          <StatusBadge venue-status="temporarily_closed" />
          <StatusBadge venue-status="suspended" />
          <StatusBadge venue-status="closed_permanently" />
        </UiCluster>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 3" id="events" title="События" lead="EventCard и EventRow: пять статусов и шесть видов стоимости. Без «Осталось мало мест» и «Добавить в календарь» — в ТЗ их нет.">
        <ShowcaseSubheading first>EventCard, все состояния</ShowcaseSubheading>
        <UiGrid :min="248" :gap="4">
          <UiStack v-for="state in eventStates" :key="state.id" :gap="2">
            <UiText variant="caption">{{ state.title }}</UiText>
            <EventCard v-bind="eventProps(state.id)" :heading-level="4">
              <template #action><SaveButton kind="event" :id="state.id" :subject="event(state.id).title" variant="overlay" /></template>
            </EventCard>
          </UiStack>
        </UiGrid>

        <ShowcaseSubheading>EventRow</ShowcaseSubheading>
        <UiGrid :min="340" :gap="3">
          <EventRow v-for="state in eventStates.slice(0, 5)" :key="state.id" v-bind="eventProps(state.id)" :heading-level="4">
            <template #action><SaveButton kind="event" :id="state.id" :subject="event(state.id).title" variant="plain" /></template>
          </EventRow>
        </UiGrid>

        <ShowcaseSubheading>StatusBadge и PriceLabel (события)</ShowcaseSubheading>
        <UiCluster :gap="3" wrap align="center">
          <StatusBadge event-status="scheduled" />
          <StatusBadge event-status="sold_out" />
          <StatusBadge event-status="rescheduled" />
          <StatusBadge event-status="cancelled" />
          <StatusBadge event-status="completed" />
        </UiCluster>
        <UiGrid :min="180" :gap="3" class="features-prices">
          <UiStack v-for="item in EVENT_PRICES" :key="item.title" :gap="1">
            <UiText variant="caption">{{ item.title }}</UiText>
            <PriceLabel kind="event" :event="item.price" />
          </UiStack>
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 4" id="collections" title="Подборки" lead="CollectionCard: плитка и строка; редакционная подписана «Редакция «Местами вкусно»», приватная и черновик помечены.">
        <ShowcaseSubheading first>Плитка (tile)</ShowcaseSubheading>
        <UiGrid :min="260" :gap="4">
          <CollectionCard v-for="id in collectionTiles" :key="id" v-bind="collectionProps(id)" :heading-level="4">
            <template #action><SaveButton kind="collection" :id="id" variant="overlay" /></template>
          </CollectionCard>
        </UiGrid>
        <ShowcaseSubheading>Строка (row)</ShowcaseSubheading>
        <UiGrid :min="340" :gap="3">
          <CollectionCard v-for="id in collectionTiles" :key="id" v-bind="collectionProps(id)" layout="row" :heading-level="4" />
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 5" id="posts" title="Публикации" lead="PostCard: пользовательская, официальный контент заведения (подпись «Заведение», скруглённый аватар, рамка --lime-line) и подборка.">
        <UiGrid :min="340" :gap="4" align="start">
          <UiStack v-for="state in postStates" :key="state.title" :gap="2">
            <UiText variant="caption">{{ state.title }}</UiText>
            <PostCard :data="state.data" :heading-level="4" />
          </UiStack>
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 6" id="feedback" title="Комментарии и отзывы" lead="CommentItem: один уровень ответов, состояния отправки. ReviewCard: чужой, свой (правка и удаление), на проверке.">
        <ShowcaseSubheading first>CommentItem</ShowcaseSubheading>
        <UiStack :gap="4" class="features-narrow">
          <CommentItem
            v-for="thread in threads"
            :key="thread.comment.id"
            :comment="thread.comment"
            :author="author(thread.comment.authorId)"
            :own="thread.comment.authorId === 'u-maria'"
          >
            <template v-if="thread.replies.length > 0" #replies>
              <CommentItem v-for="reply in thread.replies" :key="reply.id" :comment="reply" :author="author(reply.authorId)" :own="reply.authorId === 'u-maria'" reply :can-reply="false" />
            </template>
          </CommentItem>
          <CommentItem :comment="sampleComment" :author="author('u-maria')" own send-state="sending" />
          <CommentItem :comment="sampleComment" :author="author('u-maria')" own send-state="failed" />
        </UiStack>

        <ShowcaseSubheading>ReviewCard</ShowcaseSubheading>
        <UiGrid :min="340" :gap="4" align="start">
          <ReviewCard :review="ownReview.review" :rating="ownReview.rating" :author="author('u-maria')" :venue="{ id: 'birch', name: 'Birch', subtitle: 'Европейская · Петроградский район' }" own :heading-level="4" />
          <ReviewCard :review="otherReview.review" :rating="otherReview.rating" :author="anna" :heading-level="4" />
          <ReviewCard :review="pendingReview" :rating="otherReview.rating" :author="anna" :heading-level="4" />
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 7" id="people" title="Люди и меню" lead="AuthorRow, AuthorCard, DishRow. Алкогольные позиции блок не рисует ни при каких данных (§8.4); данные берутся только селекторами меню.">
        <ShowcaseSubheading first>AuthorRow</ShowcaseSubheading>
        <UiGrid :min="300" :gap="3">
          <AuthorRow :author="anna" subtitle="12,5 тыс. подписчиков">
            <template #action><FollowButton kind="author" :id="anna.id" :name="anna.displayName" size="sm" /></template>
          </AuthorRow>
          <AuthorRow :author="author('u-dmitry')" size="lg" />
          <AuthorRow :author="author('u-elena')" size="sm" plain />
        </UiGrid>

        <ShowcaseSubheading>AuthorCard</ShowcaseSubheading>
        <UiGrid :min="300" :gap="4" align="start">
          <AuthorCard :author="anna" :heading-level="4">
            <template #action><FollowButton kind="author" :id="anna.id" :name="anna.displayName" block /></template>
          </AuthorCard>
          <AuthorCard :author="privateAuthor" :heading-level="4">
            <template #action><FollowButton kind="author" :id="privateAuthor.id" :name="privateAuthor.displayName" block /></template>
          </AuthorCard>
        </UiGrid>

        <ShowcaseSubheading>DishRow</ShowcaseSubheading>
        <UiGrid :min="360" :gap="4" align="start">
          <UiStack v-for="dish in dishes" :key="dish.title" :gap="1">
            <UiText variant="caption">{{ dish.title }}</UiText>
            <DishRow :item="dish.item" :href="'href' in dish ? dish.href : undefined" :heading-level="4" />
          </UiStack>
          <UiStack :gap="1">
            <UiText variant="caption">Позиция с isAlcohol: блок не рисует ничего (пустая рамка ниже)</UiText>
            <div class="features-void"><DishRow :item="alcoholItem" :heading-level="4" /></div>
          </UiStack>
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 8" id="actions" title="Кнопки действий" lead="Гость → /auth с отложенным действием. Вошедший → переключение сразу и тост от библиотеки. Состояние — aria-pressed.">
        <UiGrid :min="280" :gap="6" align="start">
          <UiStack :gap="3">
            <UiText variant="caption">FavoriteButton: overlay · plain · button</UiText>
            <UiCluster :gap="3" align="center">
              <FavoriteButton venue-id="birch" subject="Birch" />
              <FavoriteButton venue-id="harvest" subject="Harvest" variant="plain" />
              <FavoriteButton venue-id="sintoho" subject="Sintoho" variant="button" />
            </UiCluster>
          </UiStack>
          <UiStack :gap="3">
            <UiText variant="caption">FollowButton: автор · заведение</UiText>
            <UiCluster :gap="3" align="center">
              <FollowButton kind="author" :id="anna.id" :name="anna.displayName" />
              <FollowButton kind="venue" id="birch" name="Birch" size="sm" />
            </UiCluster>
          </UiStack>
          <UiStack :gap="3">
            <UiText variant="caption">LikeButton · SaveButton · ShareButton · ActionButton</UiText>
            <UiCluster :gap="1" align="center">
              <LikeButton :post-id="mariaPost.id" :base-count="mariaPost.likesCount" />
              <ActionButton icon="comment" label="Комментарии" :count="commentsCount(mariaPost.id)" href="/post/post-04#comments" />
              <SaveButton kind="post" :id="mariaPost.id" subject="публикацию" />
              <ShareButton :target="{ kind: 'post', id: mariaPost.id, title: 'Публикация Марии', href: '/post/post-04' }" />
            </UiCluster>
          </UiStack>
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 9" id="ai" title="Предложение ИИ" lead="AiTeaser: гость, бесплатная версия и просроченный Премиум видят предложение (кнопка ведёт в /premium и запоминает premium_intent), без поля с замком и без текста сводки. Активный Премиум — поле запроса, ведущее на /ai. Переключатель фазы — в «Проверке действий».">
        <UiBanner variant="info" title="Сейчас фаза Премиум:">
          {{ premium.canUseAi.value ? 'ИИ доступен: показано поле запроса' : 'ИИ недоступен: показано контекстное предложение' }} ({{ premium.phase.value }}).
        </UiBanner>
        <UiGrid :min="360" :gap="4" class="features-ai" align="start">
          <AiTeaser context="general" source-surface="home" :heading-level="3" />
          <AiTeaser context="venue" source-surface="venue" :heading-level="3" />
          <AiTeaser context="compare" source-surface="search" :heading-level="3" />
          <AiTeaser context="event" source-surface="events" :heading-level="3" />
          <AiTeaser context="search_empty" source-surface="search" :heading-level="3" />
        </UiGrid>
      </ShowcaseSection>

      <ShowcaseSection v-if="shown > 10" id="states" title="Загрузка и пусто" lead="CardSkeleton повторяет форму блока, чтобы страница не прыгала. Пусто и ошибка разводятся: «Пока ничего нет» не то же, что «Не удалось загрузить».">
        <UiGrid :min="260" :gap="6" align="start">
          <UiStack v-for="kind in ['venue', 'event', 'collection'] as const" :key="kind" :gap="2">
            <UiText variant="caption">{{ kind }}</UiText>
            <CardSkeleton :kind="kind" />
          </UiStack>
          <UiStack v-for="kind in ['venue-row', 'event-row', 'post', 'author', 'comment', 'dish'] as const" :key="kind" :gap="2">
            <UiText variant="caption">{{ kind }}</UiText>
            <CardSkeleton :kind="kind" :count="2" />
          </UiStack>
        </UiGrid>
        <ShowcaseSubheading>Пусто и ошибка</ShowcaseSubheading>
        <UiGrid :min="300" :gap="4" align="start">
          <UiEmptyState title="Подписок пока нет" description="Подпишитесь на авторов и заведения, чтобы видеть их публикации здесь." :heading-level="3">
            <template #actions><UiButton href="/">Найти авторов</UiButton></template>
          </UiEmptyState>
          <UiEmptyState mode="error" title="Не удалось загрузить меню" description="Проверьте соединение и попробуйте ещё раз." :heading-level="3">
            <template #actions><UiButton variant="outline">Повторить</UiButton></template>
          </UiEmptyState>
        </UiGrid>
      </ShowcaseSection>
    </main>
    <UiToast />
  </div>
</template>

<style scoped>
.features-hero {
  padding: var(--s-12) 0 var(--s-8);
  border-bottom: 1px solid var(--border);
}

.features-hero__title {
  margin: var(--s-3) 0;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.features-hero__lead {
  max-width: 720px;
  margin: 0;
  color: var(--text-2);
  font-size: 17px;
}

.features-phases {
  margin-top: var(--s-2);
}

.features-prices {
  margin-top: var(--s-4);
}

.features-narrow {
  max-width: 560px;
}

.features-void {
  min-height: 48px;
  padding: var(--s-2);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-md);
}

.features-ai {
  margin-top: var(--s-4);
}
</style>
