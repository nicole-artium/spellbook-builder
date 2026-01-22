export interface FiveEToolsSpellTime {
  number: number
  unit: string
  condition?: string
}

export interface FiveEToolsSpellRange {
  type: string
  distance?: {
    type: string
    amount?: number
  }
}

export interface FiveEToolsSpellDuration {
  type: string
  duration?: {
    type: string
    amount?: number
  }
  concentration?: boolean
}

export interface FiveEToolsSpellComponents {
  v?: boolean
  s?: boolean
  m?: string | boolean | { text: string; cost?: number; consume?: boolean }
}

export interface FiveEToolsSpellEntry {
  type?: string
  name?: string
  entries?: (string | FiveEToolsSpellEntry)[]
}

export interface FiveEToolsSpell {
  name: string
  source: string
  page?: number
  level: number
  school: string
  time: FiveEToolsSpellTime[]
  range: FiveEToolsSpellRange
  components: FiveEToolsSpellComponents
  duration: FiveEToolsSpellDuration[]
  meta?: { ritual?: boolean }
  entries: (string | FiveEToolsSpellEntry)[]
  entriesHigherLevel?: FiveEToolsSpellEntry[]
}

export interface FiveEToolsSpellFile {
  spell: FiveEToolsSpell[]
}

export interface SpellClassLookupEntry {
  class?: Record<string, Record<string, boolean | { definedInSources?: string[] }>>
  subclass?: Record<string, Record<string, Record<string, unknown>>>
}

// Using 'unknown' for the deeply nested lookup structure to avoid complex typing
export type SpellClassLookup = Record<string, Record<string, unknown>>
