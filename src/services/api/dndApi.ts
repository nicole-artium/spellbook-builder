import type { Spell, SpellListItem, ClassInfo, SubclassInfo } from '../../types'

const BASE_URL = 'https://api.open5e.com/v2'
const DOCUMENT_KEY = 'srd-2024'
const PAGE_LIMIT = 400

interface Open5ePaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface Open5eSpellListItem {
  key: string
  name: string
  level: number
  url: string
}

interface Open5eSpellResponse {
  key: string
  name: string
  level: number
  school: { name: string; key: string }
  casting_time: string
  range: string
  duration: string
  verbal: boolean
  somatic: boolean
  material: boolean
  material_specified: string | null
  desc: string
  higher_level: string | null
  ritual: boolean
  concentration: boolean
}

interface Open5eClassResponse {
  key: string
  name: string
  url: string
  subclass_of: { key: string; name: string; url: string } | null
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

async function fetchAllPages<T>(baseUrl: string): Promise<T[]> {
  const results: T[] = []
  let url: string | null = baseUrl

  while (url) {
    const response: Open5ePaginatedResponse<T> = await fetchJson<Open5ePaginatedResponse<T>>(url)
    results.push(...response.results)
    url = response.next
  }

  return results
}

function formatCastingTime(time: string): string {
  const map: Record<string, string> = {
    action: '1 action',
    bonus_action: '1 bonus action',
    reaction: '1 reaction',
  }
  return map[time] ?? time
}

function transformOpen5eSpell(apiSpell: Open5eSpellResponse): Spell {
  return {
    id: apiSpell.key,
    name: apiSpell.name,
    level: apiSpell.level,
    school: apiSpell.school.name,
    castingTime: formatCastingTime(apiSpell.casting_time),
    range: apiSpell.range,
    duration: apiSpell.duration,
    components: {
      verbal: apiSpell.verbal,
      somatic: apiSpell.somatic,
      material: apiSpell.material,
      materialDescription: apiSpell.material_specified ?? undefined,
    },
    description: apiSpell.desc,
    higherLevels: apiSpell.higher_level ?? undefined,
    ritual: apiSpell.ritual,
    concentration: apiSpell.concentration,
  }
}

export async function getAllSpells(): Promise<SpellListItem[]> {
  const url = `${BASE_URL}/spells/?document__key=${DOCUMENT_KEY}&limit=${PAGE_LIMIT}`
  const spells = await fetchAllPages<Open5eSpellListItem>(url)

  return spells.map((spell) => ({
    index: spell.key,
    name: spell.name,
    level: spell.level,
    url: spell.url,
  }))
}

const spellCache = new Map<string, Spell>()

export async function getSpellDetails(spellKey: string): Promise<Spell> {
  const key = spellKey.startsWith(`${DOCUMENT_KEY}_`) ? spellKey : `${DOCUMENT_KEY}_${spellKey}`

  const cached = spellCache.get(key)
  if (cached) return cached

  const data = await fetchJson<Open5eSpellResponse>(`${BASE_URL}/spells/${key}/`)
  const spell = transformOpen5eSpell(data)
  spellCache.set(key, spell)
  return spell
}

export async function getSpellsByClass(classKey: string): Promise<SpellListItem[]> {
  const fullClassKey = classKey.startsWith(`${DOCUMENT_KEY}_`) ? classKey : `${DOCUMENT_KEY}_${classKey}`
  const url = `${BASE_URL}/spells/?document__key=${DOCUMENT_KEY}&classes__key=${fullClassKey}&limit=${PAGE_LIMIT}`
  const spells = await fetchAllPages<Open5eSpellListItem>(url)

  return spells.map((spell) => ({
    index: spell.key,
    name: spell.name,
    level: spell.level,
    url: spell.url,
  }))
}

export async function getAllClasses(): Promise<ClassInfo[]> {
  const url = `${BASE_URL}/classes/?document__key=${DOCUMENT_KEY}`
  const allClasses = await fetchAllPages<Open5eClassResponse>(url)

  return allClasses
    .filter((cls) => cls.subclass_of === null)
    .map((cls) => ({
      index: cls.key,
      name: cls.name,
      url: cls.url,
    }))
}

export async function getSubclassesByClass(classKey: string): Promise<SubclassInfo[]> {
  const fullClassKey = classKey.startsWith(`${DOCUMENT_KEY}_`) ? classKey : `${DOCUMENT_KEY}_${classKey}`
  const url = `${BASE_URL}/classes/?document__key=${DOCUMENT_KEY}`
  const allClasses = await fetchAllPages<Open5eClassResponse>(url)

  return allClasses
    .filter((cls) => cls.subclass_of?.key === fullClassKey)
    .map((sub) => ({
      index: sub.key,
      name: sub.name,
      url: sub.url,
    }))
}

export async function getMultipleSpellDetails(spellKeys: string[]): Promise<Spell[]> {
  const promises = spellKeys.map((key) => getSpellDetails(key))
  return Promise.all(promises)
}
