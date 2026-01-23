import { jsPDF } from 'jspdf'
import type { Spell, Character } from '../../types'
import type { PdfAdapter } from './PdfAdapter'
import type { PageFormat } from './pageFormats'
import { groupSpellsByLevel, sortAlphabetically } from '../../utils/spellSorters'
import { drawDiamond, drawSquare } from './icons'
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_ITALIC,
  FONT_BOLD_ITALIC,
} from './fonts/ebGaramond'

const FONT_SPELL_NAME = 9
const FONT_LEVEL_SCHOOL = 8
const FONT_METADATA = 8
const FONT_MATERIAL = 7
const FONT_BODY = 8

const LINE_HEIGHT_BODY = 3.5
const LINE_HEIGHT_META = 4.5
const SPELL_SPACING = 5
const SECTION_HEADER_HEIGHT = 8
const ICON_SIZE = 1.8
const FIRST_INDENT = 3

export class BinderPdfAdapter implements PdfAdapter {
  private format: PageFormat
  private contentWidth: number

  constructor(format: PageFormat) {
    this.format = format
    this.contentWidth = format.width - format.margins.left - format.margins.right
  }

  generateSpellbook(spells: Spell[], character: Character): void {
    const doc = this.createDocument()
    this.registerFonts(doc)

    const spellsByLevel = groupSpellsByLevel(spells)
    const levels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b)

    let isFirstPage = true
    for (const level of levels) {
      if (!isFirstPage) doc.addPage()
      isFirstPage = false

      const levelSpells = sortAlphabetically(spellsByLevel.get(level) || [])
      this.renderLevelSection(doc, level, levelSpells)
    }

    const filename = this.buildFilename(character)
    doc.save(filename)
  }

  private createDocument(): jsPDF {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [this.format.width, this.format.height],
    })
  }

  private registerFonts(doc: jsPDF): void {
    doc.addFileToVFS('EBGaramond-Regular.ttf', FONT_REGULAR)
    doc.addFileToVFS('EBGaramond-Bold.ttf', FONT_BOLD)
    doc.addFileToVFS('EBGaramond-Italic.ttf', FONT_ITALIC)
    doc.addFileToVFS('EBGaramond-BoldItalic.ttf', FONT_BOLD_ITALIC)

    doc.addFont('EBGaramond-Regular.ttf', 'EBGaramond', 'normal')
    doc.addFont('EBGaramond-Bold.ttf', 'EBGaramond', 'bold')
    doc.addFont('EBGaramond-Italic.ttf', 'EBGaramond', 'italic')
    doc.addFont('EBGaramond-BoldItalic.ttf', 'EBGaramond', 'bolditalic')
  }

  private renderLevelSection(doc: jsPDF, level: number, spells: Spell[]): void {
    let y = this.format.margins.top
    y = this.renderSectionHeader(doc, level, y)

    for (const spell of spells) {
      const spellHeight = this.estimateSpellHeight(doc, spell)
      if (y + spellHeight > this.format.height - this.format.margins.bottom) {
        doc.addPage()
        y = this.format.margins.top
      }
      y = this.renderSpell(doc, spell, y)
      y += SPELL_SPACING
    }
  }

  private renderSectionHeader(doc: jsPDF, level: number, y: number): number {
    const text = level === 0 ? 'Cantrips' : `Level ${level}`
    doc.setFont('EBGaramond', 'bold')
    doc.setFontSize(11)
    doc.text(text, this.format.margins.left, y + 4)

    const lineY = y + 6
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(
      this.format.margins.left,
      lineY,
      this.format.width - this.format.margins.right,
      lineY
    )

    return lineY + SECTION_HEADER_HEIGHT
  }

  private renderSpell(doc: jsPDF, spell: Spell, startY: number): number {
    let y = startY
    const x = this.format.margins.left

    y = this.renderSpellHeader(doc, spell, x, y)
    y = this.renderMetadataRow(doc, spell, x, y)

    if (spell.components.material && spell.components.materialDescription) {
      y = this.renderMaterialDescription(doc, spell.components.materialDescription, y)
    }

    y += 1
    y = this.renderDescription(doc, spell.description, x, y)

    if (spell.higherLevels) {
      y = this.renderHigherLevels(doc, spell.higherLevels, x, y)
    }

    return y
  }

  private renderSpellHeader(doc: jsPDF, spell: Spell, x: number, y: number): number {
    doc.setFont('EBGaramond', 'bold')
    doc.setFontSize(FONT_SPELL_NAME)
    const smallCapsName = this.toSmallCaps(spell.name)
    doc.setCharSpace(0.5)
    doc.text(smallCapsName, x, y)
    doc.setCharSpace(0)

    const nameWidth = doc.getTextWidth(smallCapsName)
    doc.setFont('EBGaramond', 'italic')
    doc.setFontSize(FONT_LEVEL_SCHOOL)
    const levelSchool = this.formatLevelSchool(spell)
    doc.text(levelSchool, x + nameWidth + 2, y)

    return y + LINE_HEIGHT_META
  }

  private renderMetadataRow(doc: jsPDF, spell: Spell, x: number, y: number): number {
    doc.setFont('EBGaramond', 'normal')
    doc.setFontSize(FONT_METADATA)

    const colWidth = this.contentWidth / 4
    let colX = x

    if (spell.ritual) {
      drawSquare(doc, colX, y - ICON_SIZE - 0.3, ICON_SIZE)
      colX += ICON_SIZE + 1.5
    }
    doc.text(spell.castingTime, colX, y)
    colX = x + colWidth

    doc.text(spell.range, colX, y)
    colX = x + colWidth * 2

    if (spell.concentration) {
      drawDiamond(doc, colX, y - ICON_SIZE - 0.3, ICON_SIZE)
      colX += ICON_SIZE + 1.5
    }
    doc.text(spell.duration, colX, y)

    const componentsX = x + colWidth * 3
    const components = this.formatComponents(spell)
    doc.text(components, componentsX, y)

    return y + LINE_HEIGHT_META
  }

  private renderMaterialDescription(doc: jsPDF, material: string, y: number): number {
    doc.setFont('EBGaramond', 'italic')
    doc.setFontSize(FONT_MATERIAL)

    const colWidth = this.contentWidth / 4
    const materialX = this.format.margins.left + colWidth * 3
    const maxWidth = colWidth - 2
    const materialText = `(${material})`
    const lines = doc.splitTextToSize(materialText, maxWidth)

    for (const line of lines) {
      doc.text(line, materialX, y)
      y += LINE_HEIGHT_BODY
    }

    return y
  }

  private renderDescription(doc: jsPDF, description: string, x: number, startY: number): number {
    doc.setFont('EBGaramond', 'normal')
    doc.setFontSize(FONT_BODY)

    let y = startY
    const paragraphs = description.split('\n\n')

    for (let i = 0; i < paragraphs.length; i++) {
      const isFirst = i === 0
      const paragraph = paragraphs[i].replace(/\n/g, ' ')
      const lines = doc.splitTextToSize(paragraph, this.contentWidth)

      for (let j = 0; j < lines.length; j++) {
        const isFirstLineOfPara = j === 0
        const lineX = !isFirst && isFirstLineOfPara ? x + FIRST_INDENT : x

        if (y > this.format.height - this.format.margins.bottom) {
          doc.addPage()
          y = this.format.margins.top
        }

        doc.text(lines[j], lineX, y)
        y += LINE_HEIGHT_BODY
      }
    }

    return y
  }

  private renderHigherLevels(doc: jsPDF, higherLevels: string, x: number, y: number): number {
    doc.setFont('EBGaramond', 'bolditalic')
    doc.setFontSize(FONT_BODY)
    const label = 'At Higher Levels.'
    const labelX = x + FIRST_INDENT

    if (y > this.format.height - this.format.margins.bottom) {
      doc.addPage()
      y = this.format.margins.top
    }

    doc.text(label, labelX, y)
    const labelWidth = doc.getTextWidth(label)

    doc.setFont('EBGaramond', 'normal')
    const remainingWidth = this.contentWidth - FIRST_INDENT - labelWidth - 2
    const textLines = doc.splitTextToSize(higherLevels, remainingWidth)

    if (textLines.length > 0) {
      doc.text(textLines[0], labelX + labelWidth + 1, y)
      y += LINE_HEIGHT_BODY
    }

    const fullLines = doc.splitTextToSize(
      textLines.slice(1).join(' '),
      this.contentWidth
    )

    for (const line of fullLines) {
      if (y > this.format.height - this.format.margins.bottom) {
        doc.addPage()
        y = this.format.margins.top
      }
      doc.text(line, x, y)
      y += LINE_HEIGHT_BODY
    }

    return y
  }

  private estimateSpellHeight(doc: jsPDF, spell: Spell): number {
    doc.setFontSize(FONT_BODY)

    const headerHeight = LINE_HEIGHT_META
    const metadataHeight = LINE_HEIGHT_META

    let materialHeight = 0
    if (spell.components.material && spell.components.materialDescription) {
      const colWidth = this.contentWidth / 4
      const lines = doc.splitTextToSize(`(${spell.components.materialDescription})`, colWidth - 2)
      materialHeight = lines.length * LINE_HEIGHT_BODY
    }

    const descLines = doc.splitTextToSize(spell.description, this.contentWidth).length
    const descHeight = descLines * LINE_HEIGHT_BODY

    let higherHeight = 0
    if (spell.higherLevels) {
      const higherLines = doc.splitTextToSize(spell.higherLevels, this.contentWidth).length
      higherHeight = higherLines * LINE_HEIGHT_BODY
    }

    return headerHeight + metadataHeight + materialHeight + descHeight + higherHeight + SPELL_SPACING + 2
  }

  private toSmallCaps(text: string): string {
    return text.toUpperCase()
  }

  private formatLevelSchool(spell: Spell): string {
    const levelText =
      spell.level === 0
        ? `${spell.school} cantrip`
        : `Level ${spell.level} ${spell.school}`
    return `(${levelText})`
  }

  private formatComponents(spell: Spell): string {
    const parts: string[] = []
    if (spell.components.verbal) parts.push('V')
    if (spell.components.somatic) parts.push('S')
    if (spell.components.material) parts.push('M')
    return parts.join(' ')
  }

  private buildFilename(character: Character): string {
    const base = character.name?.trim()
      ? `${character.name}-spellbook`
      : 'spellbook'
    const sanitized = base.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    return `${sanitized}-${this.format.id}.pdf`
  }
}
