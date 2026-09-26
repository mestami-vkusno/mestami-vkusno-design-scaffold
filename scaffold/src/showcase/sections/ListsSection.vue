<script setup lang="ts">
import { ref } from 'vue'
import { UiAvatar, UiBadge, UiCluster, UiGrid, UiIconButton, UiListRow, UiMediaCard, UiRating, UiScreenBar, UiStack, UiSurface, UiText } from '@/design-system'
import { AVATAR_SIZES, AVATAR_TONES, CITY_ROWS } from '../data/lists'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import ShowcaseStage from '../components/ShowcaseStage.vue'
import ShowcaseSubheading from '../components/ShowcaseSubheading.vue'

const city = ref('spb')
const notifications = ref(true)
const drafts = ref(false)
const clicks = ref(0)
</script>

<template>
  <ShowcaseSection
    id="lists"
    title="Списки, профили и шапка экрана"
    lead="Строка списка нажимается целиком (не ниже 44 px): ссылка, кнопка или переключатель. Аватар — круг для людей и скруглённый квадрат для логотипа заведения."
  >
    <ShowcaseSubheading first>Аватары</ShowcaseSubheading>
    <ShowcaseStage>
      <UiStack :gap="4">
        <UiCluster align="end">
          <UiAvatar v-for="item in AVATAR_SIZES" :key="item.size" name="Анна Ветрова" :size="item.size" tone="accent" />
        </UiCluster>
        <UiCluster align="end">
          <UiAvatar v-for="item in AVATAR_SIZES" :key="item.size" name="Birch" :size="item.size" shape="rounded" />
        </UiCluster>
        <UiCluster>
          <UiAvatar v-for="item in AVATAR_TONES" :key="item.tone" :name="item.name" :tone="item.tone" />
          <UiAvatar name="Анна Ветрова" src="/no-such-photo.jpg" />
          <UiAvatar />
        </UiCluster>
        <UiText variant="caption">Размеры 24, 32, 40, 64, 96 px · круг и скруглённый квадрат · тона заглушки · снимок не загрузился (инициалы) · без имени</UiText>
      </UiStack>
    </ShowcaseStage>

    <ShowcaseSubheading>Строки списка</ShowcaseSubheading>
    <UiGrid :min="300" align="start">
      <UiSurface variant="panel">
        <UiStack :gap="1">
          <UiListRow title="Избранное" icon="heart" value="12" href="#lists" />
          <UiListRow title="Дневник" description="Личные записи, видны только вам" icon="edit" href="#lists" />
          <UiListRow title="Черновики" icon="list" clickable @click="clicks += 1">
            <template #trailing><UiBadge variant="warning">На проверке</UiBadge></template>
          </UiListRow>
          <UiListRow title="Центр активности" icon="bell" href="#lists">
            <template #trailing><UiBadge dot label="Есть непрочитанные" variant="danger" /></template>
          </UiListRow>
          <UiListRow title="Автор" description="Открыть профиль" href="#lists">
            <template #leading><UiAvatar name="Иван Соколов" tone="accent" decorative /></template>
          </UiListRow>
          <UiListRow title="Заблокировать" icon="flag" danger clickable />
          <UiListRow title="Недоступно" icon="lock" disabled />
          <UiText variant="caption">Нажатий на кнопку-строку: {{ clicks }}</UiText>
        </UiStack>
      </UiSurface>
      <UiSurface variant="panel">
        <UiStack :gap="1">
          <UiListRow v-model:toggle="notifications" title="Уведомления" description="Ответы, подписчики, события" icon="bell" />
          <UiListRow v-model:toggle="drafts" title="Скрывать черновики" divider />
          <UiListRow v-for="item in CITY_ROWS" :key="item.id" :title="item.title" :selected="city === item.id" clickable @click="city = item.id" />
        </UiStack>
      </UiSurface>
      <UiSurface variant="panel">
        <UiStack :gap="1">
          <UiText variant="caption">Состояния: наведение, нажатие, фокус</UiText>
          <UiListRow title="Наведение" icon="eye" href="#lists" preview-state="hover" />
          <UiListRow title="Нажатие" icon="eye" href="#lists" preview-state="pressed" />
          <UiListRow title="Фокус" icon="eye" href="#lists" preview-state="focus" />
        </UiStack>
      </UiSurface>
    </UiGrid>

    <ShowcaseSubheading>Шапка экрана второго уровня</ShowcaseSubheading>
    <UiGrid :min="300" align="start">
      <ShowcaseStage flush>
        <UiScreenBar title="@ivan_sokolov" :heading-level="3" :sticky="false" back-href="#lists">
          <template #actions>
            <UiIconButton icon="share" variant="plain" label="Поделиться" />
            <UiIconButton icon="more" variant="plain" label="Ещё" />
          </template>
        </UiScreenBar>
      </ShowcaseStage>
      <ShowcaseStage flush>
        <UiScreenBar title="Заголовок экрана, который не помещается в одну строку и переносится" :heading-level="3" :sticky="false" back-href="#lists" />
      </ShowcaseStage>
      <ShowcaseStage flush>
        <UiScreenBar title="Без кнопки «Назад»" :heading-level="3" :sticky="false" hide-back>
          <template #actions><UiIconButton icon="comment" variant="plain" label="Комментарии" /></template>
        </UiScreenBar>
      </ShowcaseStage>
    </UiGrid>

    <ShowcaseSubheading>Карточка в строку</ShowcaseSubheading>
    <UiGrid :min="300">
      <UiMediaCard layout="row" title="Заведение из подборки" subtitle="Категория · Район">
        <UiRating :value="4.7" :count="1287" />
      </UiMediaCard>
      <UiMediaCard layout="row" tone="dusk" show-favorite title="Длинное название заведения, которое переносится на две строки и обрезается" subtitle="Категория · Район">
        <template #badges><UiBadge variant="new">Новое</UiBadge></template>
        <UiBadge pill>Метка</UiBadge>
      </UiMediaCard>
    </UiGrid>
  </ShowcaseSection>
</template>
