# AGENTS.md - Instructions for AI Agents

Welcome, AI Agent! This file provides guidance for working with the `football-weekly-ahp` repository.

## 1. Project Overview

This is a **Football Weekly AHP Pairwise Analysis** web application built on the Boba Web Components
template. It enables podcast listeners to use the Analytic Hierarchy Process (AHP) to determine
whether they prefer Tottenham Hotspur getting relegated or Arsenal winning the Premier League title,
by rating every remaining EPL fixture.

Built with:
- **TypeScript** + Web Components (no framework)
- **Vite** for local dev server and asset pipeline
- **Node.js v25** native type stripping (no separate transpile step)
- **Playwright** for E2E tests; **node:test** for unit tests
- **Apple Container CLI** for all local execution (see §4)

## 2. Key Technologies

- **TypeScript**: All source files use `.ts` extensions with mandatory import extensions.
- **Web Components**: Reusable custom elements extending `BaseComponent`.
- **Vite asset imports**: HTML templates → `?raw`, CSS styles → `?inline`, SVGs → `?raw`.
- **Client-Side Routing**: Custom `Router` class in `src/core/router/router.ts`.
- **CSS Variables**: Global design tokens in `src/styles/global.css`.
- **AHP Engine**: Pure TypeScript decision engine in `src/core/ahp/ahp.ts`.

## 3. Directory Structure

```
src/
├── assets/
│   └── crests/           # SVG crest files (imported with ?raw)
│       ├── arsenal-crest.svg
│       └── spurs-crest.svg
├── components/           # One subdirectory per component
│   └── <name>/
│       ├── <name>.ts     # Logic only — no embedded HTML/CSS strings
│       ├── <name>.html   # Template (static components only; imported ?raw)
│       └── <name>.css    # Styles (imported ?inline)
├── core/
│   ├── ahp/
│   │   ├── ahp.ts        # AHP engine (pure logic, no DOM)
│   │   ├── matches-data.ts # Editable remaining fixtures
│   │   └── state.ts      # Singleton state shared across pages
│   ├── base-component.ts # BaseComponent class
│   └── router/
│       └── router.ts     # Client-side router
├── styles/
│   └── global.css        # Global design tokens + reset
└── main.ts               # Route registration + BOBA_BASE_URL
```

## 4. Development Workflow — CRITICAL

### ⚠️ Node.js MUST NOT be run directly on the host.

All commands are executed **inside the container** via `make` targets using **Apple Container CLI**
(`container` binary). Never run `npm`, `node`, or `npx` commands directly on the host machine.

### Build the container image first

```bash
make build
```

### Available `make` targets

| Target       | Description                                              |
|--------------|----------------------------------------------------------|
| `make build` | Build the container image (`football-weekly-ahp`)        |
| `make run-dev` | Start Vite dev server at http://localhost:5173          |
| `make test`  | Run unit tests (`node:test`) inside container            |
| `make e2e`   | Run Playwright E2E tests inside the Playwright container |
| `make shell` | Open an interactive shell in the container               |
| `make install` | Install npm dependencies into the named volume         |

### 🚨 NON-NEGOTIABLE PRE-COMMIT REQUIREMENTS 🚨

Run these via `make` and ensure they all pass before any commit:

1. `make install` — ensure dependencies are up to date
2. `make test` — unit tests must pass
3. `make e2e` — E2E tests must pass

## 5. Component File Convention

Every component must split concerns into separate files:

| File            | Purpose                                    | Import suffix |
|-----------------|--------------------------------------------|---------------|
| `<name>.ts`     | Logic only (event listeners, routing)      | —             |
| `<name>.html`   | HTML template (static components)          | `?raw`        |
| `<name>.css`    | Component-scoped styles                    | `?inline`     |
| `*.svg`         | SVG assets in `src/assets/`               | `?raw`        |

**Never embed HTML strings, CSS strings, or SVG markup directly in `.ts` files.**

Dynamic components (analysis-page, results-page) that build HTML from runtime data may keep
template-building functions in TypeScript, but must still import their CSS and SVG assets
from external files.

## 6. AHP Data

To update the remaining fixtures, edit `src/core/ahp/matches-data.ts` only.
The AHP engine in `src/core/ahp/ahp.ts` is independent of match data and fully testable
without a DOM.

## 7. Routing

- Routes registered in `src/main.ts`.
- `window.BOBA_BASE_URL` is set to `/football-weekly-ahp/` for GitHub Pages deployment.
- Client-side router handles `popstate` and `navigate()` calls.

## 8. Coding Style & Conventions

- Use TypeScript for all source files.
- Mandatory `.ts` extension on all TypeScript imports.
- Use kebab-case for custom element tag names.
- No framework dependencies — vanilla Web Components only.
- No embedded string literals for HTML, CSS, or SVGs in `.ts` files.
- Write meaningful commit messages.
- All whitespace: 2-space indentation.

## 9. Deployment

GitHub Actions deploys to GitHub Pages on push to `main` (see `.github/workflows/deploy.yml`).
Base URL: `https://sholtomaud.github.io/football-weekly-ahp/`
