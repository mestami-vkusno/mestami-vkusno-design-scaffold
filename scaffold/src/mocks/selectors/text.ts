/*
  Простое сопоставление текста для поисковых селекторов. Это макет: приближённая русская морфология
  (сравнение по основам без окончаний) и без транслитерации и исправления опечаток (§8.2 — в реальном поиске).
*/

/** Нижний регистр, «ё» → «е», без знаков препинания. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Грубая основа слова: отбрасываем 1–2 последние буквы у длинных слов («пасту», «паста» → «пас»). */
export function stem(word: string): string {
  if (word.length > 5) return word.slice(0, -2)
  if (word.length > 3) return word.slice(0, -1)
  return word
}

function tokens(text: string): readonly string[] {
  const normalized = normalize(text)
  return normalized === '' ? [] : normalized.split(' ')
}

/** Все слова запроса совпадают с началом какого-либо слова текста (по основам). Пустой запрос совпадает со всем. */
export function matchesQuery(query: string, ...haystack: readonly string[]): boolean {
  const queryTokens = tokens(query)
  if (queryTokens.length === 0) return true
  const words = haystack.flatMap(tokens).map((word) => ({ word, base: stem(word) }))
  return queryTokens.every((token) => {
    const base = stem(token)
    return words.some((entry) => entry.word.startsWith(token) ||
        entry.base.startsWith(base) ||
        (entry.base.length >= 4 && base.startsWith(entry.base)))
  })
}

/** Название полностью совпало с запросом — такой результат идёт первым (§8.2). */
export function isExactMatch(query: string, name: string): boolean {
  return normalize(query) !== '' && normalize(query) === normalize(name)
}

export function startsWithQuery(query: string, name: string): boolean {
  const q = normalize(query)
  return q !== '' && normalize(name).startsWith(q)
}
