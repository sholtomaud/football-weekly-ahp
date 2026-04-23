# Football Weekly AHP — The Ultimate Dilemma

**Football Weekly AHP** is a decision-support tool built for listeners of the *Guardian’s Football Weekly podcast*. It uses the **Analytic Hierarchy Process (AHP)** to help fans resolve the ultimate end-of-season dilemma:

> **"If you had to choose, would you rather see Arsenal win the Premier League title, or Tottenham Hotspur get relegated?"**

Built on the minimalist **Boba Web Components** framework, this app maps your match-by-match preferences to these high-stakes season outcomes using linear algebraic decision logic.

## 🏆 The Scenario (2025–26)

The application is tuned to the specific standings of the 2025–26 season run-in:
- **The Title Race**: Man City and Arsenal are level on points at the top.
- **The Trapdoor**: Spurs are in 18th place, fighting West Ham (17th) to stay in the Premier League.
- **The Fixtures**: 15 critical matches across Gameweeks 34–38, including a high-stakes "Conflict Match" (West Ham vs Arsenal).

## 🧠 How it Works: The AHP Engine

Unlike a simple poll, the AHP engine uses **Pairwise Analysis** to discover your subconscious priorities:
1. **Match-Level Preferences**: You are asked "Who do you want to win this match?" for 15 key fixtures.
2. **Saaty Scale Mapping**: Your slider position (e.g., "Strongly want Wolves to win") is mapped to a mathematical weight (1 to 9).
3. **Beneficiary Matrix**: Each match is tagged with the season outcome it helps (e.g., a City loss helps Arsenal’s title; a Spurs loss helps their relegation).
4. **Consistency Ratio (CR)**: The engine detects if your choices are logically consistent or contradictory.
5. **Overall Vector of Priority (OVP)**: The final result shows the relative strength of your preference for the two storylines.

## 🛠 Tech Stack

- **Core**: Vanilla Web Components (via `BaseComponent`).
- **Logic**: Pure TypeScript AHP Engine.
- **Pipeline**: Vite for local dev, GitHub Actions for Pages deployment.
- **Workflow**: Native Node.js v25+ type stripping (no transpile).
- **Tooling**: Apple Container CLI (all execution runs inside a container).

## 🚀 Development Workflow

This project enforces a **container-first** workflow. You must use the provided `make` targets.

### Getting Started

1. **Build the Environment**:
   ```bash
   make build
   ```

2. **Run Dev Server**:
   ```bash
   make run-dev
   # Serves at http://localhost:5173/football-weekly-ahp/
   ```

3. **Run Tests**:
   ```bash
   make test
   ```

### Critical Commands

| Target | Description |
| :--- | :--- |
| `make install` | Update dependencies in the named volume |
| `make test` | Run engine unit tests and narrative scenarios |
| `make e2e` | Run Playwright E2E tests in the container |
| `make shell` | Jump into the container for debugging |

## 🧪 Verification

Before committing, ensure all scenarios pass:
- **Pure Title preference**: Validates that wanting City to lose and Arsenal to win yields an Arsenal result.
- **Pure Relegation preference**: Validates that wanting Spurs' opponents to win yields a Spurs result.
- **Conflict Handling**: Validates the tiebreak logic in the West Ham vs Arsenal match.

## 📈 Deployment

The app is automatically deployed to GitHub Pages on every push to `main`.
**Base URL**: `https://<user>.github.io/football-weekly-ahp/`

---
*Created for the Football Weekly community. Not affiliated with The Guardian.*
