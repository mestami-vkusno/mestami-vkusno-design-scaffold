/**
 * Реестр юридических документов (X3, §2.8 `docs/front-structure.md`). Источник текста — `materials/legal/b2c/*.md`,
 * скопирован без изменений в `./legal-content/`: воркспейс `materials/` не входит в этот репозиторий (правило 6
 * `.ai/rules/core.md` — материалы не код), а каждый документ должен грузиться отдельным ленивым чанком, а не одним
 * общим файлом со всеми восемью текстами. Заголовки и порядок совпадают со списком в подвале (`shell/data/footer.ts`);
 * два документа туда не вынесены (маркетинговое согласие и согласие на распространение ПД показываются в форме
 * согласия при регистрации/первой публикации, не в подвале) — здесь есть оба, страница открывается по прямой ссылке.
 */

export interface LegalDocument {
  slug: string
  title: string
  load: () => Promise<string>
}

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  { slug: 'user-agreement', title: 'Пользовательское соглашение', load: () => import('./legal-content/user-agreement.md?raw').then((m) => m.default) },
  { slug: 'privacy-policy', title: 'Политика конфиденциальности', load: () => import('./legal-content/privacy-policy.md?raw').then((m) => m.default) },
  { slug: 'pd-consent', title: 'Согласие на обработку персональных данных', load: () => import('./legal-content/pd-consent.md?raw').then((m) => m.default) },
  { slug: 'marketing-consent', title: 'Согласие на рекламные сообщения', load: () => import('./legal-content/marketing-consent.md?raw').then((m) => m.default) },
  { slug: 'pd-distribution-consent', title: 'Согласие на распространение персональных данных', load: () => import('./legal-content/pd-distribution-consent.md?raw').then((m) => m.default) },
  { slug: 'premium-offer', title: 'Оферта на Премиум', load: () => import('./legal-content/premium-offer.md?raw').then((m) => m.default) },
  { slug: 'service-rules', title: 'Правила сервиса', load: () => import('./legal-content/service-rules.md?raw').then((m) => m.default) },
  { slug: 'recommendation-rules', title: 'Правила рекомендаций', load: () => import('./legal-content/recommendation-rules.md?raw').then((m) => m.default) },
]

export function findLegalDocument(slug: string | undefined): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug)
}
