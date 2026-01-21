import { memo } from 'react'
import type { Spell, SpellListItem } from '../../types'
import { SPELL_LEVEL_NAMES, type SpellLevel } from '../../types'
import styles from './SpellCard.module.css'

interface SpellCardProps {
  spell: Spell | SpellListItem
  onAction: () => void
  actionLabel: string
  actionVariant?: 'add' | 'remove'
  disabled?: boolean
}

export const SpellCard = memo(function SpellCard({
  spell,
  onAction,
  actionLabel,
  actionVariant = 'add',
  disabled = false,
}: SpellCardProps) {
  const levelText = SPELL_LEVEL_NAMES[spell.level as SpellLevel]
  const isFullSpell = 'school' in spell

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.name}>{spell.name}</span>
        <span className={styles.level}>{levelText}</span>
        {isFullSpell && <span className={styles.school}>{spell.school}</span>}
      </div>
      <button
        className={`${styles.action} ${styles[actionVariant]}`}
        onClick={onAction}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  )
})
