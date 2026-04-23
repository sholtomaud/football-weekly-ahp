/**
 * AHP Scenario Tests — Expected Outcome Validation
 *
 * Slider conventions (v ∈ [-4, 4]):
 *   v < 0  → prefer HOME team to win
 *   v > 0  → prefer AWAY team to win
 *   v = 0  → no preference
 *
 * Real 2025-26 fixture map (15 matches):
 *   GW34:
 *    0  Wolves vs Tottenham (Apr 26)     arsenal: neither, spurs: HOME(Wolves)
 *   GW35:
 *    1  Arsenal vs Fulham (May 3)        arsenal: HOME(Arsenal), spurs: neither
 *    2  Aston Villa vs Tottenham (May 5) arsenal: neither, spurs: HOME(Aston Villa)
 *    3  Everton vs Man City (May 5)      arsenal: HOME(Everton), spurs: neither
 *   GW36:
 *    4  Man City vs Brentford (May 10)   arsenal: AWAY(Brentford), spurs: neither
 *    5  West Ham vs Arsenal (May 12) ⚡  arsenal: AWAY(Arsenal), spurs: HOME(West Ham) — CONFLICT
 *    6  Tottenham vs Leeds (May 12)      arsenal: neither, spurs: AWAY(Leeds)
 *   GW37:
 *    7  Bournemouth vs Man City (May 18) arsenal: HOME(Bournemouth), spurs: neither
 *    8  Arsenal vs Burnley (May 18)      arsenal: HOME(Arsenal), spurs: neither
 *    9  Chelsea vs Tottenham (May 18)    arsenal: neither, spurs: HOME(Chelsea)
 *   10  Newcastle vs West Ham (May 18)   arsenal: neither, spurs: AWAY(West Ham)
 *   GW38 — Final Day:
 *   11  Crystal Palace vs Arsenal        arsenal: AWAY(Arsenal), spurs: neither
 *   12  Man City vs Aston Villa          arsenal: AWAY(Aston Villa), spurs: neither
 *   13  Tottenham vs Everton             arsenal: neither, spurs: AWAY(Everton)
 *   14  West Ham vs Leeds                arsenal: neither, spurs: HOME(West Ham)
 *
 * ⚡ CONFLICT (match 5 — West Ham vs Arsenal):
 *   Sliding towards Arsenal (AWAY, positive) helps the title but costs West Ham points.
 *   Sliding towards West Ham (HOME, negative) keeps West Ham safe (helps relegation)
 *   but gives nothing to the Arsenal title.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AHPEngine } from '../src/core/ahp/ahp.ts';
import { REMAINING_MATCHES } from '../src/core/ahp/matches-data.ts';

// ── Helper ─────────────────────────────────────────────────────────────────

function runScenario(
  sliderValues: number[],
  descriptions: string[]
): ReturnType<AHPEngine['compute']> & { trace: string } {
  assert.equal(
    sliderValues.length,
    REMAINING_MATCHES.length,
    `Need exactly ${REMAINING_MATCHES.length} slider values, got ${sliderValues.length}`
  );

  const engine = new AHPEngine();
  engine.setMatches(REMAINING_MATCHES);
  sliderValues.forEach((v, i) => engine.setSliderValue(i, v));
  const result = engine.compute();

  const lines = ['', '  Scenario breakdown:'];
  REMAINING_MATCHES.forEach((m, i) => {
    const v = sliderValues[i];
    const desc = descriptions[i] ?? '—';
    const saaty = (1 + 2 * Math.abs(v)).toFixed(1);
    const helps = [];
    if (m.helpsArsenalTitle !== 'neither')   helps.push('A');
    if (m.helpsCityTitle !== 'neither')      helps.push('C');
    if (m.helpsSpursRelegated !== 'neither') helps.push('R');
    if (m.helpsSpursSurvive !== 'neither')   helps.push('S');
    const tags = helps.length > 0 ? ` [${helps.join('')}]` : '';

    lines.push(
      `  [${String(i).padStart(2)}] ${m.label.padEnd(38)} v=${String(v).padEnd(5)} (${saaty})${tags} → ${desc}`
    );
  });

  const a = result.rankedAlternatives.find(x => x.key === 'arsenal-title');
  const r = result.rankedAlternatives.find(x => x.key === 'spurs-relegated');
  const s = result.rankedAlternatives.find(x => x.key === 'spurs-survive');
  const c = result.rankedAlternatives.find(x => x.key === 'city-title');
  lines.push(
    `  Result: ${result.preferred} | ` +
    `Ars ${((a?.score ?? 0) * 100).toFixed(1)}% | ` +
    `City ${((c?.score ?? 0) * 100).toFixed(1)}% | ` +
    `Rel ${((r?.score ?? 0) * 100).toFixed(1)}% | ` +
    `Surv ${((s?.score ?? 0) * 100).toFixed(1)}% | ` +
    `CR ${result.consistencyRatio.toFixed(3)}`
  );

  return { ...result, trace: lines.join('\n') };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Scenario: Pure Arsenal Title preference', () => {
  /**
   * Want Arsenal to win all their matches AND Man City to drop points.
   * Spurs/West Ham matches = neutral (0).
   * Expected: arsenal-title, high confidence.
   */
  it('should return arsenal-title', () => {
    const sliders = [
       0,  //  0  Wolves vs Tottenham     — neutral
      -4,  //  1  Arsenal vs Fulham       — want Arsenal (HOME)  → Arsenal title ✓
       0,  //  2  Villa vs Tottenham      — neutral
      -4,  //  3  Everton vs Man City     — want Everton (HOME) beat City → Arsenal title ✓
       4,  //  4  Man City vs Brentford   — want Brentford (AWAY) beat City → Arsenal title ✓
       4,  //  5  West Ham vs Arsenal ⚡  — want Arsenal (AWAY) → Arsenal title ✓
       0,  //  6  Tottenham vs Leeds      — neutral
      -4,  //  7  Bournemouth vs Man City — want Bournemouth (HOME) beat City → Arsenal title ✓
      -4,  //  8  Arsenal vs Burnley      — want Arsenal (HOME) → Arsenal title ✓
       0,  //  9  Chelsea vs Tottenham    — neutral
       0,  // 10  Newcastle vs West Ham   — neutral
       4,  // 11  Palace vs Arsenal       — want Arsenal (AWAY) Final Day → Arsenal title ✓
       4,  // 12  Man City vs Aston Villa — want Villa (AWAY) beat City → Arsenal title ✓
       0,  // 13  Tottenham vs Everton    — neutral
       0,  // 14  West Ham vs Leeds       — neutral
    ];
    const result = runScenario(sliders, [
      'Neutral',
      'Want Arsenal to win → Arsenal title ✓',
      'Neutral',
      'Want Everton to beat City → Arsenal title ✓',
      'Want Brentford to beat City → Arsenal title ✓',
      'Want Arsenal to win away ⚡ → Arsenal title ✓ (West Ham lose)',
      'Neutral',
      'Want Bournemouth to beat City → Arsenal title ✓',
      'Want Arsenal to win → Arsenal title ✓',
      'Neutral',
      'Neutral',
      'Want Arsenal to win Final Day → Arsenal title ✓',
      'Want Villa to beat City → Arsenal title ✓',
      'Neutral',
      'Neutral',
    ]);
    console.log(result.trace);
    assert.equal(result.preferred, 'arsenal-title');
  });

  it('should have very high confidence (>70%)', () => {
    const sliders = [0, -4, 0, -4, 4, 4, 0, -4, -4, 0, 0, 4, 4, 0, 0];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    sliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    assert.ok(result.confidencePercent > 70, `Expected >70% but got ${result.confidencePercent}%`);
  });
});

describe('Scenario: Pure Spurs Survive preference', () => {
  it('should return spurs-survive when maximizing spurs win/rival loss', () => {
    const sliders = [
       4,  //  0  Wolves vs Spurs     → want Spurs win ✓
       0,  //  1  Arsenal vs Fulham
       4,  //  2  Villa vs Spurs      → want Spurs win ✓
       0,  //  3  Everton vs City
       0,  //  4  Man City vs Brentford
       4,  //  5  West Ham vs Arsenal → want Arsenal win ✓ (hurts West Ham pts)
      -4,  //  6  Spurs vs Leeds      → want Spurs win ✓
       0,  //  7  Bournemouth vs City
       0,  //  8  Arsenal vs Burnley
       4,  //  9  Chelsea vs Spurs    → want Spurs win ✓
      -4,  // 10  Newcastle vs WHam   → want Newcastle win ✓ (West Ham drop pts)
       0,  // 11  Palace vs Arsenal
       0,  // 12  Man City vs Villa
      -4,  // 13  Spurs vs Everton    → want Spurs win ✓
       4,  // 14  West Ham vs Leeds   → want Leeds win ✓ (West Ham drop pts)
    ];
    const result = runScenario(sliders, Array(15).fill('Spurs survival focus'));
    console.log(result.trace);
    assert.equal(result.preferred, 'spurs-survive');
  });
});

describe('Scenario: Pure Spurs Relegated preference', () => {
  it('should return spurs-relegated', () => {
    const sliders = [
      -4,  //  0  Wolves vs Tottenham     → want Wolves (HOME) to win → Spurs relegated ✓
       0,  //  1  Arsenal vs Fulham       — neutral
      -4,  //  2  Villa vs Tottenham      — want Villa (HOME) to win → Spurs relegated ✓
       0,  //  3  Everton vs Man City     — neutral
       0,  //  4  Man City vs Brentford   — neutral
      -4,  //  5  West Ham vs Arsenal ⚡  — want West Ham (HOME) → keeps them safe → Spurs relegated ✓
       4,  //  6  Tottenham vs Leeds      — want Leeds (AWAY) → Spurs relegated ✓
       0,  //  7  Bournemouth vs Man City — neutral
       0,  //  8  Arsenal vs Burnley      — neutral
      -4,  //  9  Chelsea vs Tottenham    — want Chelsea (HOME) → Spurs relegated ✓
       4,  // 10  Newcastle vs West Ham   — want West Ham (AWAY) to win → Spurs safe → relegated ✓
       0,  // 11  Palace vs Arsenal       — neutral
       0,  // 12  Man City vs Aston Villa — neutral
       4,  // 13  Tottenham vs Everton    — want Everton (AWAY) → Spurs relegated ✓
      -4,  // 14  West Ham vs Leeds       — want West Ham (HOME) → safe → Spurs relegated ✓
    ];
    const result = runScenario(sliders, Array(15).fill('Relegation focus'));
    console.log(result.trace);
    assert.equal(result.preferred, 'spurs-relegated');
  });
});

describe('Scenario: All neutral (no preference)', () => {
  it('should return equal when all sliders are 0', () => {
    const sliders = Array(REMAINING_MATCHES.length).fill(0);
    const result = runScenario(sliders, sliders.map(() => 'No preference'));
    console.log(result.trace);
    assert.equal(result.preferred, 'equal');
  });
});

describe('Scenario: Balanced equal-magnitude → equal (mathematically correct)', () => {
  /**
   * When Arsenal-title matches and Spurs-relegated matches are rated at the
   * same absolute magnitude AND matched for count, the AHP produces exactly 50/50.
   *
   * Here we rate 8 Arsenal matches at magnitude 4 and 7 Spurs matches at 4 too
   * — but the conflict match (5) is the tiebreaker: sliding towards Arsenal (AWAY).
   * That means Arsenal-title gets an extra contribution via the conflict match.
   *
   * With 8 Arsenal "votes" vs 7 Spurs "votes" (all equal weight), Arsenal edges it.
   */
  it('conflict match tiebreaker: when all equal, the conflict match slides determine the winner', () => {
    // All non-conflict Arsenal matches + Spurs matches at same magnitude
    const arsenalFirstSliders = [
       0,  //  0  Wolves–Spurs         (no arsenal preference)
      -4,  //  1  Arsenal vs Fulham    → arsenal
       0,  //  2  Villa–Spurs          (no arsenal preference)
      -4,  //  3  Everton vs City      → arsenal (home)
       4,  //  4  City vs Brentford    → arsenal (away)
       4,  //  5  West Ham vs Arsenal ⚡ → ARSENAL (away) — conflict, picks arsenal
       0,  //  6  Spurs–Leeds          (no arsenal preference)
      -4,  //  7  Bournemouth vs City  → arsenal (home)
      -4,  //  8  Arsenal vs Burnley   → arsenal
       0,  //  9  Chelsea–Spurs        (no arsenal preference)
       0,  // 10  Newcastle–West Ham   (no arsenal preference)
       4,  // 11  Palace vs Arsenal    → arsenal (away)
       4,  // 12  City vs Villa        → arsenal (away)
       0,  // 13  Spurs vs Everton     (no arsenal preference)
       0,  // 14  West Ham vs Leeds    (no arsenal preference)
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    arsenalFirstSliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Conflict → Arsenal: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'arsenal-title',
      'Arsenal-facing conflict match breaks a potential tie in Arsenal\'s favour');
  });

  it('conflict match tiebreaker: sliding conflict towards West Ham tips the balance toward spurs', () => {
    const spursFirstSliders = [
      -4,  //  0  Wolves–Spurs         →  spurs relegated (Wolves home)
       0,  //  1  Arsenal vs Fulham    (no spurs preference)
      -4,  //  2  Villa–Spurs          →  spurs relegated (Villa home)
       0,  //  3  Everton vs City      (no spurs preference)
       0,  //  4  City vs Brentford    (no spurs preference)
      -4,  //  5  West Ham vs Arsenal ⚡ → WEST HAM (home) — keeps them safe → spurs relegated
       4,  //  6  Spurs–Leeds          →  spurs relegated (Leeds away)
       0,  //  7  Bournemouth vs City  (no spurs preference)
       0,  //  8  Arsenal vs Burnley   (no spurs preference)
      -4,  //  9  Chelsea–Spurs        →  spurs relegated (Chelsea home)
       4,  // 10  Newcastle–West Ham   →  spurs relegated (West Ham away win)
       0,  // 11  Palace vs Arsenal    (no spurs preference)
       0,  // 12  City vs Villa        (no spurs preference)
       4,  // 13  Spurs vs Everton     →  spurs relegated (Everton away)
      -4,  // 14  West Ham vs Leeds    →  spurs relegated (West Ham home)
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    spursFirstSliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Conflict → West Ham: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'spurs-relegated',
      'West Ham-facing conflict match breaks the tie in Spurs relegated\'s favour');
  });
});

describe('Scenario: Matches data integrity', () => {
  it('should have 15 matches (GW34–GW38)', () => {
    assert.equal(REMAINING_MATCHES.length, 15);
  });

  it('exactly one conflict match between Title and Relegated', () => {
    const conflicts = REMAINING_MATCHES.filter(
      m => m.helpsArsenalTitle !== 'neither' && m.helpsSpursRelegated !== 'neither'
    );
    assert.equal(conflicts.length, 1,
      `Expected 1 conflict match, found: ${conflicts.map(m => m.id).join(', ')}`);
    assert.equal(conflicts[0].id, 'gw36-west-ham-arsenal');
  });

  it('seven Arsenal-title matches (excl. conflict)', () => {
    const count = REMAINING_MATCHES.filter(
      m => m.helpsArsenalTitle !== 'neither' && m.helpsSpursRelegated === 'neither'
    ).length;
    assert.equal(count, 7,
      'Should have 7 pure Arsenal-title matches (conflict match counted separately)');
  });

  it('seven Spurs-relegated matches (excl. conflict)', () => {
    const count = REMAINING_MATCHES.filter(
      m => m.helpsSpursRelegated !== 'neither' && m.helpsArsenalTitle === 'neither'
    ).length;
    assert.equal(count, 7,
      'Should have 7 pure Spurs-relegated matches (conflict match counted separately)');
  });

  it('all matches have valid dates from Apr 2026 onward', () => {
    const cutoff = new Date('2026-04-25').getTime();
    for (const m of REMAINING_MATCHES) {
      const d = new Date(m.date).getTime();
      assert.ok(d >= cutoff, `${m.id}: date ${m.date} is before Apr 25 2026`);
    }
  });
});

describe('Scenario: Wrong direction (contradictory inputs)', () => {
  it('sliding toward Spurs WINNING their matches suppresses spurs-relegated score', () => {
    // Arsenal matches at full strength (positive), but SPURS matches at WRONG direction (home)
    const sliders = [
      -4,  //  0  Wolves vs Spurs: want Wolves home → ✓ Spurs relegated (correct)
      -4,  //  1  Arsenal vs Fulham: want Arsenal home → ✓ Arsenal title
      -4,  //  2  Villa vs Spurs: want Villa home → ✓ Spurs relegated (correct)
      -4,  //  3  Everton vs City: want Everton home → ✓ Arsenal title
       4,  //  4  City vs Brentford: want Brentford away → ✓ Arsenal title
       4,  //  5  West Ham vs Arsenal: want Arsenal away → ✓ Arsenal title (✗ conflict match, West Ham loses)
      -4,  //  6  Spurs vs Leeds: want SPURS (HOME) to win → ✗ HURTS Spurs relegated
      -4,  //  7  Bournemouth vs City: want Bournemouth home → ✓ Arsenal title
      -4,  //  8  Arsenal vs Burnley: want Arsenal home → ✓ Arsenal title
      -4,  //  9  Chelsea vs Spurs: want SPURS to win (HOME!) → ✗ HURTS Spurs relegated
       4,  // 10  Newcastle vs WHam: want West Ham away → ✓ Spurs relegated (correct)
       4,  // 11  Palace vs Arsenal: want Arsenal away → ✓ Arsenal title
       4,  // 12  City vs Villa: want Villa away → ✓ Arsenal title
      -4,  // 13  Spurs vs Everton: want SPURS (HOME) to win → ✗ HURTS Spurs relegated
       4,  // 14  West Ham vs Leeds: want Leeds (AWAY) → ✗ HURTS Spurs relegated (West Ham need to win)
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    sliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Contradiction: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'arsenal-title',
      'Arsenal consistently expressed → arsenal-title expected despite Spurs match contradictions');
    const spursAlt = result.rankedAlternatives.find(a => a.key === 'spurs-relegated');
    assert.ok(
      (spursAlt?.score ?? 1) < 0.4,
      `Spurs relegated score should be suppressed when many Spurs match sliders are wrong direction, got ${((spursAlt?.score ?? 0) * 100).toFixed(1)}%`
    );
  });
});
