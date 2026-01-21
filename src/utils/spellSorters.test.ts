import { describe, it, expect } from 'vitest'
import { sortByLevelThenAlpha, sortAlphabetically, groupSpellsByLevel } from './spellSorters'

const mockSpells = [
  { name: 'Wish', level: 9 },
  { name: 'Fireball', level: 3 },
  { name: 'Fire Bolt', level: 0 },
  { name: 'Acid Splash', level: 0 },
  { name: 'Cure Wounds', level: 1 },
  { name: 'Aid', level: 2 },
]

describe('sortByLevelThenAlpha', () => {
  it('sorts by level first', () => {
    const result = sortByLevelThenAlpha(mockSpells)
    expect(result[0].level).toBe(0)
    expect(result[result.length - 1].level).toBe(9)
  })

  it('sorts alphabetically within same level', () => {
    const result = sortByLevelThenAlpha(mockSpells)
    const cantrips = result.filter((s) => s.level === 0)
    expect(cantrips[0].name).toBe('Acid Splash')
    expect(cantrips[1].name).toBe('Fire Bolt')
  })

  it('does not mutate original array', () => {
    const original = [...mockSpells]
    sortByLevelThenAlpha(mockSpells)
    expect(mockSpells).toEqual(original)
  })

  it('returns correct order', () => {
    const result = sortByLevelThenAlpha(mockSpells)
    expect(result.map((s) => s.name)).toEqual([
      'Acid Splash',
      'Fire Bolt',
      'Cure Wounds',
      'Aid',
      'Fireball',
      'Wish',
    ])
  })
})

describe('sortAlphabetically', () => {
  it('sorts by name', () => {
    const result = sortAlphabetically(mockSpells)
    expect(result[0].name).toBe('Acid Splash')
    expect(result[result.length - 1].name).toBe('Wish')
  })

  it('does not mutate original array', () => {
    const original = [...mockSpells]
    sortAlphabetically(mockSpells)
    expect(mockSpells).toEqual(original)
  })
})

describe('groupSpellsByLevel', () => {
  it('groups spells by level', () => {
    const result = groupSpellsByLevel(mockSpells)
    expect(result.get(0)).toHaveLength(2)
    expect(result.get(1)).toHaveLength(1)
    expect(result.get(9)).toHaveLength(1)
  })

  it('returns map with correct keys', () => {
    const result = groupSpellsByLevel(mockSpells)
    expect(Array.from(result.keys()).sort()).toEqual([0, 1, 2, 3, 9])
  })

  it('handles empty array', () => {
    const result = groupSpellsByLevel([])
    expect(result.size).toBe(0)
  })
})
