<script setup lang="ts">
import PostMenuSheet from './PostMenuSheet.vue'
import ProfileEditSheet from './ProfileEditSheet.vue'
import ReportSheet from './ReportSheet.vue'
import ShareSheet from './ShareSheet.vue'
import { useOverlays } from './useOverlays'

/*
  Хозяин оверлеев без своего маршрута: «Поделиться» (O7), жалобы (O9а, O9б), меню публикации (O10), правка профиля.
  Подгружается лениво при первом открытии любого из них (`App.vue`) и дальше остаётся смонтированным: окна открываются и закрываются флагами.
*/
const { state } = useOverlays()
</script>

<template>
  <ShareSheet v-if="state.share.target" v-model:open="state.share.open" :target="state.share.target" />
  <ReportSheet v-if="state.reportContent.target" v-model:open="state.reportContent.open" flow="content" :target="state.reportContent.target" />
  <ReportSheet
    v-if="state.reportData.subject"
    v-model:open="state.reportData.open"
    flow="data"
    :target="{ kind: state.reportData.subject.kind, id: state.reportData.subject.id, title: state.reportData.subject.title }"
  />
  <PostMenuSheet v-if="state.postMenu.request" v-model:open="state.postMenu.open" :request="state.postMenu.request" />
  <ProfileEditSheet v-model:open="state.profileEdit.open" />
</template>
