# ADR-004: PDF Density and Visual Polish

## Status

Accepted

## Context

ADR-003 established the A5 binder PDF format with ~3-4 spells per page. Issue #13 requested improvements to achieve higher density (target: 10 spells per page) while adding visual polish through proper small caps and bordered metadata tables.

Key goals:
- Increase spell density from ~3-4 to ~10 spells per page for typical-length spells
- Use proper small caps typography for spell names
- Add bordered metadata table for visual separation
- Maintain readability despite smaller sizes

## Decision

Reduce font sizes and spacing to maximize density while improving visual polish:

- **7pt body text** with tighter line height and inter-spell spacing
- **True small caps** for spell names (first letter full height, rest at ~75%)
- **Full box borders** around metadata table with light gray hairlines
- **Variable column widths** (20/18/28/34%) to better fit content
- **Material in components cell** on a separate line below V/S/M, reducing vertical space

Page margins (12mm), page-per-level flow, and EB Garamond font remain unchanged.

See [A5 binder mockup](../design/a5-binder-format.pdf) for visual reference.

## Consequences

### Benefits

- ~10 spells per page for typical cantrips/short spells (up from ~3-4)
- More elegant typography with true small caps
- Clearer visual separation of metadata from description
- Material components integrated into table, saving vertical space

### Trade-offs

- 7pt body text approaches minimum readable size; not ideal for users with vision impairments
- Tighter spacing leaves less breathing room between spells
