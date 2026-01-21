import { useEffect, useState } from 'react'
import { useSpellbook } from '../../context/SpellbookContext'
import { getAllClasses, getSubclassesByClass } from '../../services/api/dndApi'
import type { ClassInfo, SubclassInfo } from '../../types'
import styles from './CharacterConfig.module.css'

interface CharacterConfigProps {
  onAutoFill: () => void
}

export function CharacterConfig({ onAutoFill }: CharacterConfigProps) {
  const { state, setCharacter } = useSpellbook()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [subclasses, setSubclasses] = useState<SubclassInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllClasses()
      .then(setClasses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (state.character.className) {
      getSubclassesByClass(state.character.className)
        .then(setSubclasses)
        .catch(console.error)
    } else {
      setSubclasses([])
    }
  }, [state.character.className])

  const handleClassChange = (className: string) => {
    setCharacter({ className, subclass: '' })
  }

  const handleSubclassChange = (subclass: string) => {
    setCharacter({ subclass })
  }

  const handleLevelChange = (level: number) => {
    setCharacter({ level })
  }

  if (loading) {
    return <div className={styles.container}>Loading classes...</div>
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Character</h3>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Class</span>
          <select
            value={state.character.className}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            <option value="">Select class...</option>
            {classes.map((cls) => (
              <option key={cls.index} value={cls.index}>
                {cls.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Subclass</span>
          <select
            value={state.character.subclass}
            onChange={(e) => handleSubclassChange(e.target.value)}
            disabled={!state.character.className}
          >
            <option value="">Select subclass...</option>
            {subclasses.map((sub) => (
              <option key={sub.index} value={sub.index}>
                {sub.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Level</span>
          <select
            value={state.character.level}
            onChange={(e) => handleLevelChange(Number(e.target.value))}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <button
          className={styles.autoFillButton}
          onClick={onAutoFill}
          disabled={!state.character.className}
        >
          Auto-fill Spells
        </button>
      </div>
    </div>
  )
}
