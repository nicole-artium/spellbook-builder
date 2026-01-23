/**
 * Generate final comprehensive mockup for ADR
 * Shows complete A5 binder format with all design decisions
 */

import { jsPDF } from 'jspdf'
import { writeFileSync } from 'fs'

const PAGE_WIDTH = 148
const PAGE_HEIGHT = 210
const MARGIN = 12
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

function drawDiamond(doc: jsPDF, x: number, y: number, size: number): void {
  const half = size / 2
  doc.setFillColor(0, 0, 0)
  doc.triangle(x, y - half, x + half, y, x - half, y, 'F')
  doc.triangle(x + half, y, x, y + half, x - half, y, 'F')
}

function drawSquare(doc: jsPDF, x: number, y: number, size: number): void {
  const half = size / 2
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.rect(x - half, y - half, size, size, 'S')
}

interface SpellData {
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  concentration: boolean
  ritual: boolean
  components: string
  material: string | null
  description: string[]
  higherLevels: string | null
}

function createMockup(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  })

  let y = MARGIN

  // Cantrips header
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text('Cantrips', MARGIN, y)
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  y += 10

  // Cantrip: Fire Bolt
  y = renderSpell(doc, y, {
    name: 'FIRE BOLT',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    components: 'V S',
    material: null,
    description: [
      'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried.',
    ],
    higherLevels: null,
  })

  // Page break for Level 1
  doc.addPage()
  y = MARGIN

  // Level 1 header
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text('Level 1', MARGIN, y)
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  y += 10

  // Spell 1: Detect Magic (concentration + ritual, no material)
  y = renderSpell(doc, y, {
    name: 'DETECT MAGIC',
    level: 1,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Self',
    duration: '10 minutes',
    concentration: true,
    ritual: true,
    components: 'V S',
    material: null,
    description: [
      'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.',
      'The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.',
    ],
    higherLevels: null,
  })

  y += 6

  // Spell 2: Compelled Duel (concentration, no ritual, material)
  y = renderSpell(doc, y, {
    name: 'COMPELLED DUEL',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 bonus action',
    range: '30 feet',
    duration: '1 minute',
    concentration: true,
    ritual: false,
    components: 'V',
    material: null,
    description: [
      'You attempt to compel a creature into a duel. One creature that you can see within range must make a Wisdom saving throw. On a failed save, the creature is drawn to you, compelled by your divine demand.',
      'For the duration, it has disadvantage on attack rolls against creatures other than you, and must make a Wisdom saving throw each time it attempts to move to a space that is more than 30 feet away from you.',
    ],
    higherLevels: null,
  })

  y += 6

  // Spell 3: Chromatic Orb (no concentration, material with cost)
  y = renderSpell(doc, y, {
    name: 'CHROMATIC ORB',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '90 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    components: 'V S M',
    material: '(a diamond worth at least 50 gp)',
    description: [
      'You hurl a 4-inch-diameter sphere of energy at a creature that you can see within range. You choose acid, cold, fire, lightning, poison, or thunder for the type of orb you create, and then make a ranged spell attack against the target. If the attack hits, the creature takes 3d8 damage of the type you chose.',
    ],
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.',
  })

  // Save
  const pdfOutput = doc.output('arraybuffer')
  writeFileSync('docs/design/a5-binder-format.pdf', Buffer.from(pdfOutput))
  console.log('Final mockup saved to docs/design/a5-binder-format.pdf')
}

function renderSpell(doc: jsPDF, startY: number, spell: SpellData): number {
  let y = startY

  const col1 = MARGIN
  const col2 = MARGIN + 24
  const col3 = MARGIN + 48
  const col4 = MARGIN + 78

  // Spell name - small caps
  doc.setFont('times', 'bold')
  doc.setFontSize(9)
  doc.setCharSpace(0.8)
  doc.text(spell.name, MARGIN, y)
  const baseWidth = doc.getTextWidth(spell.name)
  const nameWidth = baseWidth + (0.8 * spell.name.length)
  doc.setCharSpace(0)

  // Level and school
  doc.setFont('times', 'italic')
  doc.setFontSize(8)
  const levelSchool = spell.level === 0
    ? `(${spell.school} Cantrip)`
    : `(Level ${spell.level} ${spell.school})`
  doc.text(levelSchool, MARGIN + nameWidth + 3, y)
  y += 4.5

  // Metadata row
  doc.setFont('times', 'normal')
  doc.setFontSize(8)

  // Col 1: Ritual + casting time
  let col1X = col1
  if (spell.ritual) {
    drawSquare(doc, col1X + 1, y - 1, 1.8)
    col1X += 4
  }
  doc.text(spell.castingTime, col1X, y)

  // Col 2: Range
  doc.text(spell.range, col2, y)

  // Col 3: Concentration + duration
  let col3X = col3
  if (spell.concentration) {
    drawDiamond(doc, col3X + 1, y - 1, 1.8)
    col3X += 4
  }
  doc.text(spell.duration, col3X, y)

  // Col 4: Components
  doc.text(spell.components, col4, y)
  y += 3.5

  // Material
  if (spell.material) {
    doc.setFont('times', 'italic')
    doc.setFontSize(7)
    doc.text(spell.material, col4, y)
    y += 3.5
  }

  y += 1

  // Description
  doc.setFont('times', 'normal')
  doc.setFontSize(8)
  const lineHeight = 3.2
  const indent = 2.5

  for (let i = 0; i < spell.description.length; i++) {
    const para = spell.description[i]
    const isFirst = i === 0
    const textX = isFirst ? MARGIN : MARGIN + indent
    const availableWidth = isFirst ? CONTENT_WIDTH : CONTENT_WIDTH - indent

    const lines = doc.splitTextToSize(para, availableWidth)

    doc.text(lines[0], textX, y)
    y += lineHeight

    for (let j = 1; j < lines.length; j++) {
      doc.text(lines[j], MARGIN, y)
      y += lineHeight
    }
  }

  // At Higher Levels
  if (spell.higherLevels) {
    doc.setFont('times', 'bolditalic')
    doc.setFontSize(8)
    doc.text('At Higher Levels.', MARGIN + indent, y)
    const labelWidth = doc.getTextWidth('At Higher Levels. ')

    doc.setFont('times', 'normal')
    const higherLines = doc.splitTextToSize(spell.higherLevels, CONTENT_WIDTH - indent - labelWidth)

    doc.text(higherLines[0], MARGIN + indent + labelWidth, y)
    y += lineHeight

    for (let i = 1; i < higherLines.length; i++) {
      doc.text(higherLines[i], MARGIN, y)
      y += lineHeight
    }
  }

  return y
}

createMockup()
