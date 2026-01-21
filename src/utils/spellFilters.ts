import type { SpellListItem, Spell, SpellLevel } from '../types'

export function filterSpellsBySearch<T extends { name: string }>(
  spells: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) {
    return spells
  }
  const term = searchTerm.toLowerCase()
  return spells.filter((spell) => spell.name.toLowerCase().includes(term))
}

export function filterSpellsByLevel<T extends { level: number }>(
  spells: T[],
  level: SpellLevel | null
): T[] {
  if (level === null) {
    return spells
  }
  return spells.filter((spell) => spell.level === level)
}

export function filterSpellsByMaxLevel<T extends { level: number }>(
  spells: T[],
  maxLevel: SpellLevel
): T[] {
  return spells.filter((spell) => spell.level <= maxLevel)
}

export function filterSpells<T extends { name: string; level: number }>(
  spells: T[],
  searchTerm: string,
  level: SpellLevel | null
): T[] {
  let result = spells
  result = filterSpellsBySearch(result, searchTerm)
  result = filterSpellsByLevel(result, level)
  return result
}

export function isSpellInList(spell: SpellListItem | Spell, spellList: Spell[]): boolean {
  const id = 'id' in spell ? spell.id : spell.index
  return spellList.some((s) => s.id === id)
}
