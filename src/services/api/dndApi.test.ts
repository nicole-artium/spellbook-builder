import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAllSpells, getSpellDetails, getAllClasses, getSpellsByClass, getSubclassesByClass } from './dndApi'

const mockSpellListResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { key: 'srd-2024_fireball', name: 'Fireball', level: 3, url: 'https://api.open5e.com/v2/spells/srd-2024_fireball/' },
    { key: 'srd-2024_wish', name: 'Wish', level: 9, url: 'https://api.open5e.com/v2/spells/srd-2024_wish/' },
  ],
}

const mockSpellDetailResponse = {
  key: 'srd-2024_fireball',
  name: 'Fireball',
  level: 3,
  school: { name: 'Evocation', key: 'evocation' },
  casting_time: 'action',
  range: '150 feet',
  duration: 'Instantaneous',
  verbal: true,
  somatic: true,
  material: true,
  material_specified: 'A tiny ball of bat guano and sulfur',
  desc: 'A bright streak flashes from your pointing finger.',
  higher_level: 'When you cast this spell using a spell slot of 4th level or higher...',
  ritual: false,
  concentration: false,
}

const mockClassListResponse = {
  count: 4,
  next: null,
  previous: null,
  results: [
    { key: 'srd-2024_wizard', name: 'Wizard', url: 'https://api.open5e.com/v2/classes/srd-2024_wizard/', subclass_of: null },
    { key: 'srd-2024_cleric', name: 'Cleric', url: 'https://api.open5e.com/v2/classes/srd-2024_cleric/', subclass_of: null },
    { key: 'srd-2024_evoker', name: 'Evoker', url: 'https://api.open5e.com/v2/classes/srd-2024_evoker/', subclass_of: { key: 'srd-2024_wizard', name: 'Wizard', url: 'https://api.open5e.com/v2/classes/srd-2024_wizard/' } },
    { key: 'srd-2024_life-domain', name: 'Life Domain', url: 'https://api.open5e.com/v2/classes/srd-2024_life-domain/', subclass_of: { key: 'srd-2024_cleric', name: 'Cleric', url: 'https://api.open5e.com/v2/classes/srd-2024_cleric/' } },
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

      expect(fetch).toHaveBeenCalledWith('https://api.open5e.com/v2/spells/?document__key=srd-2024&limit=400')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        index: 'srd-2024_fireball',
        name: 'Fireball',
        level: 3,
        url: 'https://api.open5e.com/v2/spells/srd-2024_fireball/',
      })
    })

    it('handles pagination', async () => {
      const page1 = {
        count: 3,
        next: 'https://api.open5e.com/v2/spells/?document__key=srd-2024&page=2',
        previous: null,
        results: [{ key: 'srd-2024_fireball', name: 'Fireball', level: 3, url: '' }],
      }
      const page2 = {
        count: 3,
        next: null,
        previous: 'https://api.open5e.com/v2/spells/?document__key=srd-2024',
        results: [
          { key: 'srd-2024_wish', name: 'Wish', level: 9, url: '' },
          { key: 'srd-2024_aid', name: 'Aid', level: 2, url: '' },
        ],
      }

      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(page1) } as Response)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(page2) } as Response)

      const result = await getAllSpells()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(3)
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

      const result = await getSpellDetails('srd-2024_fireball')

      expect(fetch).toHaveBeenCalledWith('https://api.open5e.com/v2/spells/srd-2024_fireball/')
      expect(result.id).toBe('srd-2024_fireball')
      expect(result.name).toBe('Fireball')
      expect(result.school).toBe('Evocation')
      expect(result.castingTime).toBe('1 action')
      expect(result.components.verbal).toBe(true)
      expect(result.components.somatic).toBe(true)
      expect(result.components.material).toBe(true)
      expect(result.components.materialDescription).toBe('A tiny ball of bat guano and sulfur')
    })

    it('handles legacy spell keys without prefix', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpellDetailResponse),
      } as Response)

      await getSpellDetails('fireball')

      expect(fetch).toHaveBeenCalledWith('https://api.open5e.com/v2/spells/srd-2024_fireball/')
    })

    it('transforms casting time formats', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockSpellDetailResponse, casting_time: 'bonus_action' }),
      } as Response)

      const result = await getSpellDetails('test')

      expect(result.castingTime).toBe('1 bonus action')
    })

    it('handles spells without material components', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockSpellDetailResponse, material: false, material_specified: null }),
      } as Response)

      const result = await getSpellDetails('test')

      expect(result.components.material).toBe(false)
      expect(result.components.materialDescription).toBeUndefined()
    })
  })

  describe('getAllClasses', () => {
    it('fetches and filters to base classes only', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClassListResponse),
      } as Response)

      const result = await getAllClasses()

      expect(result).toHaveLength(2)
      expect(result.map((c) => c.name)).toEqual(['Wizard', 'Cleric'])
    })
  })

  describe('getSubclassesByClass', () => {
    it('returns subclasses for a given class', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClassListResponse),
      } as Response)

      const result = await getSubclassesByClass('srd-2024_wizard')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Evoker')
    })

    it('handles class key without prefix', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClassListResponse),
      } as Response)

      const result = await getSubclassesByClass('wizard')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Evoker')
    })
  })

  describe('getSpellsByClass', () => {
    it('fetches spells for a specific class', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpellListResponse),
      } as Response)

      const result = await getSpellsByClass('wizard')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.open5e.com/v2/spells/?document__key=srd-2024&classes__key=srd-2024_wizard&limit=400'
      )
      expect(result).toHaveLength(2)
    })
  })
})
