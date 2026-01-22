import { describe, it, expect } from 'vitest'
import { getAllSpells, getSpellDetails, getAllClasses, getSpellsByClass, getSpellsBySubclass, getSubclassesByClass, getMultipleSpellDetails } from './dndApi'

describe('Static Spell Provider', () => {
  describe('getAllSpells', () => {
    it('returns all 391 spells from the 2024 PHB', async () => {
      const result = await getAllSpells()

      expect(result.length).toBe(391)
    })

    it('returns spells with correct structure', async () => {
      const result = await getAllSpells()
      const fireball = result.find((s) => s.name === 'Fireball')

      expect(fireball).toBeDefined()
      expect(fireball).toEqual({
        index: 'fireball',
        name: 'Fireball',
        level: 3,
        url: '',
      })
    })

    it('includes previously missing spells like Blinding Smite', async () => {
      const result = await getAllSpells()

      expect(result.find((s) => s.name === 'Blinding Smite')).toBeDefined()
      expect(result.find((s) => s.name === 'Aura of Vitality')).toBeDefined()
    })
  })

  describe('getSpellDetails', () => {
    it('returns full spell details for Fireball', async () => {
      const result = await getSpellDetails('fireball')

      expect(result.id).toBe('fireball')
      expect(result.name).toBe('Fireball')
      expect(result.level).toBe(3)
      expect(result.school).toBe('Evocation')
      expect(result.castingTime).toBe('1 action')
      expect(result.range).toBe('150 feet')
      expect(result.components.verbal).toBe(true)
      expect(result.components.somatic).toBe(true)
      expect(result.components.material).toBe(true)
      expect(result.ritual).toBe(false)
      expect(result.concentration).toBe(false)
    })

    it('returns full spell details for Blinding Smite', async () => {
      const result = await getSpellDetails('blinding-smite')

      expect(result.id).toBe('blinding-smite')
      expect(result.name).toBe('Blinding Smite')
      expect(result.level).toBe(3)
      expect(result.school).toBe('Evocation')
      expect(result.castingTime).toBe('1 bonus action')
    })

    it('handles ritual spells correctly', async () => {
      const result = await getSpellDetails('alarm')

      expect(result.ritual).toBe(true)
    })

    it('handles concentration spells correctly', async () => {
      const result = await getSpellDetails('aura-of-vitality')

      expect(result.concentration).toBe(true)
    })

    it('throws for non-existent spell', async () => {
      await expect(getSpellDetails('not-a-real-spell')).rejects.toThrow('Spell not found')
    })
  })

  describe('getSpellsByClass', () => {
    it('returns Paladin spells including Blinding Smite', async () => {
      const result = await getSpellsByClass('paladin')

      expect(result.length).toBeGreaterThan(40)
      expect(result.find((s) => s.name === 'Blinding Smite')).toBeDefined()
      expect(result.find((s) => s.name === 'Aura of Vitality')).toBeDefined()
    })

    it('returns Wizard spells', async () => {
      const result = await getSpellsByClass('wizard')

      expect(result.length).toBeGreaterThan(200)
      expect(result.find((s) => s.name === 'Fireball')).toBeDefined()
      expect(result.find((s) => s.name === 'Wish')).toBeDefined()
    })

    it('handles class key with prefix', async () => {
      const result = await getSpellsByClass('srd-2024_paladin')

      expect(result.find((s) => s.name === 'Blinding Smite')).toBeDefined()
    })
  })

  describe('getSpellsBySubclass', () => {
    it('returns Oath of Glory spells including Guiding Bolt', async () => {
      const result = await getSpellsBySubclass('paladin', 'glory')

      expect(result.length).toBe(10)
      expect(result.find((s) => s.name === 'Guiding Bolt')).toBeDefined()
      expect(result.find((s) => s.name === 'Heroism')).toBeDefined()
      expect(result.find((s) => s.name === 'Haste')).toBeDefined()
    })

    it('returns Oath of Devotion spells including Shield of Faith', async () => {
      const result = await getSpellsBySubclass('paladin', 'devotion')

      expect(result.length).toBe(10)
      expect(result.find((s) => s.name === 'Shield of Faith')).toBeDefined()
      expect(result.find((s) => s.name === 'Zone of Truth')).toBeDefined()
      expect(result.find((s) => s.name === 'Beacon of Hope')).toBeDefined()
    })

    it('returns Evoker spells', async () => {
      const result = await getSpellsBySubclass('wizard', 'evoker')

      expect(result.length).toBeGreaterThan(0)
    })

    it('returns empty array for non-existent subclass', async () => {
      const result = await getSpellsBySubclass('paladin', 'nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getAllClasses', () => {
    it('returns all caster classes', async () => {
      const result = await getAllClasses()

      expect(result.length).toBe(8)
      expect(result.map((c) => c.name)).toContain('Paladin')
      expect(result.map((c) => c.name)).toContain('Wizard')
      expect(result.map((c) => c.name)).toContain('Cleric')
    })
  })

  describe('getSubclassesByClass', () => {
    it('returns subclasses for Paladin', async () => {
      const result = await getSubclassesByClass('paladin')

      expect(result.length).toBe(4)
      expect(result.map((s) => s.name)).toContain('Oath of Devotion')
      expect(result.map((s) => s.name)).toContain('Oath of Vengeance')
    })

    it('returns subclasses for Wizard', async () => {
      const result = await getSubclassesByClass('wizard')

      expect(result.length).toBe(4)
      expect(result.map((s) => s.name)).toContain('Evoker')
      expect(result.map((s) => s.name)).toContain('Abjurer')
    })

    it('handles class key with prefix', async () => {
      const result = await getSubclassesByClass('srd-2024_paladin')

      expect(result.length).toBe(4)
    })
  })

  describe('getMultipleSpellDetails', () => {
    it('returns multiple spells at once', async () => {
      const result = await getMultipleSpellDetails(['fireball', 'blinding-smite', 'alarm'])

      expect(result.length).toBe(3)
      expect(result.map((s) => s.name)).toEqual(['Fireball', 'Blinding Smite', 'Alarm'])
    })
  })
})
