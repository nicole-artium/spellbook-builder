# Issue #9: A5 Binder Format Spec

## Overview
Compact PDF export optimized for A5 binder printing with horizontal metadata layout, serif typography, and dense formatting.

## Page Formats

| Format | Dimensions | Use Case |
|--------|------------|----------|
| A5 Portrait | 148×210mm | Primary target, half-A4 binders |
| US Letter | 8.5×11in | US standard, same compact layout |

Both formats share identical layout logic, only page dimensions differ.

## Spell Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ S P E L L  N A M E  (Level 3 Evocation)                         │  ← small caps + italic level/school
├────────────────┬────────────┬────────────────┬──────────────────┤
│ □ 1 action     │ 60 feet    │ ◆ 1 minute     │ V S M            │  ← 4 fixed-width columns
│                │            │                │ (material desc)  │  ← material aligned under VSM
├────────────────┴────────────┴────────────────┴──────────────────┤
│ First paragraph of description text flows normally from the      │
│ left margin with no indent.                                      │
│    Second paragraph has ~1em first-line indent. No vertical     │
│ space between paragraphs.                                        │
│    At Higher Levels. Bold-italic label, then normal text        │
│ continues inline. Also indented ~1em.                            │
└──────────────────────────────────────────────────────────────────┘
```

## Icons

| Icon | Meaning | Position |
|------|---------|----------|
| ◆ (solid diamond) | Concentration | Before duration value |
| □ (outline square) | Ritual | Before casting time value |

Icons are drawn shapes (not Unicode glyphs) for reliable rendering.

## Metadata Display Rules

### Four-Column Layout (single row)
| Column | Content | Notes |
|--------|---------|-------|
| 1 | Casting Time | Ritual icon □ prefix if applicable |
| 2 | Range | Plain text |
| 3 | Duration | Concentration icon ◆ prefix if applicable |
| 4 | Components | V S M as spaced letters |

### Material Description
- Italic text aligned directly below the V S M column (column 4)
- Only displayed if spell has material component
- Smaller font size than metadata row

## Typography

**Font**: EB Garamond (embedded custom serif font)
- All elements use serif throughout for cohesive book aesthetic

| Element | Size | Style |
|---------|------|-------|
| Spell name | 9pt | Bold, small caps (letter-spaced uppercase) |
| Level/school | 8pt | Italic, after spell name: "(Level 3 Evocation)" |
| Metadata columns | 8pt | Regular |
| Material description | 7pt | Italic |
| Description body | 8pt | Regular, tight leading |
| "At Higher Levels" label | 8pt | **Bold italic** |

### Paragraph Formatting
- **No vertical space** between paragraphs within a spell
- **First paragraph**: No indent, flows from left margin
- **Subsequent paragraphs**: ~1em first-line indent
- **At Higher Levels**: Treated as indented paragraph, bold-italic label inline

## Page Flow Rules

1. **Level Section Breaks**: Each spell level (Cantrips, Level 1, Level 2...) starts on a new page
2. **No Spell Splitting**: Spells never break across pages
3. **Overflow Exception**: If spell exceeds one full page after stat block extraction, allow page split (no continuation header needed)
4. **Stat Block Handling**: All stat blocks (summons, polymorph forms) go to Appendix at document end
   - Appendix entries reference back to their source spell(s)
   - Spell description does NOT reference appendix

## Level Section Headers

**Style**: Left-aligned bold serif with horizontal rule underneath

**Format**:
- Cantrips: `Cantrips`
- 1st level: `Level 1`
- 2nd level: `Level 2`
- etc.

```
Level 1
───────────────────────────────────
```

## UI Changes

### Export Button
Replace current single export button with dropdown menu:

```
[Export PDF ▼]
  ├─ A5 Binder (148×210mm)
  └─ US Letter (8.5×11in)
```

## Implementation Components

### New Files
- `src/services/pdf/BinderPdfAdapter.ts` - new adapter implementing `PdfAdapter` interface
- `src/services/pdf/pageFormats.ts` - page dimension constants
- `src/assets/fonts/EBGaramond-*.ttf` - embedded font files (Regular, Bold, Italic, BoldItalic)

### Modified Files
- `src/App.tsx` - replace export button with dropdown
- `src/services/pdf/index.ts` - export new adapter

### Adapter Architecture
```typescript
interface PageFormat {
  name: string
  width: number  // mm
  height: number // mm
  margins: { top: number, bottom: number, left: number, right: number }
}

class BinderPdfAdapter implements PdfAdapter {
  constructor(format: PageFormat)
  generatePdf(spells: Spell[], character?: Character): Promise<Blob>
}
```

### Icon Rendering
Icons (◆ □) rendered as vector shapes using jsPDF drawing primitives:
- `drawDiamond(x, y, size)` - filled diamond for concentration
- `drawSquare(x, y, size)` - outline square for ritual

## Out of Scope
- Homebrew spell support
- Color vs grayscale toggle
- Character cover page
- Configurable layout style per format

## Mockup References
- Header styles: `docs/mockups/header-style-options.pdf` (Option 2 selected)
- Layout options: `docs/mockups/layout-options.pdf`
- Typography: `docs/mockups/typography-refined.pdf` (final version)
