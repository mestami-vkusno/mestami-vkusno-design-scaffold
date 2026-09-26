/**
 * Крошечный парсер под конкретный поднабор Markdown, которым написаны документы `materials/legal/b2c/*.md`
 * (заголовки `#`/`##`/`###`, **жирный** текст, списки `- `, таблицы `| … |`, разделитель `---`). Не общий Markdown:
 * ссылок, курсива и вложенных списков в источниках нет (проверено `grep` при подготовке задачи 0014), поэтому
 * их парсер не поддерживает — это дешевле, чем тянуть зависимость markdown-парсера ради статичных юридических текстов.
 */

export type LegalInline = { bold: boolean; text: string }

export type LegalBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inline: LegalInline[] }
  /** Несколько строк без пустой строки между ними — рендерятся с переносом (`<br>`) между строками; в источниках
      так оформлена только шапка документа (город, редакция, статус), основной текст — один абзац на строку. */
  | { type: 'paragraph'; lines: LegalInline[][] }
  | { type: 'list'; items: LegalInline[][] }
  | { type: 'table'; header: LegalInline[][]; rows: LegalInline[][][] }
  | { type: 'hr' }

const TABLE_SEPARATOR = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/

function parseInline(text: string): LegalInline[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== '')
  return parts.map((part) =>
    part.startsWith('**') && part.endsWith('**') ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part },
  )
}

function parseTableRow(line: string): LegalInline[][] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split('|').map((cell) => parseInline(cell.trim()))
}

/** Разбирает markdown-текст документа в блоки для рендера без `v-html` (весь текст идёт через интерполяцию). */
export function parseLegalMarkdown(source: string): LegalBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: LegalBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    const trimmed = line.trim()

    if (trimmed === '') {
      index += 1
      continue
    }

    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed)
    if (heading) {
      const level = (heading[1] ?? '#').length as 1 | 2 | 3
      blocks.push({ type: 'heading', level, inline: parseInline(heading[2] ?? '') })
      index += 1
      continue
    }

    if (trimmed.startsWith('| ') || (trimmed.startsWith('|') && trimmed.endsWith('|'))) {
      const header = parseTableRow(lines[index] ?? '')
      let cursor = index + 1
      if (cursor < lines.length && TABLE_SEPARATOR.test((lines[cursor] ?? '').trim())) cursor += 1
      const rows: LegalInline[][][] = []
      while (cursor < lines.length && (lines[cursor] ?? '').trim().startsWith('|')) {
        rows.push(parseTableRow(lines[cursor] ?? ''))
        cursor += 1
      }
      blocks.push({ type: 'table', header, rows })
      index = cursor
      continue
    }

    if (trimmed.startsWith('- ')) {
      const items: LegalInline[][] = []
      let cursor = index
      while (cursor < lines.length && (lines[cursor] ?? '').trim().startsWith('- ')) {
        items.push(parseInline((lines[cursor] ?? '').trim().slice(2)))
        cursor += 1
      }
      blocks.push({ type: 'list', items })
      index = cursor
      continue
    }

    // Обычный абзац: копим строки до пустой строки или начала нового блока.
    const paragraphLines: LegalInline[][] = []
    let cursor = index
    while (cursor < lines.length) {
      const raw = lines[cursor] ?? ''
      if (raw.trim() === '') break
      const rawTrimmed = raw.trim()
      if (/^(#{1,3})\s/.test(rawTrimmed) || rawTrimmed === '---' || rawTrimmed === '***' || rawTrimmed.startsWith('- ') || rawTrimmed.startsWith('|')) break
      paragraphLines.push(parseInline(rawTrimmed))
      cursor += 1
    }
    blocks.push({ type: 'paragraph', lines: paragraphLines })
    index = cursor
  }

  return blocks
}
