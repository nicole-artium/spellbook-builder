import { useState, useMemo } from 'react'
import { useSpellbook } from '../../context/SpellbookContext'
import { SpellCard } from '../SpellCard/SpellCard'
import { filterSpells, isSpellInList } from '../../utils/spellFilters'
import { sortByLevelThenAlpha } from '../../utils/spellSorters'
import type { SpellLevel } from '../../types'
import { SPELL_LEVEL_NAMES } from '../../types'
import styles from './SpellBrowser.module.css'

interface SpellBrowserProps {
  onAddSpell: (spellIndex: string) => void
  loadingSpells: Set<string>
}

export function SpellBrowser({ onAddSpell, loadingSpells }: SpellBrowserProps) {
  const { state } = useSpellbook()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<SpellLevel | null>(null)

  const filteredSpells = useMemo(() => {
    const filtered = filterSpells(state.availableSpells, search, levelFilter)
    return sortByLevelThenAlpha(filtered)
  }, [state.availableSpells, search, levelFilter])

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Available Spells</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search spells..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={levelFilter ?? ''}
          onChange={(e) => setLevelFilter(e.target.value === '' ? null : (Number(e.target.value) as SpellLevel))}
          className={styles.levelSelect}
        >
          <option value="">All Levels</option>
          {Object.entries(SPELL_LEVEL_NAMES).map(([level, name]) => (
            <option key={level} value={level}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.count}>{filteredSpells.length} spells</div>

      <div className={styles.list}>
        {filteredSpells.map((spell) => {
          const isAdded = isSpellInList(spell, state.selectedSpells)
          const isLoading = loadingSpells.has(spell.index)
          return (
            <SpellCard
              key={spell.index}
              spell={spell}
              onAction={() => onAddSpell(spell.index)}
              actionLabel={isLoading ? '...' : isAdded ? 'Added' : 'Add'}
              actionVariant="add"
              disabled={isAdded || isLoading}
            />
          )
        })}
      </div>
    </div>
  )
}
