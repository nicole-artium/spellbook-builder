import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAllSpells, getSpellDetails, getAllClasses, getSpellsByClass } from './dndApi'

const mockSpellListResponse = {
  count: 2,
  results: [
    { index: 'fireball', name: 'Fireball', level: 3, url: '/api/spells/fireball' },
    { index: 'wish', name: 'Wish', level: 9, url: '/api/spells/wish' },
  ],
}

const mockSpellDetailResponse = {
  index: 'fireball',
  name: 'Fireball',
  level: 3,
  school: { name: 'Evocation' },
  casting_time: '1 action',
  range: '150 feet',
  duration: 'Instantaneous',
  components: ['V', 'S', 'M'],
  material: 'A tiny ball of bat guano and sulfur',
  desc: ['A bright streak flashes from your pointing finger.'],
  higher_level: ['When you cast this spell using a spell slot of 4th level or higher...'],
  ritual: false,
  concentration: false,
}

const mockClassListResponse = {
  count: 2,
  results: [
    { index: 'wizard', name: 'Wizard', url: '/api/classes/wizard' },
    { index: 'cleric', name: 'Cleric', url: '/api/classes/cleric' },
  ],
}

describe('dndApi', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAllSpells', () => {
    it('fetches and transforms spell list', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpellListResponse),
      } as Response)

      const result = await getAllSpells()

      expect(fetch).toHaveBeenCalledWith('https://www.dnd5eapi.co/api/spells')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        index: 'fireball',
        name: 'Fireball',
        level: 3,
        url: '/api/spells/fireball',
      })
    })

    it('throws on API error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(getAllSpells()).rejects.toThrow('API request failed')
    })
  })

  describe('getSpellDetails', () => {
    it('fetches and transforms spell details', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpellDetailResponse),
      } as Response)

      const result = await getSpellDetails('fireball')

      expect(fetch).toHaveBeenCalledWith('https://www.dnd5eapi.co/api/spells/fireball')
      expect(result.id).toBe('fireball')
      expect(result.name).toBe('Fireball')
      expect(result.school).toBe('Evocation')
      expect(result.components.verbal).toBe(true)
      expect(result.components.somatic).toBe(true)
      expect(result.components.material).toBe(true)
      expect(result.components.materialDescription).toBe('A tiny ball of bat guano and sulfur')
    })

    it('handles spells without material components', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockSpellDetailResponse, components: ['V', 'S'] }),
      } as Response)

      const result = await getSpellDetails('test')

      expect(result.components.material).toBe(false)
    })
  })

  describe('getAllClasses', () => {
    it('fetches and transforms class list', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClassListResponse),
      } as Response)

      const result = await getAllClasses()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Wizard')
    })
  })

  describe('getSpellsByClass', () => {
    it('fetches spells for a specific class', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpellListResponse),
      } as Response)

      const result = await getSpellsByClass('wizard')

      expect(fetch).toHaveBeenCalledWith('https://www.dnd5eapi.co/api/classes/wizard/spells')
      expect(result).toHaveLength(2)
    })
  })
})
