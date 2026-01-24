import { describe, it, expect } from 'vitest'
import { parseTextSegments } from './textParser'

describe('parseTextSegments', () => {
  it('returns single normal segment for plain text', () => {
    const result = parseTextSegments('Hello world')
    expect(result).toEqual([
      { text: 'Hello world', bold: false, boldItalic: false },
    ])
  })

  it('parses bold text at start', () => {
    const result = parseTextSegments('**Combat.** The steed is an ally')
    expect(result).toEqual([
      { text: 'Combat.', bold: true, boldItalic: false },
      { text: ' The steed is an ally', bold: false, boldItalic: false },
    ])
  })

  it('parses bold text in middle', () => {
    const result = parseTextSegments('You can use **Dash** as a bonus action')
    expect(result).toEqual([
      { text: 'You can use ', bold: false, boldItalic: false },
      { text: 'Dash', bold: true, boldItalic: false },
      { text: ' as a bonus action', bold: false, boldItalic: false },
    ])
  })

  it('parses multiple bold segments', () => {
    const result = parseTextSegments('**First.** Text. **Second.** More text.')
    expect(result).toEqual([
      { text: 'First.', bold: true, boldItalic: false },
      { text: ' Text. ', bold: false, boldItalic: false },
      { text: 'Second.', bold: true, boldItalic: false },
      { text: ' More text.', bold: false, boldItalic: false },
    ])
  })

  it('marks "Using a Higher-Level Spell Slot." as boldItalic', () => {
    const result = parseTextSegments('**Using a Higher-Level Spell Slot.** Use the slot level.')
    expect(result).toEqual([
      { text: 'Using a Higher-Level Spell Slot.', bold: false, boldItalic: true },
      { text: ' Use the slot level.', bold: false, boldItalic: false },
    ])
  })

  it('marks "Cantrip Upgrade." as boldItalic', () => {
    const result = parseTextSegments('**Cantrip Upgrade.** The damage increases.')
    expect(result).toEqual([
      { text: 'Cantrip Upgrade.', bold: false, boldItalic: true },
      { text: ' The damage increases.', bold: false, boldItalic: false },
    ])
  })

  it('handles text with no bold markers', () => {
    const result = parseTextSegments('Plain text without any formatting')
    expect(result).toEqual([
      { text: 'Plain text without any formatting', bold: false, boldItalic: false },
    ])
  })

  it('handles empty string', () => {
    const result = parseTextSegments('')
    expect(result).toEqual([])
  })
})
