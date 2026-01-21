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

export const MAX_SPELL_LEVEL_BY_CHARACTER_LEVEL: Record<number, SpellLevel> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 5,
  10: 5,
  11: 6,
  12: 6,
  13: 7,
  14: 7,
  15: 8,
  16: 8,
  17: 9,
  18: 9,
  19: 9,
  20: 9,
}
