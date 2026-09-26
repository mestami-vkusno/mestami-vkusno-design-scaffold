/*
  Блоки с состоянием: тянут `@/state/useLibrary` и `@/state/usePremium`, а значит и данные моков.
  Не входят в `./index`, чтобы общий импорт не раздувал чанк страницы, которой они не нужны.
  Страница берёт их отсюда напрямую (`import { FavoriteButton } from '@/features/actions'`) или лениво через `./lazy`.
*/
export { default as FavoriteButton } from './FavoriteButton/FavoriteButton.vue'
export { default as FollowButton } from './FollowButton/FollowButton.vue'
export { default as LikeButton } from './LikeButton/LikeButton.vue'
export { default as SaveButton } from './SaveButton/SaveButton.vue'
export { default as PostCard } from './PostCard/PostCard.vue'
export { default as AiTeaser } from './AiTeaser/AiTeaser.vue'

export type { FavoriteButtonProps } from './FavoriteButton/types'
export type { FollowButtonProps } from './FollowButton/types'
export type { LikeButtonProps } from './LikeButton/types'
export type { SaveButtonProps } from './SaveButton/types'
export type { AiTeaserContext, AiTeaserProps } from './AiTeaser/types'
export type {
  CollectionPostCardData,
  PostCardData,
  PostCardProps,
  PostDishRef,
  PostEventRef,
  PostVenueRef,
  UserPostCardData,
  VenuePostCardData,
} from './PostCard/types'
