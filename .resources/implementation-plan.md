# Spellbook Builder - Implementation Plan

## Overview
A browser-based D&D 5e spellbook formatter that fetches spells from a public API, allows customization based on character class/subclass/level, and generates print-ready PDFs.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React + TypeScript | Familiar, component-based |
| Build | Vite | Fast dev server, native TS support |
| Styling | CSS Modules | Scoped styles, no runtime overhead |
| State | React Context + hooks | Built-in, sufficient for app scope |
| PDF | jsPDF (with adapter) | Simplest, swappable later |
| API | dnd5eapi.co | Clean SRD data, no auth required |
| Testing | Vitest + React Testing Library | Native Vite integration |

---

## Core Features

### 1. Character Configuration
- Class selection (all PHB classes)
- Subclass selection (filtered by class)
- Level selection (1-20)
- Auto-populates spellbook with class/subclass spells up to available spell level

### 2. Spell Browser (Left Panel)
- Fetches spells from dnd5eapi.co
- Basic search by name
- Filter by spell level (cantrip, 1st-9th)
- Displays: name, level, school, casting time
- Click to add spell to spellbook

### 3. Spellbook Manager (Right Panel)
- Shows selected spells
- Remove spells with click/button
- Sorted by level, then alphabetically
- Shows spell count and slot usage

### 4. PDF Generation
- Matches format from reference document:
  ```
  Spell Name (School Level)
  Casting Time: X
  Range: X
  Duration: X
  Components: X
  [Description text flowing naturally]
  [Higher level/scaling notes indented]
  ```
- Sorted by level, then alphabetically
- Compact book-style layout (not cards)

### 5. Import/Export
- Export: Two separate JSON files
  - `character.json`: class, subclass, level, character ID
  - `spells.json`: full spell data array
- Import: Load either/both files to restore state

---

## Architecture

```
src/
├── components/
│   ├── CharacterConfig/
│   ├── SpellBrowser/
│   ├── SpellbookPanel/
│   ├── SpellCard/
│   └── common/ (Button, Input, Modal, Toast)
├── context/
│   └── SpellbookContext.tsx
├── services/
│   ├── api/
│   │   └── dndApi.ts (fetch spells, classes)
│   ├── pdf/
│   │   ├── PdfAdapter.ts (interface)
│   │   └── JsPdfAdapter.ts (implementation)
│   └── storage/
│       └── jsonExport.ts (import/export logic)
├── types/
│   └── index.ts (Spell, Character, etc.)
├── hooks/
│   └── useSpells.ts, useCharacter.ts
├── utils/
│   └── spellFilters.ts, spellSorters.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Data Types

```typescript
interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  description: string;
  higherLevels?: string;
  ritual: boolean;
  concentration: boolean;
}

interface Character {
  id: string;
  class: string;
  subclass: string;
  level: number;
}

interface Spellbook {
  character: Character;
  spells: Spell[];
}
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Configure CSS Modules
3. Set up Vitest with React Testing Library
4. Create folder structure
5. Define TypeScript types

### Phase 2: API Integration
1. Create dndApi service with fetch wrapper
2. Implement `getSpells()` - fetch all spells list
3. Implement `getSpellDetails(id)` - fetch full spell data
4. Implement `getClasses()` and `getSubclasses(classId)`
5. Add simple error handling (toast on failure)

### Phase 3: State Management
1. Create SpellbookContext with:
   - character state
   - selectedSpells array
   - availableSpells (from API)
   - actions: addSpell, removeSpell, setCharacter, clearSpellbook
2. Create useSpellbook hook

### Phase 4: UI Components
1. App layout (header, two-panel grid)
2. CharacterConfig (class/subclass/level dropdowns)
3. SpellBrowser (search, filter, spell list)
4. SpellbookPanel (selected spells, remove buttons)
5. SpellCard (compact spell display)
6. Action buttons (Generate PDF, Export, Import)

### Phase 5: Core Logic
1. Auto-fill spells based on character config
2. Spell filtering (search + level)
3. Spell sorting (level, then alpha)

### Phase 6: PDF Generation
1. Define PdfAdapter interface
2. Implement JsPdfAdapter using jsPDF
3. Format spells matching reference document style
4. Handle page breaks between spell levels

### Phase 7: Import/Export
1. Export character.json
2. Export spells.json
3. Import with file picker
4. Validate imported JSON against types

### Phase 8: Testing
1. **API service tests**: mock fetch, verify data transformation
2. **Spell filter/sort tests**: search matching, level filtering, sort order
3. **PDF adapter tests**: verify output structure, spell formatting
4. **Import/export tests**: round-trip validation, schema validation
5. **Character config tests**: spell slot calculation, class spell list

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Spell, Character, Spellbook types |
| `src/services/api/dndApi.ts` | API client for dnd5eapi.co |
| `src/services/pdf/PdfAdapter.ts` | PDF generation interface |
| `src/services/pdf/JsPdfAdapter.ts` | jsPDF implementation |
| `src/services/storage/jsonExport.ts` | Import/export logic |
| `src/context/SpellbookContext.tsx` | Global state |
| `src/utils/spellFilters.ts` | Search and filter functions |
| `src/utils/spellSorters.ts` | Sorting logic |
| `src/components/CharacterConfig/` | Class/subclass/level UI |
| `src/components/SpellBrowser/` | Left panel |
| `src/components/SpellbookPanel/` | Right panel |
| `src/__tests__/` | Test files for critical paths |

---

## Verification Plan

1. **Manual Testing**
   - Select class/subclass/level → verify spells auto-populate
   - Search spells → verify filtering works
   - Add/remove spells → verify panel updates
   - Generate PDF → verify format matches reference
   - Export → verify two JSON files created
   - Import → verify state restored correctly

2. **Automated Tests**
   ```bash
   npm run test
   ```
   - All critical path tests pass
   - No TypeScript errors

3. **Build Verification**
   ```bash
   npm run build
   npm run preview
   ```
   - App builds without errors
   - Preview runs and functions correctly

---

## Out of Scope (Future)
- Homebrew spell entry
- Offline/PWA support
- Multiple spellbooks
- Mobile responsive layout
- Advanced filters (school, concentration, ritual)
- Spell slot tracking
- Database persistence
- Deployment configuration
