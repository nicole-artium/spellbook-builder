export type TextSegment = {
  text: string
  bold: boolean
  boldItalic: boolean
}

const BOLD_ITALIC_LABELS = [
  'Using a Higher-Level Spell Slot.',
  'Cantrip Upgrade.',
]

export function parseTextSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        bold: false,
        boldItalic: false,
      })
    }

    const boldText = match[1]
    const isBoldItalic = BOLD_ITALIC_LABELS.includes(boldText)

    segments.push({
      text: boldText,
      bold: !isBoldItalic,
      boldItalic: isBoldItalic,
    })

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      bold: false,
      boldItalic: false,
    })
  }

  return segments
}
