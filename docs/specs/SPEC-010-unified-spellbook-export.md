# Spec: Unified Character & Spellbook Export/Import

**Issue:** #10 - I can export/import a character and their spellbook together
**Status:** Draft
**Date:** 2026-01-21

## Summary

Combine character data and spellbook into a single export file. Add character name as a required field.

## Requirements

### Functional

1. **Character Name**
   - Add `name` field to Character type (required)
   - Name input appears above class selector in UI
   - Export is blocked if name is empty

2. **Unified Export**
   - Single export button replaces current separate export buttons
   - Downloads one JSON file containing character + all selected spells
   - Filename format: `{characterName}_spellbook.json` (sanitized)
   - Export blocked if no spells selected (minimum 1 spell required)

3. **Unified Import**
   - Single import button replaces current separate import buttons
   - Accepts only the new unified format (no backwards compatibility)
   - Always shows confirmation dialog before overwriting current state
   - Dialog text: "This will replace your current spellbook. Continue?"

### Data Format

```typescript
interface UnifiedSpellbook {
  character: Character
  spells: Spell[]
}

interface Character {
  id: string
  name: string        // NEW: required
  className: string
  subclass: string
  level: number
}
```

### Validation Rules

| Scenario | Behavior |
|----------|----------|
| Empty character name | Block export with validation message |
| No spells selected | Block export with validation message |
| Name has special chars (`/\:*?"<>\|`) | Allow in JSON, sanitize filename only |
| Imported spells don't match class list | Accept silently |
| Import old format (character-only or spells-only) | Reject with error |
| User has unsaved changes on import | Show confirmation dialog |

### UI Changes

1. **Character Config Panel**
   - Add name text input above class dropdown
   - Show validation state (empty = error styling)

2. **Export/Import Buttons**
   - Remove: "Export Character", "Import Character", "Export Spells", "Import Spells"
   - Add: "Export Spellbook", "Import Spellbook"

3. **Confirmation Dialog**
   - Simple modal with warning text
   - "Cancel" and "Replace" buttons

## Out of Scope

- Schema versioning (create backlog issue for future)
- Copy-to-clipboard export option
- Backwards compatibility with old export formats
- Spell data refresh from source on import
- Side-by-side comparison on import

## Technical Notes

### Filename Sanitization

Replace or remove these characters in filename: `/\:*?"<>|`

```typescript
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'spellbook'
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `name` to Character interface |
| `src/services/storage/jsonExport.ts` | Update export/import functions for unified format |
| `src/context/SpellbookContext.tsx` | Handle name field in state |
| `src/App.tsx` | Update UI: name input, single export/import buttons, confirmation dialog |
| `src/services/storage/jsonExport.test.ts` | Update tests for new format |

### Migration Path

1. Old exports will not import (intentional clean break)
2. Users must recreate spellbooks in new format
3. No data migration needed since app has no persistence

## Acceptance Criteria

```gherkin
GIVEN I have created a level 5 Oath of Glory paladin named "Ser Roland" with default spells
WHEN I click Export
THEN a file "Ser_Roland_spellbook.json" downloads containing character and spell data

GIVEN I have a valid spellbook JSON file
WHEN I click Import and confirm the dialog
THEN the character name, class, subclass, level, and all spells populate in the app

GIVEN I have not entered a character name
WHEN I click Export
THEN export is blocked and validation error shows on name field

GIVEN I have no spells selected
WHEN I click Export
THEN export is blocked with appropriate feedback
```

## Backlog Items Created

- [ ] Add schema versioning to export format (future-proofing)
