# ADR-003: A5 Binder PDF Format

## Status

Accepted

## Context

The existing PDF export generates A4 documents with verbose metadata layout (one attribute per line). Users need a more compact format suitable for printing in A5 half-page binders, which are common for tabletop RPG reference materials.

Key requirements:
- Fit more spells per page for quick reference during play
- Support both A5 (148×210mm) and US Letter page sizes
- Maintain readability at smaller font sizes
- Provide clear visual hierarchy for spell attributes

## Decision

Implement a new binder-optimized PDF format with the following design choices:

### Page Layout
- **A5 portrait** as primary format, US Letter as alternative
- Both formats use identical layout logic, only page dimensions differ
- Export via dropdown menu replacing the current single export button

### Typography
- **EB Garamond** embedded serif font for cohesive book aesthetic
- Spell names in **small caps** (9pt bold, letter-spaced) followed by italic level/school
- Body text at 8pt with tight leading
- No vertical space between paragraphs; ~1em first-line indent on paragraphs 2+

### Spell Metadata
- **Four-column single-row layout**: Casting Time | Range | Duration | Components
- **Icons as visual indicators**:
  - ◆ (solid diamond) prefix on duration = Concentration
  - □ (outline square) prefix on casting time = Ritual
- Material descriptions aligned under components column in smaller italic

### Page Flow
- Each spell level starts on a new page ("Cantrips", "Level 1", etc.)
- Spells never split across pages (push to next page if insufficient space)
- Stat blocks moved to appendix (appendix references spell, not vice versa)

See mockups for visual reference:
- [A5 format](../design/a5-binder-format.pdf) (148×210mm)
- [US Letter format](../design/letter-binder-format.pdf) (8.5×11in)

## Consequences

### Benefits
- Significantly more spells per page (~3-4 vs 1-2 in current format)
- Professional book-like appearance with serif typography
- Clear visual scanning with icons for concentration/ritual
- Consistent layout between A5 and US Letter exports

### Trade-offs
- Embedded custom font increases PDF file size (~150-300KB for EB Garamond family vs ~10KB baseline with built-in Times; a 20-spell document grows from ~30KB to ~200KB)
- Smaller text may be harder to read for some users (no font size options)
- Icons require vector drawing (slightly more complex implementation)
- EB Garamond TTF files need jsPDF-compatible conversion for embedding
