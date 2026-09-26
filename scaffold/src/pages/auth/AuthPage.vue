<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { UiSurface } from '@/design-system'
import ShellContainer from '@/shell/components/ShellContainer.vue'
import { useViewer } from '@/shell/composables/useViewer'
import AuthLegalFooter from './components/AuthLegalFooter.vue'
import AuthTopBar from './components/AuthTopBar.vue'
import CodeStep from './components/CodeStep.vue'
import DoneStep from './components/DoneStep.vue'
import EmailStep from './components/EmailStep.vue'
import ProfileStep from './components/ProfileStep.vue'
import { useAuthFlow } from './useAuthFlow'

/*
  A1–A4 (ТЗ §5.1–5.8): вход по коду на email без пароля, настройка профиля для нового аккаунта, завершение
  отложенного действия и возврат на `return_url`. Один маршрут `/auth`, шаги переключаются внутри шторки —
  без переходов роутера. Вошедшего эта страница не пускает: сразу отправляет на `/me`.
*/

const router = useRouter()
const { isSignedIn } = useViewer()

if (isSignedIn.value) void router.replace('/me')

const flow = useAuthFlow()

const topBar = computed<{ variant: 'close' | 'back'; label: string } | null>(() => {
  if (flow.step.value === 'email') return { variant: 'close', label: 'Закрыть' }
  if (flow.step.value === 'code') return { variant: 'back', label: 'Назад' }
  return null
})

function onTopBarAction(): void {
  if (flow.step.value === 'email') flow.closeFlow()
  else flow.changeEmail()
}
</script>

<template>
  <main v-if="!isSignedIn" class="auth-page">
    <ShellContainer>
      <div class="auth-page__frame">
        <AuthTopBar v-if="topBar" :variant="topBar.variant" :label="topBar.label" @action="onTopBarAction" />

        <UiSurface variant="panel" class="auth-page__card">
          <Transition name="auth-shift" mode="out-in">
            <EmailStep
              v-if="flow.step.value === 'email'"
              key="email"
              v-model:email="flow.email.value"
              v-model:age-checked="flow.ageChecked.value"
              v-model:terms-checked="flow.termsChecked.value"
              v-model:pd-checked="flow.pdChecked.value"
              v-model:marketing-checked="flow.marketingChecked.value"
              :email-error="flow.emailError.value"
              :sending="flow.sending.value"
              :can-submit="flow.canSubmitEmail.value"
              :send-blocked-remaining-ms="flow.sendBlockedRemainingMs.value"
              :pending-action="flow.pendingAction.value"
              @submit="flow.sendCode"
            />
            <CodeStep
              v-else-if="flow.step.value === 'code'"
              key="code"
              :email="flow.email.value"
              v-model:code="flow.code.value"
              :code-error="flow.codeError.value"
              :code-checking="flow.codeChecking.value"
              :resend-remaining-ms="flow.resendRemainingMs.value"
              :code-blocked-remaining-ms="flow.codeBlockedRemainingMs.value"
              :send-blocked-remaining-ms="flow.sendBlockedRemainingMs.value"
              @complete="flow.submitCode"
              @resend="flow.resendCode"
              @change-email="flow.changeEmail"
            />
            <ProfileStep
              v-else-if="flow.step.value === 'profile'"
              key="profile"
              v-model:display-name="flow.displayName.value"
              v-model:username="flow.username.value"
              v-model:about="flow.about.value"
              v-model:visibility="flow.visibility.value"
              :username-status="flow.usernameStatus.value"
              :can-submit="flow.canSubmitProfile.value"
              @check-username="flow.checkUsername"
              @submit="flow.submitProfile"
            />
            <DoneStep v-else key="done" :action="flow.doneAction.value" :ok="flow.doneOk.value" @finish="flow.finish" />
          </Transition>
        </UiSurface>

        <AuthLegalFooter />
      </div>
    </ShellContainer>
  </main>
</template>

<style scoped>
.auth-page {
  padding-block: var(--s-6) var(--s-16);
  min-height: calc(100dvh - 56px);
}

.auth-page__frame {
  max-width: 440px;
  margin: 0 auto;
}

.auth-page__card {
  margin-top: var(--s-4);
  padding: var(--s-6);
}

/* Шаги внутри потока сдвигаются, как углубление в оболочке (README «Анимации»): --ease-drawer, --dur-drawer. */
.auth-shift-enter-active,
.auth-shift-leave-active {
  transition:
    opacity var(--dur-drawer) var(--ease-drawer),
    transform var(--dur-drawer) var(--ease-drawer);
}

.auth-shift-enter-from {
  opacity: 0;
  transform: translateX(calc(24px * var(--motion-distance)));
}

.auth-shift-leave-to {
  opacity: 0;
  transform: translateX(calc(-24px * var(--motion-distance)));
}
</style>
