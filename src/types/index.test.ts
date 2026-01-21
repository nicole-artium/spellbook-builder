import { describe, it, expect } from 'vitest'
import { getMaxSpellLevel } from './index'

describe('getMaxSpellLevel', () => {
  describe('full casters (wizard, cleric, bard, druid, sorcerer)', () => {
    it.each([
      [1, 1], [2, 1],
      [3, 2], [4, 2],
      [5, 3], [6, 3],
      [7, 4], [8, 4],
      [9, 5], [10, 5],
      [11, 6], [12, 6],
      [13, 7], [14, 7],
      [15, 8], [16, 8],
      [17, 9], [18, 9], [19, 9], [20, 9],
    ])('wizard level %i should have max spell level %i', (charLevel, expectedMax) => {
      expect(getMaxSpellLevel('wizard', charLevel)).toBe(expectedMax)
    })

    it('works with prefixed class names', () => {
      expect(getMaxSpellLevel('srd_wizard', 5)).toBe(3)
      expect(getMaxSpellLevel('a5e-ag_cleric', 10)).toBe(5)
    })
  })

  describe('half casters (paladin, ranger)', () => {
    it.each([
      [1, 0], [2, 1], [3, 1], [4, 1],
      [5, 2], [6, 2], [7, 2], [8, 2],
      [9, 3], [10, 3], [11, 3], [12, 3],
      [13, 4], [14, 4], [15, 4], [16, 4],
      [17, 5], [18, 5], [19, 5], [20, 5],
    ])('paladin level %i should have max spell level %i', (charLevel, expectedMax) => {
      expect(getMaxSpellLevel('paladin', charLevel)).toBe(expectedMax)
    })

    it('ranger follows same progression as paladin', () => {
      expect(getMaxSpellLevel('ranger', 10)).toBe(3)
      expect(getMaxSpellLevel('ranger', 13)).toBe(4)
    })

    it('works with prefixed class names', () => {
      expect(getMaxSpellLevel('srd_paladin', 10)).toBe(3)
    })
  })

  describe('third casters (fighter/eldritch knight, rogue/arcane trickster)', () => {
    it.each([
      [1, 0], [2, 0], [3, 1], [4, 1], [5, 1], [6, 1],
      [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2],
      [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3],
      [19, 4], [20, 4],
    ])('fighter level %i should have max spell level %i', (charLevel, expectedMax) => {
      expect(getMaxSpellLevel('fighter', charLevel)).toBe(expectedMax)
    })
  })

  describe('pact casters (warlock)', () => {
    it.each([
      [1, 1], [2, 1],
      [3, 2], [4, 2],
      [5, 3], [6, 3],
      [7, 4], [8, 4],
      [9, 5], [10, 5], [11, 5], [20, 5],
    ])('warlock level %i should have max spell level %i', (charLevel, expectedMax) => {
      expect(getMaxSpellLevel('warlock', charLevel)).toBe(expectedMax)
    })
  })

  describe('non-casters (barbarian, monk)', () => {
    it('returns 0 for non-casters at any level', () => {
      expect(getMaxSpellLevel('barbarian', 1)).toBe(0)
      expect(getMaxSpellLevel('barbarian', 20)).toBe(0)
      expect(getMaxSpellLevel('monk', 10)).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('clamps level below 1 to 1', () => {
      expect(getMaxSpellLevel('wizard', 0)).toBe(1)
      expect(getMaxSpellLevel('wizard', -5)).toBe(1)
    })

    it('clamps level above 20 to 20', () => {
      expect(getMaxSpellLevel('wizard', 25)).toBe(9)
      expect(getMaxSpellLevel('paladin', 30)).toBe(5)
    })

    it('defaults unknown classes to full caster', () => {
      expect(getMaxSpellLevel('artificer', 5)).toBe(3)
    })
  })
})
