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
  getSpellsBySubclass,
  getMultipleSpellDetails,
} from './services/api/dndApi'
import { pdfAdapter } from './services/pdf/JsPdfAdapter'
import {
  exportUnifiedSpellbook,
  importUnifiedSpellbook,
} from './services/storage/jsonExport'
import { filterSpellsByMaxLevel } from './utils/spellFilters'
import { getMaxSpellLevel } from './types'
import styles from './App.module.css'

function AppContent() {
  const { state, setAvailableSpells, addSpell, setSelectedSpells, setLoading, setError, loadState } =
    useSpellbook()
  const [loadingSpells, setLoadingSpells] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

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

      // Combine class spells with subclass spells if a subclass is selected
      let allAvailableSpells = [...classSpells]
      if (state.character.subclass) {
        const subclassSpells = await getSpellsBySubclass(state.character.className, state.character.subclass)
        const existingIds = new Set(classSpells.map((s) => s.index))
        const uniqueSubclassSpells = subclassSpells.filter((s) => !existingIds.has(s.index))
        allAvailableSpells = [...classSpells, ...uniqueSubclassSpells]
      }

      const filteredSpells = filterSpellsByMaxLevel(allAvailableSpells, maxLevel)
      const spellIndices = filteredSpells.map((s) => s.index)
      const fullSpells = await getMultipleSpellDetails(spellIndices)
      setSelectedSpells(fullSpells)

      const subclassNote = state.character.subclass ? ' (including subclass spells)' : ''
      setToast({ message: `Added ${fullSpells.length} spells${subclassNote}`, type: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to auto-fill spells'
      setToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [state.character.className, state.character.subclass, state.character.level, setSelectedSpells, setLoading])

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
    if (!state.character.name.trim()) {
      setToast({ message: 'Enter a character name to export', type: 'error' })
      return
    }
    if (state.selectedSpells.length === 0) {
      setToast({ message: 'Add at least one spell to export', type: 'error' })
      return
    }
    exportUnifiedSpellbook(state.character, state.selectedSpells)
    setToast({ message: 'Spellbook exported', type: 'success' })
  }, [state.character, state.selectedSpells])

  const handleImportFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingImportFile(file)
    }
    e.target.value = ''
  }, [])

  const handleImportConfirm = useCallback(async () => {
    if (!pendingImportFile) return
    try {
      const { character, spells } = await importUnifiedSpellbook(pendingImportFile)
      loadState(character, spells)
      setToast({ message: `Imported ${character.name}'s spellbook`, type: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import spellbook'
      setToast({ message, type: 'error' })
    }
    setPendingImportFile(null)
  }, [pendingImportFile, loadState])

  const handleImportCancel = useCallback(() => {
    setPendingImportFile(null)
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Spellbook Builder</h1>
        <div className={styles.actions}>
          <Button onClick={handleGeneratePdf} disabled={state.selectedSpells.length === 0}>
            Generate PDF
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export Spellbook
          </Button>
          <Button variant="secondary" onClick={() => importFileRef.current?.click()}>
            Import Spellbook
          </Button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleImportFileSelect}
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

      {pendingImportFile && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <p>This will replace your current spellbook. Continue?</p>
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={handleImportCancel}>
                Cancel
              </Button>
              <Button onClick={handleImportConfirm}>Replace</Button>
            </div>
          </div>
        </div>
      )}

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
