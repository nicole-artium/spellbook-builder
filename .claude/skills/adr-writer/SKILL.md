---
name: adr-writer
description: Create Architecture Decision Records from conversation context. Triggers on "create an ADR", "document this decision".
---

# ADR Writer

Generate Architecture Decision Records (ADRs) that capture design decisions from the current conversation.

## When to Use

- User asks to "create an ADR" or "document this decision"
- A significant design decision has been made during the conversation
- After completing a design interview or spec
- When trade-offs were discussed and a choice was made

## Process

1. **Check existing ADRs**: Read `docs/adr/` to find the next number and understand conventions
2. **Read the template**: Use `docs/adr/TEMPLATE.md` if it exists
3. **Extract from conversation**:
   - Context: What problem or need motivated this?
   - Decision: What was chosen and why?
   - Consequences: What are the trade-offs?
4. **Link related artifacts**: Mockups, specs, or other ADRs
5. **Write the ADR** following project conventions

## ADR Structure

```markdown
# ADR-NNN: Title

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX](ADR-XXX-title.md)

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?
```

## File Naming

- ADR document: `docs/adr/ADR-NNN-kebab-case-title.md`
- Related mockups: `docs/adr/adr-nnn-related-file.pdf`

## Writing Guidelines

### Context Section
- Describe the problem or need
- Include relevant constraints
- Mention alternatives that were considered
- Keep it brief but complete

### Decision Section
- State the choice clearly
- Organize by category if multiple aspects (layout, typography, etc.)
- Use bullet points for scanability
- Reference mockups with relative links: `See [mockup PDF](adr-nnn-mockup.pdf)`

### Consequences Section
- Split into Benefits and Trade-offs
- Be honest about downsides
- Consider implementation complexity
- Note any future considerations

## Example

```markdown
# ADR-003: A5 Binder PDF Format

## Status

Accepted

## Context

Users need a compact PDF format for A5 binders...

## Decision

Implement binder-optimized PDF with:
- EB Garamond serif font
- Four-column metadata layout
- Icons for concentration/ritual

See [mockup PDF](adr-003-mockup.pdf) for visual reference.

## Consequences

### Benefits
- More spells per page
- Professional appearance

### Trade-offs
- Larger file size from embedded fonts
- Smaller text may be harder to read
```
