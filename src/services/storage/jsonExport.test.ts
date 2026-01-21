import { describe, it, expect } from 'vitest'
import { importCharacter, importSpells } from './jsonExport'
import type { Character, Spell } from '../../types'

const validCharacter: Character = {
  id: 'char-123',
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

function createMockFile(content: unknown): File {
  const json = JSON.stringify(content)
  const blob = new Blob([json], { type: 'application/json' })
  const file = new File([blob], 'test.json', { type: 'application/json' })
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(json),
  })
  return file
}

describe('importCharacter', () => {
  it('imports valid character data', async () => {
    const file = createMockFile(validCharacter)
    const result = await importCharacter(file)
    expect(result).toEqual(validCharacter)
  })

  it('throws on missing id', async () => {
    const file = createMockFile({ className: 'wizard', level: 5 })
    await expect(importCharacter(file)).rejects.toThrow('Character missing id')
  })

  it('throws on missing className', async () => {
    const file = createMockFile({ id: '123', level: 5 })
    await expect(importCharacter(file)).rejects.toThrow('Character missing className')
  })

  it('throws on missing level', async () => {
    const file = createMockFile({ id: '123', className: 'wizard' })
    await expect(importCharacter(file)).rejects.toThrow('Character missing level')
  })

  it('throws on invalid JSON', async () => {
    const blob = new Blob(['not json'], { type: 'application/json' })
    const file = new File([blob], 'test.json')
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve('not json'),
    })
    await expect(importCharacter(file)).rejects.toThrow()
  })
})

describe('importSpells', () => {
  it('imports valid spells array', async () => {
    const file = createMockFile([validSpell])
    const result = await importSpells(file)
    expect(result).toEqual([validSpell])
  })

  it('imports multiple spells', async () => {
    const spells = [validSpell, { ...validSpell, id: 'ice-storm', name: 'Ice Storm' }]
    const file = createMockFile(spells)
    const result = await importSpells(file)
    expect(result).toHaveLength(2)
  })

  it('throws on non-array data', async () => {
    const file = createMockFile(validSpell)
    await expect(importSpells(file)).rejects.toThrow('expected an array')
  })

  it('throws on missing required spell field', async () => {
    const invalidSpell = { id: 'test', name: 'Test' }
    const file = createMockFile([invalidSpell])
    await expect(importSpells(file)).rejects.toThrow('missing required field')
  })

  it('imports empty array', async () => {
    const file = createMockFile([])
    const result = await importSpells(file)
    expect(result).toEqual([])
  })
})
