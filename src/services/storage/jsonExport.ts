import type { Character, Spell } from '../../types'

export function exportCharacter(character: Character): void {
  const json = JSON.stringify(character, null, 2)
  downloadJson(json, `character_${character.id}.json`)
}

export function exportSpells(spells: Spell[]): void {
  const json = JSON.stringify(spells, null, 2)
  const timestamp = new Date().toISOString().split('T')[0]
  downloadJson(json, `spells_${timestamp}.json`)
}

export function exportSpellbook(character: Character, spells: Spell[]): void {
  exportCharacter(character)
  exportSpells(spells)
}

function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importCharacter(file: File): Promise<Character> {
  const text = await file.text()
  const data = JSON.parse(text)
  validateCharacter(data)
  return data as Character
}

export async function importSpells(file: File): Promise<Spell[]> {
  const text = await file.text()
  const data = JSON.parse(text)
  if (!Array.isArray(data)) {
    throw new Error('Invalid spells file: expected an array')
  }
  data.forEach(validateSpell)
  return data as Spell[]
}

function validateCharacter(data: unknown): asserts data is Character {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid character data')
  }
  const char = data as Record<string, unknown>
  if (typeof char.id !== 'string') throw new Error('Character missing id')
  if (typeof char.className !== 'string') throw new Error('Character missing className')
  if (typeof char.level !== 'number') throw new Error('Character missing level')
}

function validateSpell(data: unknown, index: number): asserts data is Spell {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid spell at index ${index}`)
  }
  const spell = data as Record<string, unknown>
  const required = ['id', 'name', 'level', 'school', 'castingTime', 'range', 'duration', 'description']
  for (const field of required) {
    if (spell[field] === undefined) {
      throw new Error(`Spell at index ${index} missing required field: ${field}`)
    }
  }
}
