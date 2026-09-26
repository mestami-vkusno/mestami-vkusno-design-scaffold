<script setup lang="ts">
import { ref, watch } from 'vue'
import { UiBanner, UiButton, UiCheckbox, UiLink, UiSheet, UiText } from '@/design-system'

/*
  Запрос на удаление аккаунта (§5.7, O12): что удалится, необязательный льготный период (его срок ТЗ не задаёт, вопрос 12), проверка активного
  Премиум (порядок и последствия ТЗ не описывает: показываем предупреждение и ссылку на условия отмены автопродления). Это НЕ юридический
  запрос субъекта ПД (§20А): обратная отсылка ведёт к нему. Текст без манипуляций (§25).
*/

defineProps<{ premiumActive: boolean }>()
const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { required: true })

const understood = ref(false)
watch(open, (value) => void (value && (understood.value = false)), { immediate: true })

function confirm(): void {
  if (!understood.value) return
  open.value = false
  emit('confirm')
}
</script>

<template>
  <UiSheet v-model:open="open" title="Удалить аккаунт?">
    <div class="delete-account">
      <UiText variant="body">
        Профиль, публикации, подборки, отзывы, Избранное, Посещения и Дневник будут удалены. Возможно, до окончательного удаления будет льготный период, в течение которого запрос можно отменить.
      </UiText>
      <UiBanner v-if="premiumActive" variant="warning">
        У вас активна подписка. Проверьте условия отмены автопродления.
        <template #action><UiButton size="sm" variant="outline" href="/premium" @click="open = false">Открыть Премиум</UiButton></template>
      </UiBanner>
      <UiText variant="caption" class="delete-account__note">
        Это не запрос по персональным данным. Получить сведения, исправить данные или отозвать согласие можно в разделе «Персональные данные» <UiLink href="#data" @click="open = false">в настройках</UiLink>.
      </UiText>
      <UiCheckbox v-model="understood">Я понимаю последствия</UiCheckbox>
      <div class="delete-account__actions">
        <UiButton variant="outline" block @click="open = false">Отмена</UiButton>
        <UiButton class="delete-account__danger" block :disabled="!understood" @click="confirm">Отправить запрос на удаление</UiButton>
      </div>
    </div>
  </UiSheet>
</template>

<style scoped>
.delete-account {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
}

.delete-account__note {
  color: var(--text-3);
}

.delete-account__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-2);
}

/* Разрушительное действие: в системе нет такого варианта кнопки, поэтому цвет `--danger` ставим поверх (вопрос 28). */
.delete-account__danger:not(:disabled) {
  background: var(--danger);
  border-color: var(--danger);
  color: var(--bg);
}
</style>
