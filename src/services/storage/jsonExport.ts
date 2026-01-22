import type { Character, Spell, UnifiedSpellbook } from '../../types'

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'spellbook'
}

export function exportUnifiedSpellbook(character: Character, spells: Spell[]): void {
  const data: UnifiedSpellbook = { character, spells }
  const json = JSON.stringify(data, null, 2)
  const filename = `${sanitizeFilename(character.name)}_spellbook.json`
  downloadJson(json, filename)
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

export async function importUnifiedSpellbook(file: File): Promise<UnifiedSpellbook> {
  const text = await file.text()
  const data = JSON.parse(text)
  validateUnifiedSpellbook(data)
  return data as UnifiedSpellbook
}

function validateUnifiedSpellbook(data: unknown): asserts data is UnifiedSpellbook {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid spellbook data')
  }
  const spellbook = data as Record<string, unknown>

  if (!spellbook.character || typeof spellbook.character !== 'object') {
    throw new Error('Invalid format: missing character data')
  }
  if (!Array.isArray(spellbook.spells)) {
    throw new Error('Invalid format: missing spells array')
  }

  validateCharacter(spellbook.character)
  spellbook.spells.forEach(validateSpell)
}

function validateCharacter(data: unknown): asserts data is Character {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid character data')
  }
  const char = data as Record<string, unknown>
  if (typeof char.id !== 'string') throw new Error('Character missing id')
  if (typeof char.name !== 'string') throw new Error('Character missing name')
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
