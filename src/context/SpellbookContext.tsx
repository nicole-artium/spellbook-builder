import { createContext, useContext, useReducer, type ReactNode } from 'react'
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

  const value: SpellbookContextValue = {
    state,
    setCharacter: (character) => dispatch({ type: 'SET_CHARACTER', payload: character }),
    addSpell: (spell) => dispatch({ type: 'ADD_SPELL', payload: spell }),
    removeSpell: (spellId) => dispatch({ type: 'REMOVE_SPELL', payload: spellId }),
    setSelectedSpells: (spells) => dispatch({ type: 'SET_SELECTED_SPELLS', payload: spells }),
    setAvailableSpells: (spells) => dispatch({ type: 'SET_AVAILABLE_SPELLS', payload: spells }),
    clearSpellbook: () => dispatch({ type: 'CLEAR_SPELLBOOK' }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    loadState: (character, spells) =>
      dispatch({ type: 'LOAD_STATE', payload: { character, spells } }),
  }

  return <SpellbookContext.Provider value={value}>{children}</SpellbookContext.Provider>
}

export function useSpellbook(): SpellbookContextValue {
  const context = useContext(SpellbookContext)
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider')
  }
  return context
}
