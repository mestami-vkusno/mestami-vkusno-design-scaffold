<script setup lang="ts">
import { UiSheet, UiSwitch } from '@/design-system'
import { PERMISSIONS } from '../copy'
import { useAiPermissions } from '../aiState'

/* Два отдельных разрешения (§23.3): `ai_personal_library_access` и `ai_private_text_access`. Второе по умолчанию выключено. */
const open = defineModel<boolean>('open', { default: false })
const { permissions, setLibrary, setPrivateText } = useAiPermissions()
</script>

<template>
  <UiSheet v-model:open="open" :title="PERMISSIONS.title">
    <div class="ai-permissions">
      <p class="ai-permissions__lead">{{ PERMISSIONS.lead }}</p>
      <div class="ai-permissions__item">
        <UiSwitch :model-value="permissions.library" @update:model-value="setLibrary">{{ PERMISSIONS.library.label }}</UiSwitch>
        <p class="ai-permissions__text">{{ PERMISSIONS.library.text }}</p>
      </div>
      <div class="ai-permissions__item">
        <UiSwitch :model-value="permissions.privateText" @update:model-value="setPrivateText">{{ PERMISSIONS.privateText.label }}</UiSwitch>
        <p class="ai-permissions__text">{{ PERMISSIONS.privateText.text }}</p>
      </div>
    </div>
  </UiSheet>
</template>

<style scoped>
.ai-permissions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-5);
}

.ai-permissions__lead {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}

.ai-permissions__item {
  display: grid;
  gap: var(--s-1);
  font-size: 15px;
  color: var(--text);
}

.ai-permissions__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-3);
}
</style>
