---
name: design-interview
description: Conduct structured interviews for design decisions with visual feedback. Triggers on "interview me about", "help me decide", "design interview".
---

# Design Interview

Conduct structured interviews to gather design requirements and preferences, offering visual mockups when comparing options.

## When to Use

- User asks to be "interviewed" about a design or plan
- Multiple design decisions need to be made
- User is unsure about layout, typography, icons, or visual style
- Planning a new feature with visual components

## Interview Flow

1. **Understand the scope**: What are we designing? What decisions need to be made?
2. **Categorize decisions**: Layout, typography, icons, colors, page flow, etc.
3. **Ask focused questions**: Use AskUserQuestion with 2-4 concrete options
4. **Offer mockups**: When comparing visual options, offer to generate PDFs
5. **Iterate on feedback**: Refine based on user responses
6. **Summarize decisions**: Compile into spec or ADR at the end

## Question Categories

### Layout Questions
- Column arrangement (1-col, 2-col, grid)
- Information hierarchy (what's prominent?)
- Density vs whitespace trade-offs
- Responsive considerations

### Typography Questions
- Font family (serif vs sans-serif, specific fonts)
- Size hierarchy (headers, body, captions)
- Style variations (bold, italic, small caps)
- Paragraph formatting (indents, spacing)

### Icon/Visual Questions
- Icon style (geometric, symbolic, text-based)
- Visual indicators (colors, shapes, badges)
- Separator styles (lines, pipes, bullets)

### Page Flow Questions
- Section breaks (new page, divider, continuous)
- Page splitting rules (avoid orphans, allow breaks)
- Navigation aids (headers, footers, tabs)

## Using AskUserQuestion

```typescript
// Good: Concrete options with descriptions
{
  question: "Which separator style between metadata fields?",
  header: "Separators",
  options: [
    { label: "Vertical pipe", description: "'1 action | 60 feet | 1 minute'" },
    { label: "Bullet dots", description: "'1 action • 60 feet • 1 minute'" },
    { label: "Show me mockups", description: "Generate PDF comparing options" }
  ]
}

// Include "show me mockups" option for visual decisions
```

## Offering Mockups

When the user selects "show me mockups" or when visual comparison would help:

1. Invoke the **pdf-mockup** skill
2. Generate comparison PDF with all options labeled
3. Display to user
4. Follow up with decision question

## Handling Custom Responses

Users may select "Other" and provide custom input. When this happens:
- Parse their response for specific requirements
- Ask clarifying follow-up questions if needed
- Offer to mockup their custom idea

## Completing the Interview

When all decisions are made:

1. **Summarize decisions** in a table format
2. **Ask about output format**:
   - Spec document (`docs/specs/`)
   - ADR (`docs/adr/`)
   - Both
3. **Generate documentation** using appropriate skill
4. **Offer final mockup** showing complete design

## Example Interview Flow

```
1. "What page format?" → A5, US Letter, or both
2. "What font style?" → Serif or sans-serif
3. [If serif] "Which serif font?" → Show mockup of options
4. "How should metadata be arranged?" → Show layout mockup
5. "What icons for concentration/ritual?" → Show icon mockup
6. "Paragraph formatting?" → Indent style, spacing
7. Summarize → Write spec/ADR
```

## Integration with Other Skills

- **pdf-mockup**: Generate visual comparisons during interview
- **adr-writer**: Document final decisions after interview completes
