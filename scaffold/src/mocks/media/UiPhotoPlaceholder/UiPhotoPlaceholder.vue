<script setup lang="ts">
import { computed } from 'vue'
import type { UiPhotoPlaceholderProps } from './types'

const props = withDefaults(defineProps<UiPhotoPlaceholderProps>(), { ratio: undefined, showCaption: false, decorative: false })

const effectiveRatio = computed(() => props.ratio ?? props.photo.ratio)
const style = computed(() => (effectiveRatio.value === 'fill' ? undefined : { aspectRatio: effectiveRatio.value.replace(':', ' / ') }))
// Без подписи снимок нечем описать, поэтому для чтения с экрана он декоративен.
const hidden = computed(() => props.decorative || props.photo.caption === undefined)

defineSlots<{
  /** Метки поверх снимка (бейджи, кнопка избранного). */
  default?(): unknown
}>()
</script>

<template>
  <div
    class="photo-placeholder"
    :class="[`photo-placeholder--${photo.tone}`, { 'photo-placeholder--fill': effectiveRatio === 'fill' }]"
    :style="style"
    :role="hidden ? undefined : 'img'"
    :aria-label="hidden ? undefined : photo.caption"
    :aria-hidden="hidden ? 'true' : undefined"
  >
    <span v-if="showCaption && photo.caption" class="photo-placeholder__caption">{{ photo.caption }}</span>
    <slot />
  </div>
</template>

<style scoped>
/*
  Заглушка вместо фотографии: два цветовых пятна и наклонный градиент из токенов дизайн-системы.
  База — `--surface`, поэтому в светлой теме получаются светлые пастельные тона, в тёмной — глубокие.
  Без анимации, без размытия и теней: заглушек на экране десятки.
*/
.photo-placeholder {
  --tint-a: var(--warning);
  --tint-b: var(--lime);
  --pos-a: 20% 15%;
  --pos-b: 85% 90%;
  --angle: 160deg;
  position: relative;
  overflow: hidden;
  width: 100%;
  background:
    radial-gradient(120% 90% at var(--pos-a), color-mix(in srgb, var(--tint-a) 34%, transparent), transparent 58%),
    radial-gradient(90% 90% at var(--pos-b), color-mix(in srgb, var(--tint-b) 16%, transparent), transparent 62%),
    linear-gradient(var(--angle), color-mix(in srgb, var(--tint-a) 12%, var(--surface-2)), var(--surface));
}

.photo-placeholder--fill {
  height: 100%;
}

.photo-placeholder--ember {
  --tint-a: var(--warning);
  --tint-b: var(--lime);
}

.photo-placeholder--rust {
  --tint-a: var(--danger);
  --tint-b: var(--warning);
  --pos-a: 30% 80%;
  --pos-b: 80% 20%;
  --angle: 175deg;
}

.photo-placeholder--wine {
  --tint-a: var(--danger);
  --tint-b: var(--text-3);
  --pos-a: 75% 25%;
  --pos-b: 15% 85%;
  --angle: 200deg;
}

.photo-placeholder--gold {
  --tint-a: var(--star);
  --tint-b: var(--warning);
  --pos-a: 50% 10%;
  --pos-b: 90% 80%;
  --angle: 150deg;
}

.photo-placeholder--moss {
  --tint-a: var(--success);
  --tint-b: var(--lime);
  --pos-a: 25% 25%;
  --pos-b: 80% 85%;
  --angle: 165deg;
}

.photo-placeholder--sea {
  --tint-a: var(--success);
  --tint-b: var(--text-3);
  --pos-a: 70% 70%;
  --pos-b: 20% 20%;
  --angle: 190deg;
}

.photo-placeholder--dusk {
  --tint-a: var(--text-3);
  --tint-b: var(--lime);
  --pos-a: 70% 20%;
  --pos-b: 25% 90%;
  --angle: 205deg;
}

.photo-placeholder--slate {
  --tint-a: var(--text-3);
  --tint-b: var(--border-strong);
  --pos-a: 40% 40%;
  --pos-b: 90% 90%;
  --angle: 180deg;
}

.photo-placeholder__caption {
  position: absolute;
  left: var(--s-3);
  right: var(--s-3);
  bottom: var(--s-2);
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
