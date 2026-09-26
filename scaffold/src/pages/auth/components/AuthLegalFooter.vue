<script setup lang="ts">
import { UiCluster, UiIcon, UiLink, UiText } from '@/design-system'
</script>

<template>
  <footer class="auth-legal-footer">
    <p class="auth-legal-footer__note">
      <UiIcon name="lock" :size="14" />
      Мы не передаём ваши персональные данные заведениям без вашего согласия.
    </p>
    <UiCluster :gap="3" wrap>
      <UiLink variant="muted" href="/legal/user-agreement">Пользовательское соглашение</UiLink>
      <UiLink variant="muted" href="/legal/privacy-policy">Политика конфиденциальности</UiLink>
      <UiLink variant="muted" href="/help">Поддержка</UiLink>
    </UiCluster>
    <UiText variant="caption" as="p" class="auth-legal-footer__copy">© 2026 Местами вкусно</UiText>
  </footer>
</template>

<style scoped>
.auth-legal-footer {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin-top: var(--s-8);
  padding-top: var(--s-4);
  border-top: 1px solid var(--border);
}

.auth-legal-footer__note {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: 0;
  color: var(--text-3);
  font-size: 13px;
}

.auth-legal-footer__copy {
  color: var(--text-3);
}
</style>
