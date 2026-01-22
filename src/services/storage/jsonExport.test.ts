import { describe, it, expect } from 'vitest'
import { importUnifiedSpellbook, sanitizeFilename } from './jsonExport'
import type { Character, Spell, UnifiedSpellbook } from '../../types'

const validCharacter: Character = {
  id: 'char-123',
  name: 'Ser Roland',
  className: 'wizard',
  subclass: 'evocation',
  level: 5,
}

const validSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: '1 action',
  range: '150 feet',
  duration: 'Instantaneous',
  components: { verbal: true, somatic: true, material: true },
  description: 'A bright streak flashes...',
  ritual: false,
  concentration: false,
}

const validSpellbook: UnifiedSpellbook = {
  character: validCharacter,
  spells: [validSpell],
}

function createMockFile(content: unknown): File {
  const json = JSON.stringify(content)
  const blob = new Blob([json], { type: 'application/json' })
  const file = new File([blob], 'test.json', { type: 'application/json' })
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(json),
  })
  return file
}

describe('sanitizeFilename', () => {
  it('returns name unchanged when no special chars', () => {
    expect(sanitizeFilename('Ser Roland')).toBe('Ser Roland')
  })

  it('replaces special characters with underscores', () => {
    expect(sanitizeFilename('Ser/Roland')).toBe('Ser_Roland')
    expect(sanitizeFilename('Char:Name')).toBe('Char_Name')
    expect(sanitizeFilename('Bad*?Name')).toBe('Bad__Name')
  })

  it('handles multiple special characters', () => {
    expect(sanitizeFilename('A/B\\C:D*E?F"G<H>I|J')).toBe('A_B_C_D_E_F_G_H_I_J')
  })

  it('returns "spellbook" for empty string', () => {
    expect(sanitizeFilename('')).toBe('spellbook')
  })

  it('returns "spellbook" for whitespace-only string', () => {
    expect(sanitizeFilename('   ')).toBe('spellbook')
  })

  it('trims whitespace', () => {
    expect(sanitizeFilename('  Name  ')).toBe('Name')
  })
})

describe('importUnifiedSpellbook', () => {
  it('imports valid spellbook data', async () => {
    const file = createMockFile(validSpellbook)
    const result = await importUnifiedSpellbook(file)
    expect(result).toEqual(validSpellbook)
  })

  it('imports spellbook with multiple spells', async () => {
    const spellbook: UnifiedSpellbook = {
      character: validCharacter,
      spells: [validSpell, { ...validSpell, id: 'ice-storm', name: 'Ice Storm' }],
    }
    const file = createMockFile(spellbook)
    const result = await importUnifiedSpellbook(file)
    expect(result.spells).toHaveLength(2)
  })

  it('throws on missing character', async () => {
    const file = createMockFile({ spells: [validSpell] })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('missing character data')
  })

  it('throws on missing spells array', async () => {
    const file = createMockFile({ character: validCharacter })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('missing spells array')
  })

  it('throws on character missing id', async () => {
    const file = createMockFile({
      character: { name: 'Test', className: 'wizard', level: 5 },
      spells: [],
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('Character missing id')
  })

  it('throws on character missing name', async () => {
    const file = createMockFile({
      character: { id: '123', className: 'wizard', level: 5 },
      spells: [],
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('Character missing name')
  })

  it('throws on character missing className', async () => {
    const file = createMockFile({
      character: { id: '123', name: 'Test', level: 5 },
      spells: [],
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('Character missing className')
  })

  it('throws on character missing level', async () => {
    const file = createMockFile({
      character: { id: '123', name: 'Test', className: 'wizard' },
      spells: [],
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('Character missing level')
  })

  it('throws on missing required spell field', async () => {
    const invalidSpell = { id: 'test', name: 'Test' }
    const file = createMockFile({
      character: validCharacter,
      spells: [invalidSpell],
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow('missing required field')
  })

  it('imports spellbook with empty spells array', async () => {
    const spellbook: UnifiedSpellbook = {
      character: validCharacter,
      spells: [],
    }
    const file = createMockFile(spellbook)
    const result = await importUnifiedSpellbook(file)
    expect(result.spells).toEqual([])
  })

  it('throws on invalid JSON', async () => {
    const blob = new Blob(['not json'], { type: 'application/json' })
    const file = new File([blob], 'test.json')
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve('not json'),
    })
    await expect(importUnifiedSpellbook(file)).rejects.toThrow()
  })

  it('rejects old character-only format', async () => {
    const file = createMockFile(validCharacter)
    await expect(importUnifiedSpellbook(file)).rejects.toThrow()
  })

  it('rejects old spells-only format', async () => {
    const file = createMockFile([validSpell])
    await expect(importUnifiedSpellbook(file)).rejects.toThrow()
  })
})
