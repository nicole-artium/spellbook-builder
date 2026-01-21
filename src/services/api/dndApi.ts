import type { Spell, SpellListItem, ClassInfo, SubclassInfo } from '../../types'

const BASE_URL = 'https://www.dnd5eapi.co/api'

interface ApiSpellListResponse {
  count: number
  results: Array<{
    index: string
    name: string
    level: number
    url: string
  }>
}

interface ApiSpellResponse {
  index: string
  name: string
  level: number
  school: { name: string }
  casting_time: string
  range: string
  duration: string
  components: string[]
  material?: string
  desc: string[]
  higher_level?: string[]
  ritual: boolean
  concentration: boolean
}

interface ApiClassListResponse {
  count: number
  results: Array<{
    index: string
    name: string
    url: string
  }>
}

interface ApiSubclassListResponse {
  subclasses: Array<{
    index: string
    name: string
    url: string
  }>
}

interface ApiClassSpellsResponse {
  count: number
  results: Array<{
    index: string
    name: string
    level: number
    url: string
  }>
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function getAllSpells(): Promise<SpellListItem[]> {
  const data = await fetchJson<ApiSpellListResponse>(`${BASE_URL}/spells`)
  return data.results.map((spell) => ({
    index: spell.index,
    name: spell.name,
    level: spell.level,
    url: spell.url,
  }))
}

export async function getSpellDetails(spellIndex: string): Promise<Spell> {
  const data = await fetchJson<ApiSpellResponse>(`${BASE_URL}/spells/${spellIndex}`)
  return transformApiSpell(data)
}

export async function getSpellsByClass(classIndex: string): Promise<SpellListItem[]> {
  const data = await fetchJson<ApiClassSpellsResponse>(`${BASE_URL}/classes/${classIndex}/spells`)
  return data.results.map((spell) => ({
    index: spell.index,
    name: spell.name,
    level: spell.level,
    url: spell.url,
  }))
}

export async function getAllClasses(): Promise<ClassInfo[]> {
  const data = await fetchJson<ApiClassListResponse>(`${BASE_URL}/classes`)
  return data.results.map((cls) => ({
    index: cls.index,
    name: cls.name,
    url: cls.url,
  }))
}

export async function getSubclassesByClass(classIndex: string): Promise<SubclassInfo[]> {
  const data = await fetchJson<ApiSubclassListResponse>(`${BASE_URL}/classes/${classIndex}`)
  return data.subclasses.map((sub) => ({
    index: sub.index,
    name: sub.name,
    url: sub.url,
  }))
}

export async function getMultipleSpellDetails(spellIndices: string[]): Promise<Spell[]> {
  const promises = spellIndices.map((index) => getSpellDetails(index))
  return Promise.all(promises)
}

function transformApiSpell(apiSpell: ApiSpellResponse): Spell {
  const hasVerbal = apiSpell.components.includes('V')
  const hasSomatic = apiSpell.components.includes('S')
  const hasMaterial = apiSpell.components.includes('M')

  return {
    id: apiSpell.index,
    name: apiSpell.name,
    level: apiSpell.level,
    school: apiSpell.school.name,
    castingTime: apiSpell.casting_time,
    range: apiSpell.range,
    duration: apiSpell.duration,
    components: {
      verbal: hasVerbal,
      somatic: hasSomatic,
      material: hasMaterial,
      materialDescription: apiSpell.material,
    },
    description: apiSpell.desc.join('\n\n'),
    higherLevels: apiSpell.higher_level?.join('\n\n'),
    ritual: apiSpell.ritual,
    concentration: apiSpell.concentration,
  }
}
