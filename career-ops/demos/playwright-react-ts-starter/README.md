# playwright-react-ts-starter

A small, opinionated React + TypeScript starter that demonstrates a **dual-test-stack** workflow — Vitest + React Testing Library for unit/component, Playwright for cross-browser E2E — wired into a sharded GitHub Actions matrix for sub-15-min PR feedback.

Built as a working sample of the patterns I use day-to-day.

## What it shows

- **React 18 + TypeScript** with strict-mode + `noUncheckedIndexedAccess` (catches the bugs `strict` doesn't).
- **Accessible-by-default UI** — semantic landmarks, `aria-label`s, `aria-live` for the counter, full keyboard flow tested.
- **Vitest + Testing Library** for fast component tests in `happy-dom`.
- **Playwright** running across **Chromium / Firefox / WebKit** with a single config.
- **GitHub Actions matrix sharding** — 3 parallel shards keep E2E feedback under 15 min on PRs.
- **`webServer` auto-start** in Playwright config — tests just work, no manual `npm run dev`.

## Why this exists in my portfolio

Most React engineers can ship a feature; fewer have led a 2-year SDET engagement (SQA Consulting, Playwright + Cypress + Selenium + Cucumber/Gherkin BDD). This starter is the smallest possible artifact that demonstrates the bundle: real React patterns + tests at the unit, integration, and E2E layers + CI orchestration.

## Local

```bash
npm install
npx playwright install --with-deps chromium firefox webkit

npm run dev          # start the app on http://localhost:5173
npm run test         # vitest unit/component
npm run e2e          # playwright cross-browser e2e
npm run e2e:ui       # playwright UI mode for debugging
npm run typecheck    # tsc --noEmit
```

## Project layout

```
.
├── src/                React app (App.tsx, main.tsx)
├── tests/              Vitest unit/component
│   └── e2e/            Playwright cross-browser
├── playwright.config.ts
├── vite.config.ts      shared with vitest
└── .github/workflows/  sharded CI
```

## License

MIT — adapt freely.
