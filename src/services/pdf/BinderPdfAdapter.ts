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

const FONT_SPELL_NAME = 8
const FONT_LEVEL_SCHOOL = 8
const FONT_METADATA = 7
const FONT_MATERIAL = 7
const FONT_BODY = 7

const LINE_HEIGHT_BODY = 3.0
const LINE_HEIGHT_META = 4.5
const SPELL_SPACING = 2.0
const GAP_NAME_TO_META = 2.5
const GAP_AFTER_META = 2.5
const SECTION_HEADER_HEIGHT = 8
const ICON_SIZE = 1.8
const FIRST_INDENT = 3

const COL_MIN_RATIOS = {
  castingTime: 0.15,
  range: 0.12,
  duration: 0.20,
  components: 0.25,
}

const COL_PADDING = 3

type ColWidths = {
  castingTime: number
  range: number
  duration: number
  components: number
}

export class BinderPdfAdapter implements PdfAdapter {
  private format: PageFormat
  private contentWidth: number
  private colWidths!: ColWidths

  constructor(format: PageFormat) {
    this.format = format
    this.contentWidth = format.width - format.margins.left - format.margins.right
  }

  private calculateOptimalColumnWidths(doc: jsPDF, spells: Spell[]): ColWidths {
    doc.setFont('EBGaramond', 'normal')
    doc.setFontSize(FONT_METADATA)

    let maxCasting = 0
    let maxRange = 0
    let maxDuration = 0
    let maxComponents = 0

    for (const spell of spells) {
      let castingWidth = doc.getTextWidth(spell.castingTime) + COL_PADDING
      if (spell.ritual) castingWidth += ICON_SIZE + 1

      const rangeWidth = doc.getTextWidth(spell.range) + COL_PADDING

      let durationWidth = doc.getTextWidth(spell.duration) + COL_PADDING
      if (spell.concentration) durationWidth += ICON_SIZE + 1

      const componentsWidth = doc.getTextWidth(this.formatComponents(spell)) + COL_PADDING

      maxCasting = Math.max(maxCasting, castingWidth)
      maxRange = Math.max(maxRange, rangeWidth)
      maxDuration = Math.max(maxDuration, durationWidth)
      maxComponents = Math.max(maxComponents, componentsWidth)
    }

    const minCasting = this.contentWidth * COL_MIN_RATIOS.castingTime
    const minRange = this.contentWidth * COL_MIN_RATIOS.range
    const minDuration = this.contentWidth * COL_MIN_RATIOS.duration
    const minComponents = this.contentWidth * COL_MIN_RATIOS.components

    maxCasting = Math.max(maxCasting, minCasting)
    maxRange = Math.max(maxRange, minRange)
    maxDuration = Math.max(maxDuration, minDuration)
    maxComponents = Math.max(maxComponents, minComponents)

    const totalNeeded = maxCasting + maxRange + maxDuration + maxComponents
    const remaining = this.contentWidth - totalNeeded

    if (remaining > 0) {
      const ratio = this.contentWidth / totalNeeded
      return {
        castingTime: maxCasting * ratio,
        range: maxRange * ratio,
        duration: maxDuration * ratio,
        components: maxComponents * ratio,
      }
    }

    return {
      castingTime: maxCasting,
      range: maxRange,
      duration: maxDuration,
      components: maxComponents,
    }
  }

  generateSpellbook(spells: Spell[], character: Character): void {
    const doc = this.createDocument()
    this.registerFonts(doc)
    this.colWidths = this.calculateOptimalColumnWidths(doc, spells)

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
    y = this.renderDescription(doc, spell.description, x, y)

    if (spell.higherLevels) {
      y = this.renderHigherLevels(doc, spell.higherLevels, x, y)
    }

    return y
  }

  private renderSpellHeader(doc: jsPDF, spell: Spell, x: number, y: number): number {
    const nameEndX = this.renderSmallCapsName(doc, spell.name, x, y)

    doc.setFont('EBGaramond', 'italic')
    doc.setFontSize(FONT_LEVEL_SCHOOL)
    const levelSchool = this.formatLevelSchool(spell)
    doc.text(levelSchool, nameEndX + 2, y)

    return y + GAP_NAME_TO_META
  }

  private renderSmallCapsName(doc: jsPDF, name: string, startX: number, y: number): number {
    doc.setFont('EBGaramond', 'bold')
    const fullSize = FONT_SPELL_NAME
    const smallSize = FONT_SPELL_NAME * 0.75

    let x = startX
    const words = name.toUpperCase().split(' ')

    for (let w = 0; w < words.length; w++) {
      if (w > 0) {
        doc.setFontSize(fullSize)
        doc.text(' ', x, y)
        x += doc.getTextWidth(' ')
      }

      const word = words[w]
      for (let i = 0; i < word.length; i++) {
        const char = word[i]
        const size = i === 0 ? fullSize : smallSize
        doc.setFontSize(size)
        doc.text(char, x, y)
        x += doc.getTextWidth(char)
      }
    }

    return x
  }

  private renderMetadataRow(doc: jsPDF, spell: Spell, x: number, y: number): number {
    const materialLines = this.getMaterialLines(doc, spell)
    const rowHeight = this.calculateMetadataRowHeight(materialLines.length)
    const textY = y + LINE_HEIGHT_META - 1

    this.renderMetadataBorders(doc, x, y, rowHeight)
    this.renderMetadataCells(doc, spell, x, textY, materialLines)

    return y + rowHeight + GAP_AFTER_META
  }

  private getMaterialLines(doc: jsPDF, spell: Spell): string[] {
    if (!spell.components.material || !spell.components.materialDescription) {
      return []
    }
    doc.setFontSize(FONT_MATERIAL)
    const materialText = `(${spell.components.materialDescription})`
    return doc.splitTextToSize(materialText, this.colWidths.components - 2)
  }

  private calculateMetadataRowHeight(materialLineCount: number): number {
    const baseHeight = LINE_HEIGHT_META + 1
    if (materialLineCount === 0) return baseHeight
    return baseHeight + materialLineCount * LINE_HEIGHT_BODY
  }

  private renderMetadataBorders(doc: jsPDF, x: number, y: number, rowHeight: number): void {
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.15)

    const rightEdge = x + this.contentWidth
    doc.line(x, y, rightEdge, y)
    doc.line(x, y + rowHeight, rightEdge, y + rowHeight)

    let dividerX = x + this.colWidths.castingTime
    doc.line(dividerX, y, dividerX, y + rowHeight)

    dividerX += this.colWidths.range
    doc.line(dividerX, y, dividerX, y + rowHeight)

    dividerX += this.colWidths.duration
    doc.line(dividerX, y, dividerX, y + rowHeight)
  }

  private renderMetadataCells(
    doc: jsPDF,
    spell: Spell,
    x: number,
    textY: number,
    materialLines: string[]
  ): void {
    doc.setFont('EBGaramond', 'normal')
    doc.setFontSize(FONT_METADATA)

    let cellX = x + 1
    if (spell.ritual) {
      drawSquare(doc, cellX, textY - ICON_SIZE - 0.3, ICON_SIZE)
      cellX += ICON_SIZE + 1
    }
    doc.text(spell.castingTime, cellX, textY)

    cellX = x + this.colWidths.castingTime + 1
    doc.text(spell.range, cellX, textY)

    cellX = x + this.colWidths.castingTime + this.colWidths.range + 1
    if (spell.concentration) {
      drawDiamond(doc, cellX, textY - ICON_SIZE - 0.3, ICON_SIZE)
      cellX += ICON_SIZE + 1
    }
    doc.text(spell.duration, cellX, textY)

    const componentsX = x + this.colWidths.castingTime + this.colWidths.range + this.colWidths.duration + 1
    const components = this.formatComponents(spell)
    doc.text(components, componentsX, textY)

    if (materialLines.length > 0) {
      doc.setFont('EBGaramond', 'italic')
      doc.setFontSize(FONT_MATERIAL)
      let matY = textY + LINE_HEIGHT_BODY
      for (const line of materialLines) {
        doc.text(line, componentsX, matY)
        matY += LINE_HEIGHT_BODY
      }
    }
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
    const headerHeight = GAP_NAME_TO_META
    const materialLines = this.getMaterialLines(doc, spell)
    const metadataHeight = this.calculateMetadataRowHeight(materialLines.length) + GAP_AFTER_META

    doc.setFontSize(FONT_BODY)
    const descLines = doc.splitTextToSize(spell.description, this.contentWidth).length
    const descHeight = descLines * LINE_HEIGHT_BODY

    let higherHeight = 0
    if (spell.higherLevels) {
      const higherLines = doc.splitTextToSize(spell.higherLevels, this.contentWidth).length
      higherHeight = higherLines * LINE_HEIGHT_BODY
    }

    return headerHeight + metadataHeight + descHeight + higherHeight + SPELL_SPACING
  }

  private formatLevelSchool(spell: Spell): string {
    const school = this.toTitleCase(spell.school)
    const levelText =
      spell.level === 0
        ? `${school} Cantrip`
        : `Level ${spell.level} ${school}`
    return `(${levelText})`
  }

  private toTitleCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
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
