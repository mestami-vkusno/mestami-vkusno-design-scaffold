/*
  Ленивые обёртки блоков с состоянием: страница подключает их, не загружая `useLibrary` и данные моков заранее.
  Чанк с блоком приходит после первого кадра; кнопки на фото (`position: absolute`) при этом не двигают вёрстку.
  Для блока, без которого страница пуста (`PostCard` в ленте), берите `@/features/actions`: у него своя ожидаемая высота.
*/
import { defineAsyncComponent } from 'vue'

export const FavoriteButtonAsync = defineAsyncComponent(() => import('./FavoriteButton/FavoriteButton.vue'))
export const FollowButtonAsync = defineAsyncComponent(() => import('./FollowButton/FollowButton.vue'))
export const LikeButtonAsync = defineAsyncComponent(() => import('./LikeButton/LikeButton.vue'))
export const SaveButtonAsync = defineAsyncComponent(() => import('./SaveButton/SaveButton.vue'))
export const AiTeaserAsync = defineAsyncComponent(() => import('./AiTeaser/AiTeaser.vue'))
