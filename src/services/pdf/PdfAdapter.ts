import type { Spell, Character } from '../../types'

export interface PdfAdapter {
  generateSpellbook(spells: Spell[], character: Character): void
}

export interface PdfOptions {
  title?: string
  pageSize?: 'a4' | 'letter'
  fontSize?: number
}
