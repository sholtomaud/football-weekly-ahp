# DESIGN.md — Football Weekly AHP Design System

Design principles, tokens, and development preferences for this project.

---

## 1. Design Philosophy

- **Dark mode first**: All surfaces use deep navy/charcoal backgrounds. No light mode.
- **Premium feel**: Every interaction should feel deliberate and high-quality.
- **Football identity**: Arsenal red and Spurs navy are used dually and purposefully — never just as
  decoration.
- **Clarity over cleverness**: Analytical data (OVP - Overall Vector of Priority, CR, rankings)
  should be immediately readable.
- **Motion with restraint**: Animations aid comprehension (bar reveals, slide transitions, orb
  glows) — they must never distract.

---

## 2. Colour Palette

| Token                 | Value      | Usage                                      |
|-----------------------|------------|--------------------------------------------|
| `--color-bg`          | `#080812`  | Page background                            |
| `--color-surface`     | `#0f0f20`  | Cards, panels, nav background              |
| `--color-surface-2`   | `#16162e`  | Nested surfaces                            |
| `--color-border`      | `rgba(255,255,255,0.08)` | Default border               |
| `--color-text`        | `#e8e8f0`  | Primary text                               |
| `--color-muted`       | `#6b6b8a`  | Secondary/helper text                      |
| `--color-arsenal`     | `#EF0107`  | Arsenal accent, primary CTA, Arsenal side  |
| `--color-arsenal-dark`| `#b30000`  | Arsenal hover, gradient end                |
| `--color-arsenal-glow`| `rgba(239,1,7,0.25)` | Arsenal glow / shadow          |
| `--color-spurs`       | `#132257`  | Spurs accent, Spurs side                   |
| `--color-spurs-light` | `#1d3278`  | Spurs hover state                          |
| `--color-spurs-glow`  | `rgba(19,34,87,0.4)` | Spurs glow / shadow            |
| `--color-pitch`       | `#00b04f`  | Progress bars, GW badges, positive signals |
| `--color-gold`        | `#f5c518`  | Winner highlight, consistency badges       |

---

## 3. Typography

- **Font family**: [Inter](https://fonts.google.com/specimen/Inter) — imported from Google Fonts CDN
- **Fallback**: `system-ui, sans-serif`
- **Weights used**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800
  (extrabold), 900 (black)

### Scale

| Role          | Size                        | Weight |
|---------------|-----------------------------|--------|
| Hero heading  | `clamp(3rem, 8vw, 5.5rem)` | 900    |
| Section title | `clamp(1.8rem, 4vw, 2.4rem)` | 800  |
| Card title    | `1.1rem`                    | 700    |
| Body          | `0.9rem`                    | 400    |
| Helper/meta   | `0.8rem`                    | 500    |
| Badge/label   | `0.72rem`                   | 700    |

---

## 4. Spacing & Radius

| Token         | Value   | Usage                          |
|---------------|---------|--------------------------------|
| `--radius-sm` | `8px`   | Buttons, small elements        |
| `--radius-md` | `16px`  | Cards (inner), badges          |
| `--radius-lg` | `24px`  | Cards (outer)                  |
| `--radius-xl` | `32px`  | Hero sections                  |
| pill          | `100px` | CTAs, nav links, filter buttons|

---

## 5. Component Architecture — Non-Negotiable

### File Separation

Every Web Component **must** be split into separate files:

```
src/components/<name>/
├── <name>.ts     ← logic only: event listeners, imports, class definition
├── <name>.html   ← HTML template (static components)
└── <name>.css    ← component-scoped styles
```

SVG assets live in `src/assets/crests/` and are imported with `?raw`.

### Import Suffixes (Vite)

```typescript
import template from './component.html?raw';       // HTML string
import styles   from './component.css?inline';     // CSS string (no injection)
import crest    from '../../assets/crests/x.svg?raw'; // SVG markup string
```

### No Embedded Strings

**Never** write HTML, CSS, or SVG as template literal strings inside `.ts` files.
Doing so defeats IDE syntax highlighting, linting, and formatting.

> ✅ `import template from './home-page.html?raw';`
> ❌ `const template = html\`<div class="home">...</div>\``

### Dynamic Components

Components that generate HTML from runtime state (e.g. `analysis-page`, `results-page`) may
keep template-builder *functions* in TypeScript, but must still import CSS and SVG externally.

---

## 6. Glassmorphism Pattern

For sticky/floating surfaces (nav, modals):

```css
background: rgba(8, 8, 18, 0.85);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
```

---

## 7. Background Orbs

Ambient glow orbs behind hero sections:

```css
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
}
```

Use `--color-arsenal` and `--color-spurs` for the two orb colours on the home hero.

---

## 8. Interaction Patterns

### Buttons

| Variant     | Style                                                  |
|-------------|--------------------------------------------------------|
| Primary CTA | `linear-gradient(135deg, #ef0107, #b30000)`, pill shape|
| Ghost       | `rgba(255,255,255,0.05)` + subtle border               |
| Outline     | Transparent + `--color-arsenal` border                 |

All buttons: `transition: transform 0.2s, box-shadow 0.2s` and `:hover` lifts `translateY(-2px)`.

### Focus styles

All interactive elements must have:
```css
:focus-visible {
  outline: 2px solid #ef0107;
  outline-offset: 2-3px;
}
```

### Slider

The AHP preference slider uses:
- A custom track with neutral zone and team-coloured intensity ends.
- `step="0.1"` for a smooth, fractional experience.
- A football ⚽ SVG thumb.
- `aria-live="polite"` on the label element for screen reader announcements.

### Session History

Completed analyses are persisted to `localStorage` as `SessionRecord` objects.
- Limit: 50 most recent sessions.
- Displays relative time (e.g. "2 hours ago") and simplified OVP bars.
- Supports individual deletion or clearing all.

---

Instead of a direct "Outcome A vs Outcome B" pairwise comparison, each step is framed as:
**"Who do you want to win this specific match?"**

The engine maps these preferences to season-level goals using a **4-Way Beneficiary Logic**:

| Outcome Category | Seasonal Goal | Primary Beneficiaries |
|-----------------|---------------|----------------------|
| **Title Race**  | Arsenal Title | Arsenal Wins / City Losses |
| **Title Race**  | City Title    | City Wins / Arsenal Losses |
| **Relegation**  | Spurs Survive | Spurs Wins / Rival Losses |
| **Relegation**  | Spurs Relegated | Spurs Losses / Rival Wins |

Matches with no impact are marked as `neither`. Many matches contribute to multiple destinations (e.g. an Arsenal win might help both the Arsenal Title and Spurs Survival by taking points off a relegation rival). The AHP engine balances these weights to determine the user's ultimate priority across the 4-destination reality.

---

## 10. Animation Tokens

| Animation  | Usage                                | Duration |
|------------|--------------------------------------|----------|
| `slideIn`  | Card entrance on step render         | 300ms    |
| `fadeUp`   | Verdict title and subtitle on results| 500ms    |
| `popIn`    | Winning crest on results page        | 400ms    |
| Step exit  | Fade + translate on step transition  | 180ms    |
| OVP bars   | Width transition via `requestAnimationFrame` | 800ms |

---

## 10. Development Preferences

- **No npm on host** — all commands run inside the Node.js v25 container via `make` targets.
- **Vite for dev** — `make run-dev` starts the Vite server at `localhost:5173`.
- **Zero build libraries** — no React, Vue, Angular, or other framework dependencies.
- **AHP logic is DOM-free** — `src/core/ahp/ahp.ts` and `matches-data.ts` have no browser imports
  and are testable in pure Node.js with `make test`.
- **Match data is a data file** — update `src/core/ahp/matches-data.ts` to change fixtures; do not
  hardcode data elsewhere.
