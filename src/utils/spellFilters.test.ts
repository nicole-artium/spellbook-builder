import { describe, it, expect } from 'vitest'
import {
  filterSpellsBySearch,
  filterSpellsByLevel,
  filterSpellsByMaxLevel,
  filterSpells,
  isSpellInList,
} from './spellFilters'
import type { Spell, SpellListItem } from '../types'

const mockSpells: SpellListItem[] = [
  { index: 'fireball', name: 'Fireball', level: 3, url: '/spells/fireball' },
  { index: 'fire-bolt', name: 'Fire Bolt', level: 0, url: '/spells/fire-bolt' },
  { index: 'cure-wounds', name: 'Cure Wounds', level: 1, url: '/spells/cure-wounds' },
  { index: 'healing-word', name: 'Healing Word', level: 1, url: '/spells/healing-word' },
  { index: 'wish', name: 'Wish', level: 9, url: '/spells/wish' },
]

const mockFullSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: '1 action',
  range: '150 feet',
  duration: 'Instantaneous',
  components: { verbal: true, somatic: true, material: true, materialDescription: 'bat guano' },
  description: 'A bright streak flashes...',
  ritual: false,
  concentration: false,
}

describe('filterSpellsBySearch', () => {
  it('returns all spells when search is empty', () => {
    const result = filterSpellsBySearch(mockSpells, '')
    expect(result).toHaveLength(5)
  })

  it('filters by exact name match', () => {
    const result = filterSpellsBySearch(mockSpells, 'Fireball')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Fireball')
  })

  it('filters case-insensitively', () => {
    const result = filterSpellsBySearch(mockSpells, 'fireball')
    expect(result).toHaveLength(1)
  })

  it('filters by partial match', () => {
    const result = filterSpellsBySearch(mockSpells, 'fire')
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.name)).toContain('Fireball')
    expect(result.map((s) => s.name)).toContain('Fire Bolt')
  })

  it('returns empty array when no matches', () => {
    const result = filterSpellsBySearch(mockSpells, 'xyz')
    expect(result).toHaveLength(0)
  })
})

describe('filterSpellsByLevel', () => {
  it('returns all spells when level is null', () => {
    const result = filterSpellsByLevel(mockSpells, null)
    expect(result).toHaveLength(5)
  })

  it('filters cantrips (level 0)', () => {
    const result = filterSpellsByLevel(mockSpells, 0)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Fire Bolt')
  })

  it('filters by specific level', () => {
    const result = filterSpellsByLevel(mockSpells, 1)
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.name)).toContain('Cure Wounds')
    expect(result.map((s) => s.name)).toContain('Healing Word')
  })
})

describe('filterSpellsByMaxLevel', () => {
  it('filters spells up to max level', () => {
    const result = filterSpellsByMaxLevel(mockSpells, 1)
    expect(result).toHaveLength(3)
    expect(result.every((s) => s.level <= 1)).toBe(true)
  })

  it('includes all spells when max is 9', () => {
    const result = filterSpellsByMaxLevel(mockSpells, 9)
    expect(result).toHaveLength(5)
  })
})

describe('filterSpells', () => {
  it('combines search and level filters', () => {
    const result = filterSpells(mockSpells, 'healing', 1)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Healing Word')
  })

  it('applies search only when level is null', () => {
    const result = filterSpells(mockSpells, 'fire', null)
    expect(result).toHaveLength(2)
  })
})

describe('isSpellInList', () => {
  it('returns true when spell is in list', () => {
    const spellList: Spell[] = [mockFullSpell]
    const spellItem: SpellListItem = { index: 'fireball', name: 'Fireball', level: 3, url: '' }
    expect(isSpellInList(spellItem, spellList)).toBe(true)
  })

  it('returns false when spell is not in list', () => {
    const spellList: Spell[] = [mockFullSpell]
    const spellItem: SpellListItem = { index: 'wish', name: 'Wish', level: 9, url: '' }
    expect(isSpellInList(spellItem, spellList)).toBe(false)
  })
})
