# ADR-002: Use 5eTools Static Data for Spells

## Status

Accepted (supersedes spell-related assumptions in ADR-001)

## Context

The Open5e API (api.open5e.com) only provides SRD (System Reference Document) content — approximately 319 spells from the `srd-2024` document. Many spells from the 2024 Player's Handbook are missing, including:

- Blinding Smite (Paladin)
- Aura of Vitality (Paladin, Cleric, Druid)
- Most subclass-specific spells (Oath spells, Domain spells, Patron spells, etc.)

Investigation confirmed:
- Open5e has 319 spells; the 2024 PHB has 391
- Missing spells are not in the SRD due to WotC licensing
- No API provides complete 2024 PHB spell data legally for free

Users expect access to all PHB spells when building spellbooks, especially subclass-granted spells like Guiding Bolt for Oath of Glory Paladins.

## Decision

Replace the Open5e API with bundled static data from 5eTools for spell information:

1. **Spell data**: Bundle `spells-xphb.json` (391 spells, ~576KB)
2. **Class-spell associations**: Bundle `spell-class-lookup.json` (~612KB) for class and subclass spell lists
3. **Subclass data**: Bundle `subclasses-xphb.json` (~3KB) for subclass metadata

Data is sourced from the 5eTools mirror repository and transformed at build time into the app's internal format.

## Consequences

### Benefits
- Complete 2024 PHB spell coverage (391 vs 319 spells)
- Subclass-specific spell lists work correctly (Oath spells, Domain spells, etc.)
- No network requests for spell data — instant loading, works offline
- No API rate limits or availability concerns

### Tradeoffs
- Bundle size increases by ~315KB gzipped
- Manual updates required when 5eTools data changes
- Data is technically unofficial (though accurate to published content)

### Migration path
- The Open5e API code was preserved briefly but has been removed as dead code
- To switch data sources in the future, create a new provider implementing the same interface
