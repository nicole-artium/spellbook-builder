import { jsPDF } from 'jspdf'
import type { Spell, Character } from '../../types'
import type { PdfAdapter } from './PdfAdapter'
import { sortByLevelThenAlpha } from '../../utils/spellSorters'
import { SPELL_LEVEL_NAMES, type SpellLevel } from '../../types'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 15
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
const LINE_HEIGHT = 5
const HEADER_SIZE = 12
const BODY_SIZE = 10
const INDENT = 5

export class JsPdfAdapter implements PdfAdapter {
  generateSpellbook(spells: Spell[], character: Character): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const sortedSpells = sortByLevelThenAlpha(spells)
    let y = MARGIN

    const title = this.buildTitle(character)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, MARGIN, y)
    y += LINE_HEIGHT * 2

    for (const spell of sortedSpells) {
      const spellHeight = this.estimateSpellHeight(doc, spell)
      if (y + spellHeight > PAGE_HEIGHT - MARGIN) {
        doc.addPage()
        y = MARGIN
      }
      y = this.renderSpell(doc, spell, y)
      y += LINE_HEIGHT
    }

    doc.save(`${this.sanitizeFilename(title)}.pdf`)
  }

  private buildTitle(character: Character): string {
    if (character.className) {
      const parts = [character.className]
      if (character.subclass) parts.push(`(${character.subclass})`)
      parts.push(`Level ${character.level}`)
      return `${parts.join(' ')} Spellbook`
    }
    return 'Spellbook'
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  }

  private formatSpellLevel(level: number): string {
    return SPELL_LEVEL_NAMES[level as SpellLevel] || `Level ${level}`
  }

  private formatComponents(spell: Spell): string {
    const parts: string[] = []
    if (spell.components.verbal) parts.push('V')
    if (spell.components.somatic) parts.push('S')
    if (spell.components.material) {
      const mat = spell.components.materialDescription
        ? `M (${spell.components.materialDescription})`
        : 'M'
      parts.push(mat)
    }
    return parts.join(', ')
  }

  private renderSpell(doc: jsPDF, spell: Spell, startY: number): number {
    let y = startY

    const levelText = this.formatSpellLevel(spell.level)
    const header = `${spell.name} (${spell.school} ${levelText})`
    doc.setFontSize(HEADER_SIZE)
    doc.setFont('helvetica', 'bold')
    doc.text(header, MARGIN, y)
    y += LINE_HEIGHT + 1

    doc.setFontSize(BODY_SIZE)
    doc.setFont('helvetica', 'normal')

    const metadata = [
      `Casting Time: ${spell.castingTime}`,
      `Range: ${spell.range}`,
      `Duration: ${spell.concentration ? 'Concentration, ' : ''}${spell.duration}`,
      `Components: ${this.formatComponents(spell)}`,
    ]

    for (const line of metadata) {
      doc.text(line, MARGIN + 2, y)
      y += LINE_HEIGHT
    }

    y += 1
    y = this.renderWrappedText(doc, spell.description, MARGIN, y, CONTENT_WIDTH)

    if (spell.higherLevels) {
      y += LINE_HEIGHT / 2
      const { label, content } = this.parseHigherLevelLabel(spell.higherLevels)
      const higherText = `${label} ${content}`
      y = this.renderWrappedText(doc, higherText, MARGIN + INDENT, y, CONTENT_WIDTH - INDENT)
    }

    return y
  }

  private renderWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    startY: number,
    maxWidth: number
  ): number {
    let y = startY
    const paragraphs = text.split('\n\n')

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].replace(/\n/g, ' ')
      const lines = doc.splitTextToSize(paragraph, maxWidth)

      for (const line of lines) {
        if (y > PAGE_HEIGHT - MARGIN) {
          doc.addPage()
          y = MARGIN
        }
        doc.text(line, x, y)
        y += LINE_HEIGHT
      }

      if (i < paragraphs.length - 1) {
        y += LINE_HEIGHT / 2
      }
    }

    return y
  }

  private parseHigherLevelLabel(text: string): { label: string; content: string } {
    const match = text.match(/^\*\*(.+?)\*\*\s*(.*)$/s)
    if (match) {
      return { label: match[1], content: match[2] }
    }
    return { label: 'At Higher Levels:', content: text }
  }

  private estimateSpellHeight(doc: jsPDF, spell: Spell): number {
    doc.setFontSize(BODY_SIZE)
    const descLines = doc.splitTextToSize(spell.description, CONTENT_WIDTH).length
    const higherLines = spell.higherLevels
      ? doc.splitTextToSize(spell.higherLevels, CONTENT_WIDTH - INDENT).length
      : 0

    const headerHeight = LINE_HEIGHT + 1
    const metadataHeight = LINE_HEIGHT * 4
    const descHeight = descLines * LINE_HEIGHT
    const higherHeight = higherLines * LINE_HEIGHT

    return headerHeight + metadataHeight + descHeight + higherHeight + LINE_HEIGHT * 2
  }
}

export const pdfAdapter = new JsPdfAdapter()
