import { useEffect, useState, useCallback, useRef } from 'react'
import { SpellbookProvider, useSpellbook } from './context/SpellbookContext'
import { CharacterConfig } from './components/CharacterConfig/CharacterConfig'
import { SpellBrowser } from './components/SpellBrowser/SpellBrowser'
import { SpellbookPanel } from './components/SpellbookPanel/SpellbookPanel'
import { Toast } from './components/common/Toast'
import { Button } from './components/common/Button'
import {
  getAllSpells,
  getSpellDetails,
  getSpellsByClass,
  getMultipleSpellDetails,
} from './services/api/dndApi'
import { pdfAdapter } from './services/pdf/JsPdfAdapter'
import {
  exportSpellbook,
  importCharacter,
  importSpells,
} from './services/storage/jsonExport'
import { filterSpellsByMaxLevel } from './utils/spellFilters'
import { getMaxSpellLevel } from './types'
import styles from './App.module.css'

function AppContent() {
  const { state, setAvailableSpells, addSpell, setSelectedSpells, setLoading, setError, loadState } =
    useSpellbook()
  const [loadingSpells, setLoadingSpells] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const characterFileRef = useRef<HTMLInputElement>(null)
  const spellsFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    getAllSpells()
      .then(setAvailableSpells)
      .catch((err) => {
        setError(err.message)
        setToast({ message: `Failed to load spells: ${err.message}`, type: 'error' })
      })
      .finally(() => setLoading(false))
  }, [setAvailableSpells, setLoading, setError])

  const handleAddSpell = useCallback(
    async (spellIndex: string) => {
      setLoadingSpells((prev) => new Set(prev).add(spellIndex))
      try {
        const spell = await getSpellDetails(spellIndex)
        addSpell(spell)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load spell'
        setToast({ message, type: 'error' })
      } finally {
        setLoadingSpells((prev) => {
          const next = new Set(prev)
          next.delete(spellIndex)
          return next
        })
      }
    },
    [addSpell]
  )

  const handleAutoFill = useCallback(async () => {
    if (!state.character.className) return

    setLoading(true)
    try {
      const classSpells = await getSpellsByClass(state.character.className)
      const maxLevel = getMaxSpellLevel(state.character.className, state.character.level)
      const availableClassSpells = filterSpellsByMaxLevel(classSpells, maxLevel)
      const spellIndices = availableClassSpells.map((s) => s.index)
      const fullSpells = await getMultipleSpellDetails(spellIndices)
      setSelectedSpells(fullSpells)
      setToast({ message: `Added ${fullSpells.length} spells`, type: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to auto-fill spells'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [state.character.className, state.character.level, setSelectedSpells, setLoading])

  const handleGeneratePdf = useCallback(() => {
    if (state.selectedSpells.length === 0) {
      setToast({ message: 'No spells to generate', type: 'error' })
      return
    }
    try {
      pdfAdapter.generateSpellbook(state.selectedSpells, state.character)
      setToast({ message: 'PDF generated', type: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate PDF'
      setToast({ message, type: 'error' })
    }
  }, [state.selectedSpells, state.character])

  const handleExport = useCallback(() => {
    if (state.selectedSpells.length === 0) {
      setToast({ message: 'No spells to export', type: 'error' })
      return
    }
    exportSpellbook(state.character, state.selectedSpells)
    setToast({ message: 'Exported character and spells', type: 'success' })
  }, [state.character, state.selectedSpells])

  const handleImportCharacter = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const character = await importCharacter(file)
        loadState(character, state.selectedSpells)
        setToast({ message: 'Character imported', type: 'success' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import character'
        setToast({ message, type: 'error' })
      }
      e.target.value = ''
    },
    [loadState, state.selectedSpells]
  )

  const handleImportSpells = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const spells = await importSpells(file)
        setSelectedSpells(spells)
        setToast({ message: `Imported ${spells.length} spells`, type: 'success' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import spells'
        setToast({ message, type: 'error' })
      }
      e.target.value = ''
    },
    [setSelectedSpells]
  )

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Spellbook Builder</h1>
        <div className={styles.actions}>
          <Button onClick={handleGeneratePdf} disabled={state.selectedSpells.length === 0}>
            Generate PDF
          </Button>
          <Button variant="secondary" onClick={handleExport} disabled={state.selectedSpells.length === 0}>
            Export
          </Button>
          <Button variant="secondary" onClick={() => characterFileRef.current?.click()}>
            Import Character
          </Button>
          <Button variant="secondary" onClick={() => spellsFileRef.current?.click()}>
            Import Spells
          </Button>
          <input
            ref={characterFileRef}
            type="file"
            accept=".json"
            onChange={handleImportCharacter}
            style={{ display: 'none' }}
          />
          <input
            ref={spellsFileRef}
            type="file"
            accept=".json"
            onChange={handleImportSpells}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <CharacterConfig onAutoFill={handleAutoFill} />

      {state.isLoading && <div className={styles.loading}>Loading...</div>}

      <main className={styles.main}>
        <SpellBrowser onAddSpell={handleAddSpell} loadingSpells={loadingSpells} />
        <SpellbookPanel />
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <SpellbookProvider>
      <AppContent />
    </SpellbookProvider>
  )
}
