# ADR-001: Use Static Data for D&D Subclasses

## Status

Accepted

## Context

The D&D 5e API (`dnd5eapi.co`) only contains SRD (System Reference Document) content, providing just 12 subclasses total - one per class. Missing subclasses include Oath of Glory (Paladin), Battle Master (Fighter), and dozens of others from published sourcebooks.

Investigation confirmed:
- Paladin returns only "Devotion" subclass
- API has moved to versioned endpoints (`/api/2014/`)
- No plans to expand beyond SRD content

Users expect access to all official subclasses when building characters.

## Decision

Do not use the D&D 5e API for subclass data. Subclass selection will require a different data source - either static JSON maintained in the repo or a more complete third-party API.

The existing API integration remains valid for spells, which have better SRD coverage.

## Consequences

- Must maintain subclass data manually or find alternative source
- Subclass data won't auto-update if we use static files
- Can include homebrew subclasses if desired
