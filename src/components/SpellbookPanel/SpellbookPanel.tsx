import { useMemo } from 'react'
import { useSpellbook } from '../../context/SpellbookContext'
import { SpellCard } from '../SpellCard/SpellCard'
import { sortByLevelThenAlpha, groupSpellsByLevel } from '../../utils/spellSorters'
import { SPELL_LEVEL_NAMES, type SpellLevel } from '../../types'
import styles from './SpellbookPanel.module.css'

export function SpellbookPanel() {
  const { state, removeSpell, clearSpellbook } = useSpellbook()

  const sortedSpells = useMemo(
    () => sortByLevelThenAlpha(state.selectedSpells),
    [state.selectedSpells]
  )

  const spellsByLevel = useMemo(
    () => groupSpellsByLevel(sortedSpells),
    [sortedSpells]
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Spellbook</h2>
        {state.selectedSpells.length > 0 && (
          <button className={styles.clearButton} onClick={clearSpellbook}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.count}>{state.selectedSpells.length} spells selected</div>

      {state.selectedSpells.length === 0 ? (
        <div className={styles.empty}>
          <p>No spells selected yet.</p>
          <p>Add spells from the browser or use auto-fill.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {Array.from(spellsByLevel.entries()).map(([level, spells]) => (
            <div key={level} className={styles.levelGroup}>
              <h3 className={styles.levelHeader}>
                {SPELL_LEVEL_NAMES[level as SpellLevel]}
              </h3>
              {spells.map((spell) => (
                <SpellCard
                  key={spell.id}
                  spell={spell}
                  onAction={() => removeSpell(spell.id)}
                  actionLabel="Remove"
                  actionVariant="remove"
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
