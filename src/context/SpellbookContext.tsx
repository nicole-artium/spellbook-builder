import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Spell, Character, SpellListItem } from '../types'

interface SpellbookState {
  character: Character
  selectedSpells: Spell[]
  availableSpells: SpellListItem[]
  isLoading: boolean
  error: string | null
}

type SpellbookAction =
  | { type: 'SET_CHARACTER'; payload: Partial<Character> }
  | { type: 'ADD_SPELL'; payload: Spell }
  | { type: 'REMOVE_SPELL'; payload: string }
  | { type: 'SET_SELECTED_SPELLS'; payload: Spell[] }
  | { type: 'SET_AVAILABLE_SPELLS'; payload: SpellListItem[] }
  | { type: 'CLEAR_SPELLBOOK' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_STATE'; payload: { character: Character; spells: Spell[] } }

const initialState: SpellbookState = {
  character: {
    id: uuidv4(),
    name: '',
    className: '',
    subclass: '',
    level: 1,
  },
  selectedSpells: [],
  availableSpells: [],
  isLoading: false,
  error: null,
}

function spellbookReducer(state: SpellbookState, action: SpellbookAction): SpellbookState {
  switch (action.type) {
    case 'SET_CHARACTER':
      return {
        ...state,
        character: { ...state.character, ...action.payload },
      }
    case 'ADD_SPELL':
      if (state.selectedSpells.some((s) => s.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        selectedSpells: [...state.selectedSpells, action.payload],
      }
    case 'REMOVE_SPELL':
      return {
        ...state,
        selectedSpells: state.selectedSpells.filter((s) => s.id !== action.payload),
      }
    case 'SET_SELECTED_SPELLS':
      return {
        ...state,
        selectedSpells: action.payload,
      }
    case 'SET_AVAILABLE_SPELLS':
      return {
        ...state,
        availableSpells: action.payload,
      }
    case 'CLEAR_SPELLBOOK':
      return {
        ...state,
        selectedSpells: [],
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'LOAD_STATE':
      return {
        ...state,
        character: action.payload.character,
        selectedSpells: action.payload.spells,
      }
    default:
      return state
  }
}

interface SpellbookContextValue {
  state: SpellbookState
  selectedSpellIds: Set<string>
  setCharacter: (character: Partial<Character>) => void
  addSpell: (spell: Spell) => void
  removeSpell: (spellId: string) => void
  setSelectedSpells: (spells: Spell[]) => void
  setAvailableSpells: (spells: SpellListItem[]) => void
  clearSpellbook: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadState: (character: Character, spells: Spell[]) => void
}

const SpellbookContext = createContext<SpellbookContextValue | null>(null)

export function SpellbookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(spellbookReducer, initialState)

  const setCharacter = useCallback(
    (character: Partial<Character>) => dispatch({ type: 'SET_CHARACTER', payload: character }),
    []
  )
  const addSpell = useCallback(
    (spell: Spell) => dispatch({ type: 'ADD_SPELL', payload: spell }),
    []
  )
  const removeSpell = useCallback(
    (spellId: string) => dispatch({ type: 'REMOVE_SPELL', payload: spellId }),
    []
  )
  const setSelectedSpells = useCallback(
    (spells: Spell[]) => dispatch({ type: 'SET_SELECTED_SPELLS', payload: spells }),
    []
  )
  const setAvailableSpells = useCallback(
    (spells: SpellListItem[]) => dispatch({ type: 'SET_AVAILABLE_SPELLS', payload: spells }),
    []
  )
  const clearSpellbook = useCallback(() => dispatch({ type: 'CLEAR_SPELLBOOK' }), [])
  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    []
  )
  const setError = useCallback(
    (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    []
  )
  const loadState = useCallback(
    (character: Character, spells: Spell[]) =>
      dispatch({ type: 'LOAD_STATE', payload: { character, spells } }),
    []
  )

  const selectedSpellIds = useMemo(
    () => new Set(state.selectedSpells.map((s) => s.id)),
    [state.selectedSpells]
  )

  const value = useMemo<SpellbookContextValue>(
    () => ({
      state,
      selectedSpellIds,
      setCharacter,
      addSpell,
      removeSpell,
      setSelectedSpells,
      setAvailableSpells,
      clearSpellbook,
      setLoading,
      setError,
      loadState,
    }),
    [
      state,
      selectedSpellIds,
      setCharacter,
      addSpell,
      removeSpell,
      setSelectedSpells,
      setAvailableSpells,
      clearSpellbook,
      setLoading,
      setError,
      loadState,
    ]
  )

  return <SpellbookContext.Provider value={value}>{children}</SpellbookContext.Provider>
}

export function useSpellbook(): SpellbookContextValue {
  const context = useContext(SpellbookContext)
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider')
  }
  return context
}
