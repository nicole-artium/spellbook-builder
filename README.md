# Spellbook Builder

A browser-based D&D 5e spellbook formatter. Select spells by class/level, customize your spellbook, and generate print-ready PDFs.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Run Tests

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

### E2E Tests (Playwright)

```bash
npm run test:e2e     # Run headless
npm run test:e2e:ui  # Run with Playwright UI
```

## Build for Production

```bash
npm run build
npm run preview   # Preview the build
```
