export interface SpellComponents {
  verbal: boolean
  somatic: boolean
  material: boolean
  materialDescription?: string
}

export interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  components: SpellComponents
  description: string
  higherLevels?: string
  ritual: boolean
  concentration: boolean
}

export interface SpellListItem {
  index: string
  name: string
  level: number
  url: string
}

export interface Character {
  id: string
  className: string
  subclass: string
  level: number
}

export interface Spellbook {
  character: Character
  spells: Spell[]
}

export interface ClassInfo {
  index: string
  name: string
  url: string
}

export interface SubclassInfo {
  index: string
  name: string
  url: string
}

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const SPELL_LEVEL_NAMES: Record<SpellLevel, string> = {
  0: 'Cantrip',
  1: '1st Level',
  2: '2nd Level',
  3: '3rd Level',
  4: '4th Level',
  5: '5th Level',
  6: '6th Level',
  7: '7th Level',
  8: '8th Level',
  9: '9th Level',
}

export type CasterType = 'full' | 'half' | 'third' | 'pact' | 'none'

export const CLASS_CASTER_TYPES: Record<string, CasterType> = {
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  sorcerer: 'full',
  wizard: 'full',
  paladin: 'half',
  ranger: 'half',
  warlock: 'pact',
  fighter: 'third',
  rogue: 'third',
  barbarian: 'none',
  monk: 'none',
}

const FULL_CASTER_MAX_SPELL_LEVEL: Record<number, SpellLevel> = {
  1: 1, 2: 1,
  3: 2, 4: 2,
  5: 3, 6: 3,
  7: 4, 8: 4,
  9: 5, 10: 5,
  11: 6, 12: 6,
  13: 7, 14: 7,
  15: 8, 16: 8,
  17: 9, 18: 9, 19: 9, 20: 9,
}

const HALF_CASTER_MAX_SPELL_LEVEL: Record<number, SpellLevel> = {
  1: 0, 2: 1, 3: 1, 4: 1,
  5: 2, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 3,
  13: 4, 14: 4, 15: 4, 16: 4,
  17: 5, 18: 5, 19: 5, 20: 5,
}

const THIRD_CASTER_MAX_SPELL_LEVEL: Record<number, SpellLevel> = {
  1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1,
  7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
  13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3,
  19: 4, 20: 4,
}

const PACT_CASTER_MAX_SPELL_LEVEL: Record<number, SpellLevel> = {
  1: 1, 2: 1,
  3: 2, 4: 2,
  5: 3, 6: 3,
  7: 4, 8: 4,
  9: 5, 10: 5, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5,
}

export function getMaxSpellLevel(className: string, characterLevel: number): SpellLevel {
  const normalizedClass = className.toLowerCase().replace(/^[^_]+_/, '')
  const casterType = CLASS_CASTER_TYPES[normalizedClass] ?? 'full'
  const level = Math.max(1, Math.min(20, characterLevel))

  switch (casterType) {
    case 'half':
      return HALF_CASTER_MAX_SPELL_LEVEL[level]
    case 'third':
      return THIRD_CASTER_MAX_SPELL_LEVEL[level]
    case 'pact':
      return PACT_CASTER_MAX_SPELL_LEVEL[level]
    case 'none':
      return 0
    default:
      return FULL_CASTER_MAX_SPELL_LEVEL[level]
  }
}
