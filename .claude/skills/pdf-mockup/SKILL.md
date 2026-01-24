---
name: pdf-mockup
description: Generate visual PDF mockups during design discussions. Triggers on "show me a mockup", "visualize this", "generate a PDF preview".
---

# PDF Mockup Generator

Generate visual PDF mockups to help users evaluate design options during planning discussions.

## When to Use

- User asks to "show me a mockup" or "visualize this"
- Comparing layout, typography, or icon options
- Design interview reaches a point where visual feedback would help
- User is uncertain between multiple approaches

## Process

1. **Identify what to mockup**: Layout options, font comparisons, icon styles, spacing variations
2. **Create a TypeScript script** in `scripts/` using jsPDF
3. **Run the script** with `npx tsx scripts/<name>.ts`
4. **Read the PDF** to display it to the user
5. **Iterate** based on feedback

## Implementation Guidelines

### Script Location
Save mockup scripts to `scripts/generate-<purpose>-mockup.ts`

### jsPDF Patterns

```typescript
import { jsPDF } from 'jspdf'
import { writeFileSync } from 'fs'

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: [width, height],  // or 'a4', 'a5', 'letter'
})

// Draw shapes for icons (Unicode often fails)
function drawDiamond(doc: jsPDF, x: number, y: number, size: number): void {
  const half = size / 2
  doc.setFillColor(0, 0, 0)
  doc.triangle(x, y - half, x + half, y, x - half, y, 'F')
  doc.triangle(x + half, y, x, y + half, x - half, y, 'F')
}

// Small caps simulation
doc.setCharSpace(0.8)
doc.text('SPELL NAME', x, y)
const nameWidth = doc.getTextWidth('SPELL NAME') + (0.8 * 'SPELL NAME'.length)
doc.setCharSpace(0)

// Save
writeFileSync('path/to/output.pdf', Buffer.from(doc.output('arraybuffer')))
```

### Common Gotchas

- **Unicode icons**: Use drawn shapes instead of Unicode characters (◆, □, etc.)
- **Character spacing**: Affects width calculation; measure after setting, account for extra spacing
- **Built-in fonts**: Only `helvetica`, `times`, `courier` available without embedding
- **Custom fonts**: Google Fonts TTFs often incompatible; may need conversion

### Output Location

- During iteration: `docs/mockups/<name>.pdf`
- Final approved mockups: Copy to `docs/design/`, overwriting the canonical version
- ADRs and specs reference mockups via `../design/filename.pdf`
- Clean up `docs/mockups/` working files when design is finalized

## After Generating

1. Use the Read tool to display the PDF to the user
2. Ask for feedback using AskUserQuestion
3. Iterate or finalize based on response
4. When design is finalized:
   - Copy final PDF to `docs/design/`
   - Remove working PDFs from `docs/mockups/`
   - Remove mockup generation scripts from `scripts/`
