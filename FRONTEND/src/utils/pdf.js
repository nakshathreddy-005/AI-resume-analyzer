const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 54
const FONT_SIZE = 10.5
const LINE_HEIGHT = 14
const MAX_CHARS_PER_LINE = 92

const toPdfSafeText = (value) =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      if (char === '\n' || (code >= 32 && code <= 126)) return char
      return ' '
    })
    .join('')

const escapePdfText = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const wrapParagraph = (paragraph) => {
  if (!paragraph.trim()) return ['']

  const words = paragraph.trim().split(/\s+/)
  const lines = []
  let line = ''

  words.forEach((word) => {
    if (!line) {
      line = word
      return
    }

    if (`${line} ${word}`.length <= MAX_CHARS_PER_LINE) {
      line = `${line} ${word}`
    } else {
      lines.push(line)
      line = word
    }
  })

  if (line) lines.push(line)
  return lines
}

const paginateLines = (text) => {
  const linesPerPage = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT)
  const lines = text
    .split('\n')
    .flatMap((paragraph) => wrapParagraph(paragraph))

  const pages = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage))
  }

  return pages.length ? pages : [['']]
}

const createContentStream = (lines) => {
  const content = [
    'BT',
    `/F1 ${FONT_SIZE} Tf`,
    `${LINE_HEIGHT} TL`,
    `1 0 0 1 ${MARGIN} ${PAGE_HEIGHT - MARGIN} Tm`,
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    'ET',
  ].join('\n')

  return `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
}

export const createTextPdfBlob = (text) => {
  const safeText = toPdfSafeText(text)
  const pages = paginateLines(safeText)
  const objects = []
  const fontId = 3 + pages.length * 2

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pages
    .map((_, index) => `${3 + index * 2} 0 R`)
    .join(' ')}] /Count ${pages.length} >>`

  pages.forEach((pageLines, index) => {
    const pageId = 3 + index * 2
    const contentId = pageId + 1

    objects[pageId] = [
      '<< /Type /Page',
      '/Parent 2 0 R',
      `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`,
      `/Resources << /Font << /F1 ${fontId} 0 R >> >>`,
      `/Contents ${contentId} 0 R`,
      '>>',
    ].join(' ')

    objects[contentId] = createContentStream(pageLines)
  })

  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  let body = '%PDF-1.4\n'
  const offsets = [0]

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = body.length
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }

  const xrefStart = body.length
  body += `xref\n0 ${objects.length}\n`
  body += '0000000000 65535 f \n'

  for (let id = 1; id < objects.length; id += 1) {
    body += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }

  body += [
    'trailer',
    `<< /Size ${objects.length} /Root 1 0 R >>`,
    'startxref',
    String(xrefStart),
    '%%EOF',
  ].join('\n')

  return new Blob([body], { type: 'application/pdf' })
}
