export function sortByLevelThenAlpha<T extends { level: number; name: string }>(spells: T[]): T[] {
  return [...spells].sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level
    }
    return a.name.localeCompare(b.name)
  })
}

export function sortAlphabetically<T extends { name: string }>(spells: T[]): T[] {
  return [...spells].sort((a, b) => a.name.localeCompare(b.name))
}

export function groupSpellsByLevel<T extends { level: number }>(spells: T[]): Map<number, T[]> {
  const groups = new Map<number, T[]>()
  for (const spell of spells) {
    const existing = groups.get(spell.level) || []
    groups.set(spell.level, [...existing, spell])
  }
  return groups
}
