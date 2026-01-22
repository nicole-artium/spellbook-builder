import type { Spell, SpellListItem, ClassInfo, SubclassInfo } from '../../types'
import type {
  FiveEToolsSpell,
  FiveEToolsSpellFile,
  FiveEToolsSpellEntry,
} from './fiveEToolsTypes'
import spellsData from '../../data/spells-xphb.json'
import classLookupData from '../../data/spell-class-lookup.json'
import subclassData from '../../data/subclasses-xphb.json'

const spellFile = spellsData as FiveEToolsSpellFile
const classLookup = classLookupData as Record<string, Record<string, unknown>>

interface SubclassEntry {
  name: string
  shortName: string
  className: string
}
const subclassMap = subclassData as Record<string, SubclassEntry[]>

const SCHOOL_MAP: Record<string, string> = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  V: 'Evocation',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
}

function formatTime(time: FiveEToolsSpell['time']): string {
  if (!time.length) return 'Unknown'
  const t = time[0]
  const unit = t.unit === 'bonus' ? 'bonus action' : t.unit
  return t.number === 1 ? `1 ${unit}` : `${t.number} ${unit}s`
}

function formatRange(range: FiveEToolsSpell['range']): string {
  if (range.type === 'point') {
    if (!range.distance) return 'Unknown'
    if (range.distance.type === 'self') return 'Self'
    if (range.distance.type === 'touch') return 'Touch'
    if (range.distance.type === 'sight') return 'Sight'
    if (range.distance.type === 'unlimited') return 'Unlimited'
    return `${range.distance.amount} ${range.distance.type}`
  }
  if (range.type === 'special') return 'Special'
  return range.type
}

function formatDuration(durations: FiveEToolsSpell['duration']): string {
  if (!durations.length) return 'Unknown'
  const d = durations[0]
  if (d.type === 'instant') return 'Instantaneous'
  if (d.type === 'permanent') return 'Until dispelled'
  if (d.type === 'special') return 'Special'
  if (d.type === 'timed' && d.duration) {
    const amount = d.duration.amount ?? 1
    const unit = d.duration.type
    const prefix = d.concentration ? 'Concentration, up to ' : ''
    return `${prefix}${amount} ${unit}${amount > 1 ? 's' : ''}`
  }
  return d.type
}

function getMaterialDescription(components: FiveEToolsSpell['components']): string | undefined {
  if (!components.m) return undefined
  if (typeof components.m === 'string') return components.m
  if (typeof components.m === 'object' && 'text' in components.m) return components.m.text
  return undefined
}

function stripTags(text: string): string {
  return text
    .replace(/\{@\w+\s+([^|}]+)(?:\|[^}]*)?\}/g, '$1')
    .replace(/\{@\w+\s+([^}]+)\}/g, '$1')
}

function flattenEntries(entries: (string | FiveEToolsSpellEntry)[]): string {
  return entries
    .map((entry) => {
      if (typeof entry === 'string') return stripTags(entry)
      if (entry.entries) {
        const name = entry.name ? `**${entry.name}.** ` : ''
        return name + flattenEntries(entry.entries)
      }
      return ''
    })
    .filter(Boolean)
    .join('\n\n')
}

function toSpellId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function transformSpell(spell: FiveEToolsSpell): Spell {
  const hasConcentration = spell.duration.some((d) => d.concentration === true)

  return {
    id: toSpellId(spell.name),
    name: spell.name,
    level: spell.level,
    school: SCHOOL_MAP[spell.school] ?? spell.school,
    castingTime: formatTime(spell.time),
    range: formatRange(spell.range),
    duration: formatDuration(spell.duration),
    components: {
      verbal: spell.components.v === true,
      somatic: spell.components.s === true,
      material: spell.components.m !== undefined && spell.components.m !== false,
      materialDescription: getMaterialDescription(spell.components),
    },
    description: flattenEntries(spell.entries),
    higherLevels: spell.entriesHigherLevel
      ? flattenEntries(spell.entriesHigherLevel)
      : undefined,
    ritual: spell.meta?.ritual === true,
    concentration: hasConcentration,
  }
}

const allSpells: Spell[] = spellFile.spell.map(transformSpell)
const spellMap = new Map(allSpells.map((s) => [s.id, s]))

interface ClassLookupEntry {
  class?: Record<string, Record<string, unknown>>
  subclass?: Record<string, Record<string, Record<string, unknown>>>
}

function buildClassSpellMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const xphbLookup = (classLookup['xphb'] ?? {}) as Record<string, ClassLookupEntry>

  for (const [spellNameLower, entry] of Object.entries(xphbLookup)) {
    const xphbClasses = entry.class?.['XPHB'] ?? {}
    for (const className of Object.keys(xphbClasses)) {
      const classKey = className.toLowerCase()
      if (!map.has(classKey)) map.set(classKey, new Set())
      map.get(classKey)!.add(spellNameLower)
    }
  }

  return map
}

function buildSubclassSpellMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const xphbLookup = (classLookup['xphb'] ?? {}) as Record<string, ClassLookupEntry>

  for (const [spellNameLower, entry] of Object.entries(xphbLookup)) {
    const subclassesByClass = entry.subclass?.['XPHB'] ?? {}
    for (const [className, sourceMap] of Object.entries(subclassesByClass)) {
      const xphbSubclasses = (sourceMap as Record<string, Record<string, unknown>>)?.['XPHB'] ?? {}
      for (const subclassShortName of Object.keys(xphbSubclasses)) {
        const key = `${className.toLowerCase()}:${subclassShortName.toLowerCase()}`
        if (!map.has(key)) map.set(key, new Set())
        map.get(key)!.add(spellNameLower)
      }
    }
  }

  return map
}

const classSpellMap = buildClassSpellMap()
const subclassSpellMap = buildSubclassSpellMap()

export async function getAllSpells(): Promise<SpellListItem[]> {
  return allSpells.map((spell) => ({
    index: spell.id,
    name: spell.name,
    level: spell.level,
    url: '',
  }))
}

export async function getSpellDetails(spellId: string): Promise<Spell> {
  const spell = spellMap.get(spellId)
  if (!spell) throw new Error(`Spell not found: ${spellId}`)
  return spell
}

export async function getSpellsByClass(classKey: string): Promise<SpellListItem[]> {
  const normalizedClass = classKey.toLowerCase().replace(/^[^_]+_/, '')
  const spellNames = classSpellMap.get(normalizedClass) ?? new Set()

  return allSpells
    .filter((spell) => spellNames.has(spell.name.toLowerCase()))
    .map((spell) => ({
      index: spell.id,
      name: spell.name,
      level: spell.level,
      url: '',
    }))
}

export async function getSpellsBySubclass(classKey: string, subclassKey: string): Promise<SpellListItem[]> {
  const normalizedClass = classKey.toLowerCase().replace(/^[^_]+_/, '')
  const normalizedSubclass = subclassKey.toLowerCase().replace(/^[^-]+-/, '').replace(/-/g, ' ')

  // Find matching subclass entry to get the correct shortName
  const subclasses = subclassMap[normalizedClass] ?? []
  const matchingSubclass = subclasses.find(
    (sc) => sc.shortName.toLowerCase() === normalizedSubclass ||
            sc.name.toLowerCase().includes(normalizedSubclass)
  )

  if (!matchingSubclass) return []

  const key = `${normalizedClass}:${matchingSubclass.shortName.toLowerCase()}`
  const spellNames = subclassSpellMap.get(key) ?? new Set()

  return allSpells
    .filter((spell) => spellNames.has(spell.name.toLowerCase()))
    .map((spell) => ({
      index: spell.id,
      name: spell.name,
      level: spell.level,
      url: '',
    }))
}

export async function getMultipleSpellDetails(spellIds: string[]): Promise<Spell[]> {
  return spellIds.map((id) => {
    const spell = spellMap.get(id)
    if (!spell) throw new Error(`Spell not found: ${id}`)
    return spell
  })
}

const CLASS_LIST: ClassInfo[] = [
  { index: 'bard', name: 'Bard', url: '' },
  { index: 'cleric', name: 'Cleric', url: '' },
  { index: 'druid', name: 'Druid', url: '' },
  { index: 'paladin', name: 'Paladin', url: '' },
  { index: 'ranger', name: 'Ranger', url: '' },
  { index: 'sorcerer', name: 'Sorcerer', url: '' },
  { index: 'warlock', name: 'Warlock', url: '' },
  { index: 'wizard', name: 'Wizard', url: '' },
]

export async function getAllClasses(): Promise<ClassInfo[]> {
  return CLASS_LIST
}

export async function getSubclassesByClass(classKey: string): Promise<SubclassInfo[]> {
  const normalizedClass = classKey.toLowerCase().replace(/^[^_]+_/, '')
  const subclasses = subclassMap[normalizedClass] ?? []

  return subclasses.map((sc) => ({
    index: sc.shortName.toLowerCase().replace(/\s+/g, '-'),
    name: sc.name,
    url: '',
  }))
}
