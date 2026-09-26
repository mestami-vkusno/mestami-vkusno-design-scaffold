<script setup lang="ts">
import { UiLink } from '@/design-system'
import { useAuthGate } from '@/shell/composables/useAuthGate'
import { openReportData } from './useOverlays'

/* Ссылка «Сообщить о неточности» (O9б, §21.3) внизу карточки заведения и события. Окно подгружается при первом нажатии. */
defineProps<{ kind: 'venue' | 'event'; id: string; title: string }>()
// Роутер для гейта авторизации: гость проходит вход без перезагрузки страницы.
useAuthGate()
</script>

<template>
  <UiLink variant="muted" href="#" @click.prevent="openReportData({ kind, id, title })">Сообщить о неточности</UiLink>
</template>
