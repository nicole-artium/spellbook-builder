/**
 * Generate US Letter format mockup
 * Same layout as A5, different page dimensions
 */

import { jsPDF } from 'jspdf'
import { writeFileSync } from 'fs'

// US Letter in mm: 215.9 x 279.4
const PAGE_WIDTH = 215.9
const PAGE_HEIGHT = 279.4
const MARGIN = 15
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
    format: 'letter',
  })

  let y = MARGIN

  // Cantrips header
  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.text('Cantrips', MARGIN, y)
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  y += 12

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

  y += 6

  // Cantrip: Light
  y = renderSpell(doc, y, {
    name: 'LIGHT',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    duration: '1 hour',
    concentration: false,
    ritual: false,
    components: 'V M',
    material: '(a firefly or phosphorescent moss)',
    description: [
      'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
      'Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.',
    ],
    higherLevels: null,
  })

  // Page break for Level 1
  doc.addPage()
  y = MARGIN

  // Level 1 header
  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.text('Level 1', MARGIN, y)
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)
  y += 12

  // Spell 1: Detect Magic
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

  // Spell 2: Chromatic Orb
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

  y += 6

  // Spell 3: Shield
  y = renderSpell(doc, y, {
    name: 'SHIELD',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    duration: '1 round',
    concentration: false,
    ritual: false,
    components: 'V S',
    material: null,
    description: [
      'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
    ],
    higherLevels: null,
  })

  y += 6

  // Spell 4: Magic Missile
  y = renderSpell(doc, y, {
    name: 'MAGIC MISSILE',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    components: 'V S',
    material: null,
    description: [
      'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.',
    ],
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
  })

  // Save
  const pdfOutput = doc.output('arraybuffer')
  writeFileSync('docs/design/letter-binder-format.pdf', Buffer.from(pdfOutput))
  console.log('Letter mockup saved to docs/design/letter-binder-format.pdf')
}

function renderSpell(doc: jsPDF, startY: number, spell: SpellData): number {
  let y = startY

  const col1 = MARGIN
  const col2 = MARGIN + 32
  const col3 = MARGIN + 64
  const col4 = MARGIN + 110

  // Spell name - small caps
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.setCharSpace(0.8)
  doc.text(spell.name, MARGIN, y)
  const baseWidth = doc.getTextWidth(spell.name)
  const nameWidth = baseWidth + (0.8 * spell.name.length)
  doc.setCharSpace(0)

  // Level and school
  doc.setFont('times', 'italic')
  doc.setFontSize(9)
  const levelSchool = spell.level === 0
    ? `(${spell.school} Cantrip)`
    : `(Level ${spell.level} ${spell.school})`
  doc.text(levelSchool, MARGIN + nameWidth + 3, y)
  y += 5

  // Metadata row
  doc.setFont('times', 'normal')
  doc.setFontSize(9)

  // Col 1: Ritual + casting time
  let col1X = col1
  if (spell.ritual) {
    drawSquare(doc, col1X + 1, y - 1, 2)
    col1X += 5
  }
  doc.text(spell.castingTime, col1X, y)

  // Col 2: Range
  doc.text(spell.range, col2, y)

  // Col 3: Concentration + duration
  let col3X = col3
  if (spell.concentration) {
    drawDiamond(doc, col3X + 1, y - 1, 2)
    col3X += 5
  }
  doc.text(spell.duration, col3X, y)

  // Col 4: Components
  doc.text(spell.components, col4, y)
  y += 4

  // Material
  if (spell.material) {
    doc.setFont('times', 'italic')
    doc.setFontSize(8)
    doc.text(spell.material, col4, y)
    y += 4
  }

  y += 1

  // Description
  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  const lineHeight = 3.8
  const indent = 3

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
    doc.setFontSize(9)
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
